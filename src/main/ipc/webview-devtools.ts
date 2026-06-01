import { app, WebContents, BrowserWindow } from 'electron'

/**
 * Captures console + network of every <webview> (the live preview) straight from
 * its webContents via the Chrome DevTools Protocol — the same source DevTools uses.
 *
 * This is independent of the page's contextIsolation/sandbox settings and captures
 * EVERYTHING (console API, uncaught errors, fetch/XHR and resource requests),
 * unlike monkey-patching `console`/`fetch` inside a preload.
 *
 * Captured events are forwarded to the host window renderer through the
 * `webview-console` / `webview-network` IPC channels, and also kept in an
 * in-memory ring buffer so the Browser MCP (browser-bridge.ts) can read them.
 */

const MAX_BODY = 64 * 1024 // cap stored response bodies to keep memory sane
const BUFFER_MAX = 2000    // ring buffer size for console / network

export interface CapturedConsole {
  id: number
  ts: number
  level: string
  data: string
}

export interface CapturedNetwork {
  id: number
  ts: number
  url: string
  method: string
  status: number
  statusText: string
  payload: string | null
  response: string
  duration: number
}

const consoleBuffer: CapturedConsole[] = []
const networkBuffer: CapturedNetwork[] = []
let consoleSeq = 0
let networkSeq = 0

// The preview webview currently driven by the user. Used by the Browser MCP to
// navigate the internal browser.
let activeWebview: WebContents | null = null

function pushConsole(entry: { level: string; data: string }) {
  const rec: CapturedConsole = { id: ++consoleSeq, ts: Date.now(), ...entry }
  consoleBuffer.push(rec)
  if (consoleBuffer.length > BUFFER_MAX) consoleBuffer.shift()
  return rec
}

function pushNetwork(entry: Omit<CapturedNetwork, 'id' | 'ts'>) {
  const rec: CapturedNetwork = { id: ++networkSeq, ts: Date.now(), ...entry }
  networkBuffer.push(rec)
  if (networkBuffer.length > BUFFER_MAX) networkBuffer.shift()
  return rec
}

/** Accessors used by the Browser MCP bridge. */
export const browserCapture = {
  getConsole(limit?: number, level?: string): CapturedConsole[] {
    let out = consoleBuffer
    if (level && level !== 'all') out = out.filter(l => l.level === level)
    return typeof limit === 'number' ? out.slice(-limit) : out.slice()
  },
  /** Lightweight list (no payload/response bodies) for "list APIs". */
  listNetwork(limit?: number): Array<Omit<CapturedNetwork, 'payload' | 'response'>> {
    const out = typeof limit === 'number' ? networkBuffer.slice(-limit) : networkBuffer.slice()
    return out.map(({ payload, response, ...rest }) => rest)
  },
  getNetworkById(id: number): CapturedNetwork | undefined {
    return networkBuffer.find(n => n.id === id)
  },
  getActiveWebview(): WebContents | null {
    return activeWebview && !activeWebview.isDestroyed() ? activeWebview : null
  },
  clearConsole() { consoleBuffer.length = 0 },
  clearNetwork() { networkBuffer.length = 0 },
}

interface PendingRequest {
  url: string
  method: string
  payload: string | null
  start: number
  status: number
  statusText: string
  type: string
}

// We only care about API calls — fetch() and XMLHttpRequest. Documents, images,
// media, scripts, stylesheets, fonts, etc. are noise for this use case.
const API_RESOURCE_TYPES = new Set(['XHR', 'Fetch'])

function levelFromConsoleType(type: string): string {
  switch (type) {
    case 'error':   return 'error'
    case 'warning': return 'warn'
    case 'info':    return 'info'
    case 'debug':   return 'debug'
    default:        return 'log'
  }
}

// Builds a readable string from a CDP RemoteObject (best-effort, like DevTools).
function stringifyRemoteObject(obj: any): string {
  if (!obj) return ''
  if (obj.type === 'undefined') return 'undefined'
  if (obj.type === 'string') return obj.value ?? obj.description ?? ''
  if (obj.type === 'number' || obj.type === 'boolean') return String(obj.value ?? obj.description ?? '')
  if (obj.type === 'function') return obj.description || 'function'
  if (obj.subtype === 'null') return 'null'

  // Objects / arrays / errors → use the preview when available
  if (obj.preview) {
    const p = obj.preview
    if (p.subtype === 'error' || obj.subtype === 'error') {
      return obj.description || p.description || 'Error'
    }
    const props = (p.properties || [])
      .map((prop: any) => {
        const val = prop.type === 'string' ? `"${prop.value}"` : prop.value
        return p.subtype === 'array' ? val : `${prop.name}: ${val}`
      })
      .join(', ')
    const overflow = p.overflow ? ', …' : ''
    return p.subtype === 'array' ? `[${props}${overflow}]` : `{${props}${overflow}}`
  }

  return obj.description ?? String(obj.value ?? '')
}

export function registerWebviewDevtools(getHostWindow: () => BrowserWindow | null): void {
  const attached = new Set<number>()

  app.on('web-contents-created', (_event, contents: WebContents) => {
    if (contents.getType() !== 'webview') return
    if (attached.has(contents.id)) return
    attached.add(contents.id)

    // This webview becomes the active internal browser for the Browser MCP.
    activeWebview = contents
    contents.on('did-navigate', () => { activeWebview = contents })
    contents.on('focus', () => { activeWebview = contents })

    const sendToHost = (channel: string, payload: any) => {
      const host = getHostWindow()
      if (host && !host.isDestroyed()) host.webContents.send(channel, payload)
    }

    const requests = new Map<string, PendingRequest>()

    const dbg = contents.debugger

    const attach = () => {
      if (dbg.isAttached()) return
      try {
        dbg.attach('1.3')
        dbg.sendCommand('Runtime.enable').catch(() => {})
        dbg.sendCommand('Network.enable', { maxTotalBufferSize: 10_000_000, maxResourceBufferSize: 5_000_000 }).catch(() => {})
      } catch (err) {
        // Debugger slot is taken (e.g. DevTools open). Capture resumes once it frees.
        console.warn('[webview-devtools] could not attach debugger:', (err as Error)?.message)
      }
    }

    attach()

    // The CDP debugger and Chrome DevTools share a single debug client. Release
    // ours while the user inspects with DevTools, then reattach when they close it.
    contents.on('devtools-opened', () => {
      try { if (dbg.isAttached()) dbg.detach() } catch {}
    })
    contents.on('devtools-closed', () => attach())

    dbg.on('message', async (_e, method, params: any) => {
      try {
        if (method === 'Runtime.consoleAPICalled') {
          const data = (params.args || []).map(stringifyRemoteObject).join(' ')
          const entry = { level: levelFromConsoleType(params.type), data }
          pushConsole(entry)
          sendToHost('webview-console', entry)
          return
        }

        if (method === 'Runtime.exceptionThrown') {
          const det = params.exceptionDetails || {}
          const data =
            det.exception?.description ||
            det.text ||
            'Uncaught exception'
          const entry = { level: 'error', data }
          pushConsole(entry)
          sendToHost('webview-console', entry)
          return
        }

        if (method === 'Network.requestWillBeSent') {
          // Skip anything that isn't an API call as early as possible.
          if (params.type && !API_RESOURCE_TYPES.has(params.type)) return
          const req = params.request || {}
          requests.set(params.requestId, {
            url: req.url,
            method: req.method || 'GET',
            payload: typeof req.postData === 'string' ? req.postData : null,
            start: Date.now(),
            status: 0,
            statusText: '',
            type: params.type || '',
          })
          return
        }

        if (method === 'Network.responseReceived') {
          const entry = requests.get(params.requestId)
          if (entry) {
            entry.status = params.response?.status ?? 0
            entry.statusText = params.response?.statusText || ''
            if (params.type) entry.type = params.type
            // Resource type sometimes only resolves here — drop non-API now.
            if (entry.type && !API_RESOURCE_TYPES.has(entry.type)) {
              requests.delete(params.requestId)
            }
          }
          return
        }

        if (method === 'Network.loadingFinished') {
          const entry = requests.get(params.requestId)
          if (!entry) return
          requests.delete(params.requestId)
          if (!API_RESOURCE_TYPES.has(entry.type)) return

          let response = ''
          try {
            const body: any = await dbg.sendCommand('Network.getResponseBody', { requestId: params.requestId })
            response = body?.base64Encoded ? '[Binary response]' : (body?.body || '')
            if (response.length > MAX_BODY) response = response.slice(0, MAX_BODY) + '\n…[truncated]'
          } catch {
            response = ''
          }

          const net = {
            url: entry.url,
            method: entry.method,
            status: entry.status,
            statusText: entry.statusText,
            payload: entry.payload,
            response,
            duration: Date.now() - entry.start,
          }
          pushNetwork(net)
          sendToHost('webview-network', net)
          return
        }

        if (method === 'Network.loadingFailed') {
          const entry = requests.get(params.requestId)
          if (!entry) return
          requests.delete(params.requestId)
          const failType = params.type || entry.type
          if (failType && !API_RESOURCE_TYPES.has(failType)) return
          const net = {
            url: entry.url,
            method: entry.method,
            status: 0,
            statusText: params.errorText || 'Network Error',
            payload: entry.payload,
            response: '',
            duration: Date.now() - entry.start,
          }
          pushNetwork(net)
          sendToHost('webview-network', net)
        }
      } catch (err) {
        console.warn('[webview-devtools] error handling CDP message:', (err as Error)?.message)
      }
    })

    contents.on('destroyed', () => {
      attached.delete(contents.id)
      requests.clear()
      if (activeWebview === contents) activeWebview = null
      try {
        if (dbg.isAttached()) dbg.detach()
      } catch {}
    })
  })
}
