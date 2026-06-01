// Persistent buffer for the preview's console & network logs.
//
// Logs are captured in the main process (see src/main/ipc/webview-devtools.ts)
// and stream in through window.api.webview.* the entire time the app is open —
// regardless of whether the Console/Network tab is currently visible. They are
// only discarded when the user explicitly clears them.

export interface ConsoleLog {
  ts: number
  level: string
  data: string
}

export interface NetworkLog {
  ts: number
  url: string
  method: string
  status: number
  statusText: string
  payload: string | null
  response: string
  duration: number
}

const MAX = 2000

let consoleLogs: ConsoleLog[] = []
let networkLogs: NetworkLog[] = []

const consoleSubs = new Set<() => void>()
const networkSubs = new Set<() => void>()

function emitConsole() { consoleSubs.forEach(fn => fn()) }
function emitNetwork() { networkSubs.forEach(fn => fn()) }

let initialized = false
function init() {
  if (initialized) return
  if (typeof window === 'undefined' || !window.api?.webview) return
  initialized = true

  window.api.webview.onConsole((log) => {
    consoleLogs = [...consoleLogs, { ts: Date.now(), ...log }].slice(-MAX)
    emitConsole()
  })
  window.api.webview.onNetwork((log) => {
    networkLogs = [...networkLogs, { ts: Date.now(), ...log }].slice(-MAX)
    emitNetwork()
  })
}

// Start buffering as soon as this module is loaded (the panel statically imports it).
init()

export const devtoolsLogs = {
  // --- Console ---
  subscribeConsole(cb: () => void) {
    init()
    consoleSubs.add(cb)
    return () => consoleSubs.delete(cb)
  },
  getConsole() {
    return consoleLogs
  },
  clearConsole() {
    consoleLogs = []
    emitConsole()
  },

  // --- Network ---
  subscribeNetwork(cb: () => void) {
    init()
    networkSubs.add(cb)
    return () => networkSubs.delete(cb)
  },
  getNetwork() {
    return networkLogs
  },
  clearNetwork() {
    networkLogs = []
    emitNetwork()
  },
}
