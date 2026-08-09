import http from 'node:http'
import { BrowserWindow } from 'electron'
import { browserCapture } from './webview-devtools'

/**
 * Tiny localhost HTTP bridge between the running app and the Browser MCP process.
 *
 * The MCP server (src/mcp/browser-server) is a separate Node process spawned by
 * the coding agent; it cannot reach Electron directly, so it talks to this bridge
 * to read the preview's console/network buffers and to drive navigation of the
 * internal browser (the active <webview>).
 *
 * Fixed loopback port — single-window local IDE, no discovery needed.
 */
export const BROWSER_BRIDGE_PORT = 47695

function sendJson(res: http.ServerResponse, status: number, body: any) {
  const data = JSON.stringify(body)
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(data)
}

function readBody(req: http.IncomingMessage): Promise<any> {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (c) => { raw += c })
    req.on('end', () => {
      if (!raw) return resolve({})
      try { resolve(JSON.parse(raw)) } catch { resolve({}) }
    })
  })
}

async function ensureActiveWebview(): Promise<Electron.WebContents> {
  let wc = browserCapture.getActiveWebview()
  if (wc) return wc

  // Envia o sinal para iniciar o app no frontend
  const wins = BrowserWindow.getAllWindows()
  if (wins.length > 0 && !wins[0].isDestroyed()) {
    wins[0].webContents.send('browser-bridge:start-app')
  }

  // Aguarda até o webview ficar ativo (máximo 15 segundos)
  const startTime = Date.now()
  while (Date.now() - startTime < 15000) {
    await new Promise(resolve => setTimeout(resolve, 300))
    wc = browserCapture.getActiveWebview()
    if (wc && !wc.isDestroyed()) {
      return wc
    }
  }

  throw new Error('Nenhum preview ativo. O servidor de desenvolvimento falhou ao iniciar a tempo.')
}

export function startBrowserBridge(): void {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url || '/', `http://127.0.0.1:${BROWSER_BRIDGE_PORT}`)
      const seg = url.pathname.replace(/\/+$/, '').split('/').filter(Boolean) // e.g. ['network','12']

      // GET /health
      if (req.method === 'GET' && seg[0] === 'health') {
        return sendJson(res, 200, { ok: true, hasPreview: !!browserCapture.getActiveWebview() })
      }

      // POST /start
      if (req.method === 'POST' && seg[0] === 'start') {
        const wins = BrowserWindow.getAllWindows()
        if (wins.length > 0 && !wins[0].isDestroyed()) {
          wins[0].webContents.send('browser-bridge:start-app')
        }
        return sendJson(res, 200, { success: true })
      }

      // POST /stop
      if (req.method === 'POST' && seg[0] === 'stop') {
        const wins = BrowserWindow.getAllWindows()
        if (wins.length > 0 && !wins[0].isDestroyed()) {
          wins[0].webContents.send('browser-bridge:stop-app')
        }
        return sendJson(res, 200, { success: true })
      }

      // POST /git-refresh
      if (req.method === 'POST' && seg[0] === 'git-refresh') {
        const wins = BrowserWindow.getAllWindows()
        if (wins.length > 0 && !wins[0].isDestroyed()) {
          wins[0].webContents.send('browser-bridge:git-refresh')
        }
        return sendJson(res, 200, { success: true })
      }

      // GET /console?level=&limit=
      if (req.method === 'GET' && seg[0] === 'console') {
        const limit = url.searchParams.get('limit')
        const level = url.searchParams.get('level') || undefined
        const logs = browserCapture.getConsole(limit ? Number(limit) : undefined, level)
        return sendJson(res, 200, { logs })
      }

      // GET /network/:id  → full detail   |   GET /network → list
      if (req.method === 'GET' && seg[0] === 'network') {
        if (seg[1]) {
          const entry = browserCapture.getNetworkById(Number(seg[1]))
          if (!entry) return sendJson(res, 404, { error: `Requisição de rede com id ${seg[1]} não encontrada.` })
          return sendJson(res, 200, { request: entry })
        }
        const limit = url.searchParams.get('limit')
        return sendJson(res, 200, { requests: browserCapture.listNetwork(limit ? Number(limit) : undefined) })
      }

      // POST /eval  { code }  → run JS in the page (like the DevTools console)
      if (req.method === 'POST' && seg[0] === 'eval') {
        const body = await readBody(req)
        if (!body.code || typeof body.code !== 'string') {
          return sendJson(res, 400, { error: 'Parâmetro "code" é obrigatório.' })
        }
        let wc: Electron.WebContents
        try {
          wc = await ensureActiveWebview()
        } catch (err: any) {
          return sendJson(res, 503, { error: err.message })
        }
        try {
          const result = await wc.executeJavaScript(body.code, true)
          let serialized: string
          try {
            serialized = result === undefined ? 'undefined' : JSON.stringify(result, null, 2)
          } catch {
            serialized = String(result)
          }
          return sendJson(res, 200, { ok: true, result: serialized })
        } catch (err: any) {
          // A thrown script error is a valid result, not an HTTP failure.
          return sendJson(res, 200, { ok: false, error: err?.message || String(err) })
        }
      }

      // GET /screenshot  → PNG (base64) of the current preview viewport
      if (req.method === 'GET' && seg[0] === 'screenshot') {
        let wc: Electron.WebContents
        try {
          wc = await ensureActiveWebview()
        } catch (err: any) {
          return sendJson(res, 503, { error: err.message })
        }
        try {
          const img = await wc.capturePage()
          return sendJson(res, 200, { data: img.toPNG().toString('base64'), mimeType: 'image/png' })
        } catch (err: any) {
          return sendJson(res, 500, { error: `Falha ao capturar screenshot: ${err?.message || err}` })
        }
      }

      // POST /navigate  { url }
      if (req.method === 'POST' && seg[0] === 'navigate') {
        const body = await readBody(req)
        if (!body.url || typeof body.url !== 'string') {
          return sendJson(res, 400, { error: 'Parâmetro "url" é obrigatório.' })
        }
        let wc: Electron.WebContents
        try {
          wc = await ensureActiveWebview()
        } catch (err: any) {
          return sendJson(res, 503, { error: err.message })
        }
        let target: string
        try {
          // Resolve relative paths against the current preview URL.
          target = new URL(body.url, wc.getURL() || undefined).href
        } catch {
          return sendJson(res, 400, { error: `URL inválida: ${body.url}` })
        }
        try {
          await wc.loadURL(target)
        } catch (err: any) {
          // loadURL rejects on aborted loads (e.g. SPA redirects) even when it works.
          if (!/ERR_ABORTED/.test(err?.message || '')) {
            return sendJson(res, 500, { error: `Falha ao navegar: ${err?.message || err}` })
          }
        }
        return sendJson(res, 200, { ok: true, url: target })
      }

      sendJson(res, 404, { error: 'Rota não encontrada.' })
    } catch (err: any) {
      sendJson(res, 500, { error: err?.message || String(err) })
    }
  })

  server.on('error', (err: any) => {
    if (err?.code === 'EADDRINUSE') {
      console.warn(`[browser-bridge] porta ${BROWSER_BRIDGE_PORT} em uso — Browser MCP indisponível.`)
    } else {
      console.warn('[browser-bridge] erro:', err?.message || err)
    }
  })

  server.listen(BROWSER_BRIDGE_PORT, '127.0.0.1', () => {
    console.error(`[browser-bridge] ouvindo em http://127.0.0.1:${BROWSER_BRIDGE_PORT}`)
  })
}
