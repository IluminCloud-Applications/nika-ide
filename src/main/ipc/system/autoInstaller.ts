import { execSync, spawn } from 'node:child_process'
import os from 'node:os'
import { BrowserWindow } from 'electron'
import { INSTALL_REGISTRY, PlatformKey, PLATFORM_LABELS } from './installCommands'

interface AutoInstallResult {
  success: boolean
  toolId: string
  platform: string
  output: string
  mode: 'inline' | 'terminal'
  error?: string
}

/**
 * Returns the info about whether a tool can be auto-installed on the current OS.
 */
export function getInstallInfo(toolId: string) {
  const platform = os.platform() as PlatformKey
  const entry = INSTALL_REGISTRY[toolId]
  if (!entry) return { canAutoInstall: false, platform, platformLabel: PLATFORM_LABELS[platform] ?? platform, url: '', interactive: false }

  const info = entry[platform] ?? entry.linux
  return {
    canAutoInstall: info.auto !== null,
    command: info.auto,
    url: info.url,
    platform,
    platformLabel: PLATFORM_LABELS[platform] ?? platform,
    interactive: info.interactive,
  }
}

/**
 * Opens an external terminal window and runs the given command.
 * Used for interactive installs that need sudo/password/user input.
 */
function openTerminalForInstall(command: string): void {
  const platform = os.platform()

  if (platform === 'linux') {
    const terminals = [
      ['gnome-terminal', '--', 'bash', '-c', `${command}; echo ""; echo "✅ Concluído! Pode fechar esta janela."; exec bash`],
      ['xterm', '-e', `bash -c "${command.replace(/"/g, '\\"')}; echo; echo ✅ Concluído!; exec bash"`],
      ['konsole', '-e', `bash -c "${command.replace(/"/g, '\\"')}; echo; echo ✅ Concluído!; exec bash"`],
      ['xfce4-terminal', '-e', `bash -c "${command.replace(/"/g, '\\"')}; echo; echo ✅ Concluído!; exec bash"`],
    ]
    for (const [term, ...args] of terminals) {
      try {
        execSync(`which ${term}`, { encoding: 'utf-8', timeout: 2000 })
        spawn(term, args, { detached: true, stdio: 'ignore' }).unref()
        return
      } catch { /* try next */ }
    }
    spawn('bash', ['-c', command], { detached: true, stdio: 'ignore' }).unref()
  } else if (platform === 'darwin') {
    const script = `tell application "Terminal" to do script "${command.replace(/"/g, '\\"')}"`
    spawn('osascript', ['-e', script], { detached: true, stdio: 'ignore' }).unref()
  } else {
    spawn('cmd', ['/c', 'start', 'cmd', '/k', command], { detached: true, stdio: 'ignore' }).unref()
  }
}

/**
 * Runs the auto-install command for a tool.
 *
 * - Interactive commands (sudo, curl|bash) → opens an external terminal.
 * - Non-interactive commands (winget, brew, npm) → runs inline with progress streaming.
 */
export function autoInstallTool(toolId: string): Promise<AutoInstallResult> {
  const platform = os.platform() as PlatformKey
  const entry = INSTALL_REGISTRY[toolId]

  if (!entry) {
    return Promise.resolve({ success: false, toolId, platform, output: '', mode: 'inline', error: 'Unknown tool' })
  }

  const info = entry[platform] ?? entry.linux
  if (!info.auto) {
    return Promise.resolve({ success: false, toolId, platform, output: '', mode: 'inline', error: 'No auto-install available' })
  }

  // Interactive → open external terminal (user may need to type sudo password etc.)
  if (info.interactive) {
    try {
      openTerminalForInstall(info.auto)
      return Promise.resolve({ success: true, toolId, platform, output: 'Terminal aberto com o comando de instalação.', mode: 'terminal' })
    } catch (e: any) {
      return Promise.resolve({ success: false, toolId, platform, output: '', mode: 'terminal', error: e.message })
    }
  }

  // Non-interactive → run inline with progress streaming
  return runInlineInstall(toolId, info.auto, platform)
}

function runInlineInstall(toolId: string, command: string, platform: string): Promise<AutoInstallResult> {
  return new Promise((resolve) => {
    const shell = platform === 'win32' ? 'cmd' : 'bash'
    const shellArgs = platform === 'win32' ? ['/c', command] : ['-c', command]
    const child = spawn(shell, shellArgs, { stdio: ['ignore', 'pipe', 'pipe'] })

    let output = ''
    const sendProgress = (data: string) => {
      output += data
      const win = BrowserWindow.getAllWindows()[0]
      if (win) win.webContents.send('system:install-progress', { toolId, data, done: false })
    }

    child.stdout?.on('data', (chunk) => sendProgress(chunk.toString()))
    child.stderr?.on('data', (chunk) => sendProgress(chunk.toString()))

    child.on('close', (code) => {
      const win = BrowserWindow.getAllWindows()[0]
      if (win) win.webContents.send('system:install-progress', { toolId, data: '', done: true, success: code === 0 })
      resolve({ success: code === 0, toolId, platform, output, mode: 'inline', error: code !== 0 ? `Process exited with code ${code}` : undefined })
    })

    child.on('error', (err) => {
      const win = BrowserWindow.getAllWindows()[0]
      if (win) win.webContents.send('system:install-progress', { toolId, data: err.message, done: true, success: false })
      resolve({ success: false, toolId, platform, output, mode: 'inline', error: err.message })
    })
  })
}
