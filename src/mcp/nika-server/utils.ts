import http from 'node:http'

export function callBridge(pathName: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: '127.0.0.1', port: 47695, path: pathName, method: 'POST' }, (res) => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => {
        try { resolve(JSON.parse(data)) } catch { resolve({ success: false }) }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

export function checkUrlOnline(url: string, timeoutMs = 30000): Promise<boolean> {
  const start = Date.now()
  return new Promise((resolve) => {
    const poll = () => {
      if (Date.now() - start > timeoutMs) return resolve(false)
      const req = http.request(url, { method: 'GET', timeout: 1000 }, (res) => {
        if (res.statusCode && res.statusCode < 400) resolve(true)
        else setTimeout(poll, 1000)
      })
      req.on('error', () => setTimeout(poll, 1000))
      req.end()
    }
    poll()
  })
}

export function checkUrlOffline(url: string, timeoutMs = 10000): Promise<boolean> {
  const start = Date.now()
  return new Promise((resolve) => {
    const poll = () => {
      if (Date.now() - start > timeoutMs) return resolve(true)
      const req = http.request(url, { method: 'GET', timeout: 1000 }, () => setTimeout(poll, 1000))
      req.on('error', () => resolve(true))
      req.end()
    }
    poll()
  })
}
