import { ipcRenderer } from 'electron'

// Console e Rede do preview são capturados no processo principal via CDP
// (ver src/main/ipc/webview-devtools.ts). Aqui só mantemos a ponte de
// postMessage usada pelo inspector.

// 1. Shim window.parent to redirect postMessage to host (for inspector compatibility)
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

// Receive messages from host and dispatch them as standard MessageEvents
window.addEventListener('message', (e) => {
  if (e.data && typeof e.data === 'object' && e.data.type?.startsWith('__LS_INSPECTOR_')) {
    ipcRenderer.sendToHost('webview-message', e.data)
  }
})

ipcRenderer.on('webview-postmessage', (_, message) => {
  window.dispatchEvent(new MessageEvent('message', {
    data: message,
    origin: window.location.origin
  }))
})
