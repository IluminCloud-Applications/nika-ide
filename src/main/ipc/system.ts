import { app, ipcMain, shell } from 'electron'
import { execSync, spawn } from 'node:child_process'
import os from 'node:os'
import { getInstallInfo, autoInstallTool } from './system/autoInstaller'

interface ToolCheckResult {
  id: string
  name: string
  version: string | null
  installed: boolean
  error?: string
}

type CheckFn = () => string

const TOOL_CHECKS: Record<string, CheckFn> = {
  git:    () => execSync('git --version',    { encoding: 'utf-8', timeout: 5000 }).trim(),
  node:   () => execSync('node --version',   { encoding: 'utf-8', timeout: 5000 }).trim(),
  npm:    () => execSync('npm --version',    { encoding: 'utf-8', timeout: 5000 }).trim(),
  docker: () => execSync('docker --version', { encoding: 'utf-8', timeout: 5000 }).trim(),
  python: () => {
    try { return execSync('python3 --version', { encoding: 'utf-8', timeout: 5000 }).trim() }
    catch { return execSync('python --version',  { encoding: 'utf-8', timeout: 5000 }).trim() }
  },
  claude: () => execSync('claude --version', { encoding: 'utf-8', timeout: 5000 }).trim(),
  agy:    () => execSync('agy --version',    { encoding: 'utf-8', timeout: 5000 }).trim(),
  codex:  () => execSync('codex --version',  { encoding: 'utf-8', timeout: 5000 }).trim(),
}

function checkTool(id: string): ToolCheckResult {
  const fn = TOOL_CHECKS[id]
  if (!fn) return { id, name: id, version: null, installed: false, error: 'Unknown tool' }
  try {
    const output = fn()
    return { id, name: id, version: output, installed: true }
  } catch (e: any) {
    return { id, name: id, version: null, installed: false, error: e.message }
  }
}

function buildInstallPrompt(missing: string[]): string {
  const platform = os.platform()
  const platformName =
    platform === 'darwin'  ? 'macOS'   :
    platform === 'win32'   ? 'Windows' : 'Linux'

  const toolDescriptions: Record<string, string> = {
    git:    'Git (controle de versão)',
    node:   'Node.js (runtime JavaScript, versão LTS)',
    npm:    'npm (vem junto com o Node.js)',
    docker: 'Docker Desktop (ou Docker Engine no Linux)',
    python: 'Python 3 (versão 3.11 ou superior)',
    claude: 'Claude CLI da Anthropic (claude)',
    agy:    'Antigravity CLI (agy) — instale com: npm install -g @google/generative-ai-cli',
    codex:  'Codex CLI (codex) — instale com: npm install -g @openai/codex',
  }

  const list = missing.map(id => `- ${toolDescriptions[id] ?? id}`).join('\n')

  return (
    `Estou usando ${platformName} e preciso instalar as seguintes ferramentas de desenvolvimento que estão faltando no meu sistema:\n\n` +
    list +
    `\n\nPor favor, instale cada uma delas usando o método mais adequado para ${platformName}. ` +
    `Após cada instalação, verifique se funcionou corretamente executando o comando de versão. ` +
    `Use brew (macOS), apt/dnf/pacman (Linux) ou o instalador oficial (Windows) conforme o sistema. ` +
    `Seja direto e instale sem perguntas adicionais.`
  )
}

function openTerminalWithCommand(command: string): void {
  const platform = os.platform()

  if (platform === 'linux') {
    const terminals = [
      ['gnome-terminal', '--', 'bash', '-c', `${command}; exec bash`],
      ['xterm', '-e', `bash -c "${command.replace(/"/g, '\\"')}; exec bash"`],
      ['konsole', '-e', `bash -c "${command.replace(/"/g, '\\"')}; exec bash"`],
      ['xfce4-terminal', '-e', `bash -c "${command.replace(/"/g, '\\"')}; exec bash"`],
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

export function registerSystemHandlers() {
  ipcMain.handle('system:get-version', async () => {
    return app.getVersion()
  })

  ipcMain.handle('system:check-tools', async () => {
    return Object.keys(TOOL_CHECKS).map(id => checkTool(id))
  })

  ipcMain.handle('system:get-webview-preload-path', async () => {
    const path = require('node:path')
    const url = require('node:url')
    const absolutePath = path.join(__dirname, '../preload/webview.js')
    return url.pathToFileURL(absolutePath).href
  })

  ipcMain.handle('system:check-tool', async (_, id: string) => checkTool(id))

  ipcMain.handle('system:open-url', async (_, url: string) => {
    await shell.openExternal(url)
    return { success: true }
  })

  ipcMain.handle('system:open-path', async (_, dirPath: string) => {
    const error = await shell.openPath(dirPath)
    if (error) return { success: false, error }
    return { success: true }
  })

  // Get install info for a specific tool (can auto-install? which OS? url?)
  ipcMain.handle('system:get-install-info', async (_, toolId: string) => {
    return getInstallInfo(toolId)
  })

  // Get install info for all tools at once
  ipcMain.handle('system:get-all-install-info', async () => {
    const result: Record<string, ReturnType<typeof getInstallInfo>> = {}
    for (const id of Object.keys(TOOL_CHECKS)) {
      result[id] = getInstallInfo(id)
    }
    return result
  })

  // Auto-install a single tool (runs the command, streams progress)
  ipcMain.handle('system:auto-install-tool', async (_, toolId: string) => {
    return autoInstallTool(toolId)
  })

  ipcMain.handle('system:install-with-ai', async (_, missingToolIds: string[]) => {
    if (!missingToolIds.length) return { success: false, reason: 'no_missing_tools' }

    const prompt = buildInstallPrompt(missingToolIds)
    const escaped = prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')
    const command = `agy --dangerously-skip-permissions "${escaped}"`

    try {
      openTerminalWithCommand(command)
      return { success: true }
    } catch (e: any) {
      return { success: false, reason: e.message }
    }
  })
}
