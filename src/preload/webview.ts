import { ipcRenderer } from 'electron'

// Console e Rede do preview são capturados no processo principal via CDP
// (ver src/main/ipc/webview-devtools.ts).
//
// O inspector agora se comunica via executeJavaScript direto
// (window.__nikainspector), sem necessidade de ponte IPC.
// Este preload mantém apenas o shim de window.parent como fallback legado.

// Shim window.parent.postMessage → sendToHost (fallback para compatibilidade)
try {
  Object.defineProperty(window, 'parent', {
    value: {
      postMessage: (message: any) => {
        ipcRenderer.sendToHost('webview-message', message)
      }
    },
    writable: false,
    configurable: true
  })
} catch (e) {
  console.error('Failed to shim window.parent:', e)
}

// Forwarda respostas legadas do inspector para o host (apenas tipos seguros)
const RESPONSE_TYPES = new Set([
  '__LS_INSPECTOR_CLICK__',
  '__LS_INSPECTOR_DEACTIVATE__',
  '__LS_INSPECTOR_NO_SOURCE__',
])

window.addEventListener('message', (e) => {
  if (e.data && typeof e.data === 'object' && RESPONSE_TYPES.has(e.data.type)) {
    ipcRenderer.sendToHost('webview-message', e.data)
  }
})
