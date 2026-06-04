import { ipcMain, BrowserWindow } from 'electron'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs'
import path from 'node:path'

const execAsync = promisify(exec)

const CONTAINER_NAME = 'nika-cloudflared-tunnel'
const IMAGE = 'cloudflare/cloudflared:latest'

interface TunnelState {
  running: boolean
  url: string | null
  containerId: string | null
  error: string | null
}

let tunnelState: TunnelState = {
  running: false,
  url: null,
  containerId: null,
  error: null,
}

function notifyAll(channel: string, data: any) {
  BrowserWindow.getAllWindows().forEach(win => {
    if (!win.isDestroyed()) win.webContents.send(channel, data)
  })
}

async function isDockerRunning(): Promise<boolean> {
  try {
    await execAsync('docker info', { timeout: 5000 })
    return true
  } catch {
    return false
  }
}

async function getContainerUrl(containerId: string): Promise<string | null> {
  const maxAttempts = 30
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 1000))
    try {
      const { stdout } = await execAsync(`docker logs ${containerId} 2>&1`)
      const match = stdout.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)
      if (match) return match[0]
    } catch {
      // container might not have started yet
    }
  }
  return null
}

/**
 * Patches the project's vite.config.js to add `allowedHosts: 'all'` inside
 * the `server` block. This is required so Vite accepts requests coming through
 * Cloudflare Tunnel domains (*.trycloudflare.com).
 * The patch is idempotent — no-op if already present.
 */
function patchViteConfig(projectPath: string): void {
  const configPath = path.join(projectPath, 'frontend', 'vite.config.js')
  if (!fs.existsSync(configPath)) return

  let content = fs.readFileSync(configPath, 'utf-8')

  // Already patched
  if (content.includes('allowedHosts')) return

  // Inject after `host: true,` or `host: '0.0.0.0',` lines
  content = content.replace(
    /(host\s*:\s*(?:true|'0\.0\.0\.0'|"0\.0\.0\.0"),?\s*\n)/,
    '$1    allowedHosts: \'all\',\n'
  )

  // Fallback: inject inside server: { ... } block if host line not found
  if (!content.includes('allowedHosts')) {
    content = content.replace(
      /(server\s*:\s*\{)/,
      '$1\n    allowedHosts: \'all\','
    )
  }

  fs.writeFileSync(configPath, content, 'utf-8')
}

export function registerTunnelHandlers() {
  ipcMain.handle('tunnel:status', async () => {
    if (tunnelState.containerId) {
      try {
        const { stdout } = await execAsync(
          `docker inspect --format='{{.State.Running}}' ${tunnelState.containerId}`
        )
        if (!stdout.trim().includes('true')) {
          tunnelState = { running: false, url: null, containerId: null, error: null }
        }
      } catch {
        tunnelState = { running: false, url: null, containerId: null, error: null }
      }
    }
    return { ...tunnelState }
  })

  ipcMain.handle('tunnel:start', async (_, { port, projectPath }: { port: number; projectPath?: string }) => {
    if (!(await isDockerRunning())) {
      return { success: false, error: 'Docker não está rodando. Inicie o Docker Desktop primeiro.' }
    }

    // Patch vite.config.js to allow external hosts (Cloudflare Tunnel domain)
    if (projectPath) patchViteConfig(projectPath)

    // Remove old container if exists
    await execAsync(`docker rm -f ${CONTAINER_NAME}`).catch(() => {})

    try {
      // Pull image silently (no-op if already cached)
      await execAsync(`docker pull ${IMAGE}`, { timeout: 60000 }).catch(() => {})

      // Start the tunnel container.
      // - "tunnel --url" (without "run") = anonymous trycloudflare.com tunnel, no auth needed.
      // - host.docker.internal resolves to the host on Mac/Windows Docker Desktop and
      //   modern Linux Docker (>= 20.10). Fallback via extra-hosts for older Linux.
      const { stdout: containerId } = await execAsync(
        `docker run -d --name ${CONTAINER_NAME}` +
        ` --add-host=host.docker.internal:host-gateway` +
        ` ${IMAGE}` +
        ` tunnel --no-autoupdate --url http://host.docker.internal:${port}`
      )

      const id = containerId.trim()
      tunnelState = { running: true, url: null, containerId: id, error: null }
      notifyAll('tunnel:state', { ...tunnelState })

      getContainerUrl(id).then(url => {
        if (url) {
          tunnelState.url = url
          notifyAll('tunnel:state', { ...tunnelState })
        } else {
          tunnelState.error = 'Não foi possível obter a URL do tunnel. Verifique os logs do Docker.'
          notifyAll('tunnel:state', { ...tunnelState })
        }
      })

      return { success: true, containerId: id }
    } catch (err: any) {
      const error = err.stderr || err.message || 'Erro ao iniciar o tunnel.'
      tunnelState = { running: false, url: null, containerId: null, error }
      return { success: false, error }
    }
  })

  ipcMain.handle('tunnel:stop', async () => {
    try {
      if (tunnelState.containerId) {
        await execAsync(`docker rm -f ${tunnelState.containerId}`)
      } else {
        await execAsync(`docker rm -f ${CONTAINER_NAME}`).catch(() => {})
      }
      tunnelState = { running: false, url: null, containerId: null, error: null }
      notifyAll('tunnel:state', { ...tunnelState })
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('tunnel:get-logs', async () => {
    const id = tunnelState.containerId || CONTAINER_NAME
    try {
      const { stdout } = await execAsync(`docker logs --tail 50 ${id} 2>&1`)
      return { success: true, logs: stdout }
    } catch {
      return { success: false, logs: '' }
    }
  })
}
