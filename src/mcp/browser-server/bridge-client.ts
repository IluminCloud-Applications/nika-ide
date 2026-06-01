import http from 'node:http'

// Must match BROWSER_BRIDGE_PORT in src/main/ipc/browser-bridge.ts
const PORT = 47695
const HOST = '127.0.0.1'

export interface BridgeResponse {
  status: number
  body: any
}

export function bridgeRequest(
  method: 'GET' | 'POST',
  path: string,
  payload?: any
): Promise<BridgeResponse> {
  return new Promise((resolve, reject) => {
    const data = payload ? JSON.stringify(payload) : undefined
    const req = http.request(
      {
        host: HOST,
        port: PORT,
        path,
        method,
        headers: data
          ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
          : {},
        timeout: 15000,
      },
      (res) => {
        let raw = ''
        res.on('data', (c) => { raw += c })
        res.on('end', () => {
          let body: any = raw
          try { body = raw ? JSON.parse(raw) : {} } catch { /* keep raw */ }
          resolve({ status: res.statusCode || 0, body })
        })
      }
    )
    req.on('error', (err: any) => {
      if (err?.code === 'ECONNREFUSED') {
        reject(new Error(
          'Não foi possível conectar ao Nika IDE. Verifique se o app está aberto e o projeto está rodando (botão Iniciar).'
        ))
      } else {
        reject(err)
      }
    })
    req.on('timeout', () => { req.destroy(new Error('Tempo esgotado ao falar com o Nika IDE.')) })
    if (data) req.write(data)
    req.end()
  })
}
