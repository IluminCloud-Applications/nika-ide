import { ipcMain, BrowserWindow } from 'electron'
import { spawn, ChildProcess, execSync, exec } from 'node:child_process'
import path from 'node:path'
import fs from 'node:fs'
import { promisify } from 'node:util'

const execPromise = promisify(exec)

const runningProcesses = new Map<string, ChildProcess[]>()

function sendToWindow(event: Electron.IpcMainInvokeEvent, channel: string, data: any) {
  const win = BrowserWindow.fromWebContents(event.sender)
  if (win && !win.isDestroyed()) win.webContents.send(channel, data)
}

function spawnProcess(
  cmd: string, args: string[], cwd: string,
  event: Electron.IpcMainInvokeEvent, label: string
): ChildProcess {
  // detached: true cria um novo grupo de processos para que possamos matar tudo com -pid
  const isWin = process.platform === 'win32'
  const proc = spawn(cmd, args, {
    cwd, shell: isWin, detached: true,
    env: { ...process.env, FORCE_COLOR: '1' },
  })
  proc.stdout?.on('data', d => sendToWindow(event, 'runner:log', { label, data: d.toString() }))
  proc.stderr?.on('data', d => sendToWindow(event, 'runner:log', { label, data: d.toString() }))
  proc.on('error', err => sendToWindow(event, 'runner:log', { label, data: '[ERROR] ' + err.message + '\n' }))
  proc.on('exit', code => {
    sendToWindow(event, 'runner:log', { label, data: `[EXIT] processo encerrado (código ${code})\n` })
    sendToWindow(event, 'runner:exit', { label, code })
  })
  return proc
}

function killProcessList(processes: ChildProcess[]) {
  processes.forEach(p => {
    try {
      if (!p.pid) return
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(p.pid), '/f', '/t'], { shell: true })
      } else {
        // Mata o grupo de processos inteiro (inclui shell filhos do npm run dev)
        try { process.kill(-p.pid, 'SIGTERM') } catch {}
        setTimeout(() => {
          try { process.kill(-p.pid!, 'SIGKILL') } catch {}
        }, 800)
      }
    } catch {}
  })
}

function freePorts(ports: number[]) {
  if (process.platform === 'win32') return
  ports.forEach(port => {
    try { execSync(`fuser -k ${port}/tcp 2>/dev/null`, { timeout: 2000 }) } catch {}
  })
}

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function registerRunnerHandlers() {
  ipcMain.handle('runner:start', async (event, { projectPath }: { projectPath: string }) => {
    // Para qualquer processo existente antes de iniciar
    const existing = runningProcesses.get(projectPath)
    if (existing) {
      killProcessList(existing)
      runningProcesses.delete(projectPath)
    }
    // Libera as portas antes de subir novo servidor
    freePorts([5177, 5178, 5175, 8742])
    await wait(400)

    const processes: ChildProcess[] = []
    const frontendDir = path.join(projectPath, 'frontend')
    const dockerFile  = path.join(projectPath, 'docker-compose.yml')
    const backendDir  = path.join(projectPath, 'backend')

    if (fs.existsSync(frontendDir)) {
      sendToWindow(event, 'runner:log', { label: 'frontend', data: '[SYSTEM] Instalando dependências (npm install)...\n' })
      const npmInstall = spawnProcess('npm', ['install', '--prefer-offline'], frontendDir, event, 'frontend')
      processes.push(npmInstall)

      npmInstall.on('exit', code => {
        if (code === 0) {
          sendToWindow(event, 'runner:log', { label: 'frontend', data: '[SYSTEM] Iniciando servidor de desenvolvimento...\n' })
          const devServer = spawnProcess('npm', ['run', 'dev', '--', '--port', '5177'], frontendDir, event, 'frontend')
          processes.push(devServer)
          runningProcesses.set(projectPath, processes)
        } else {
          sendToWindow(event, 'runner:log', { label: 'frontend', data: '[ERROR] npm install falhou.\n' })
        }
      })
    } else {
      sendToWindow(event, 'runner:log', { label: 'frontend', data: '[WARN] Pasta frontend/ não encontrada.\n' })
    }

    if (fs.existsSync(dockerFile)) {
      sendToWindow(event, 'runner:log', { label: 'backend', data: '[SYSTEM] Iniciando backend (docker compose)...\n' })
      const dockerUp = spawnProcess('docker', ['compose', 'up', '--build'], projectPath, event, 'backend')
      processes.push(dockerUp)
    } else if (!fs.existsSync(backendDir)) {
      sendToWindow(event, 'runner:log', { label: 'backend', data: '[WARN] Pasta backend/ não encontrada.\n' })
    }

    runningProcesses.set(projectPath, processes)
    return { success: true }
  })

  ipcMain.handle('runner:stop', async (_, { projectPath }: { projectPath: string }) => {
    const processes = runningProcesses.get(projectPath)
    if (processes) {
      killProcessList(processes)
      runningProcesses.delete(projectPath)
    }
    freePorts([5177, 5178, 5175, 8742])
    const isWin = process.platform === 'win32'
    try { spawn('docker', ['compose', 'down'], { cwd: projectPath, shell: isWin }) } catch {}
    await wait(500)
    return { success: true }
  })

  ipcMain.handle('runner:stop-all', async () => {
    for (const [, processes] of runningProcesses) killProcessList(processes)
    runningProcesses.clear()
    freePorts([5177, 5178, 5175, 8742])
    await wait(500)
    return { success: true }
  })

  ipcMain.handle('runner:status', async (_, { projectPath }: { projectPath: string }) => {
    const procs = runningProcesses.get(projectPath)
    return { running: !!procs && procs.length > 0 }
  })

  ipcMain.handle('runner:run-user-script', async (_, { projectPath }: { projectPath: string }) => {
    return new Promise((resolve) => {
      const proc = spawn('docker', ['compose', 'exec', '-T', 'backend', 'python', 'scripts/create_user.py'], {
        cwd: projectPath,
        shell: true
      })
      let output = ''
      proc.stdout?.on('data', d => output += d.toString())
      proc.stderr?.on('data', d => output += d.toString())
      proc.on('exit', code => {
        resolve({ success: code === 0, output })
      })
    })
  })

  ipcMain.handle('runner:resolve-port-conflict', async (_, { port }: { port: number }) => {
    try {
      const { stdout } = await execPromise(`docker ps --filter "publish=${port}" --format "{{.ID}} {{.Names}}"`)
      const lines = stdout.trim().split('\n').filter(Boolean)
      
      if (lines.length > 0) {
        const containerIds = lines.map(line => line.split(' ')[0])
        const containerNames = lines.map(line => line.split(' ')[1])
        
        for (const id of containerIds) {
          await execPromise(`docker stop ${id}`)
        }
        return { 
          success: true, 
          message: `Containers parados com sucesso: ${containerNames.join(', ')}` 
        }
      } else {
        return { 
          success: false, 
          message: `Nenhum container Docker ativo mapeando a porta ${port} foi encontrado. Pode ser um serviço do sistema host.` 
        }
      }
    } catch (err: any) {
      return { 
        success: false, 
        message: `Erro ao parar containers na porta ${port}: ${err.message}` 
      }
    }
  })
}
