import { app, ipcMain } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { loadCustomMcps, saveCustomMcps, parseFlexibleMcpJson } from './mcp-custom'

const getMcpDbPath = () => path.join(app.getPath('userData'), 'nika_mcp.json')
const getProjectsDbPath = () => path.join(app.getPath('userData'), 'nika_projects.json')

export interface McpStateInfo {
  enabled: boolean
  apiKey?: string
}

const DEFAULT_MCP_STATE: Record<string, McpStateInfo> = {
  'remix-icon': { enabled: true },
  'tarefas': { enabled: true },
  'browser': { enabled: true },
  'nika-mcp': { enabled: true },
  'shadcn': { enabled: true },
  'IluminMCP': { enabled: false },
  'context7': { enabled: false },
  'offerspro': { enabled: false }
}

export function loadMcpState(): Record<string, McpStateInfo> {
  const p = getMcpDbPath()
  if (!fs.existsSync(p)) return { ...DEFAULT_MCP_STATE }
  try {
    const saved = JSON.parse(fs.readFileSync(p, 'utf-8'))
    return { ...DEFAULT_MCP_STATE, ...saved }
  } catch {
    return { ...DEFAULT_MCP_STATE }
  }
}

export function saveMcpState(state: Record<string, McpStateInfo>) {
  const p = getMcpDbPath()
  fs.writeFileSync(p, JSON.stringify(state, null, 2), 'utf-8')
}

function loadProjects() {
  const dbPath = getProjectsDbPath()
  if (!fs.existsSync(dbPath)) return []
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
  } catch {
    return []
  }
}

function getBuiltinTasksMcp(projectPath: string) {
  const scriptPath = path.resolve(__dirname, '../mcp/tasks.js')
  return {
    command: 'node',
    args: [scriptPath],
    env: { PROJECT_PATH: projectPath }
  }
}

function getBuiltinBrowserMcp(projectPath: string) {
  const scriptPath = path.resolve(__dirname, '../mcp/browser.js')
  return {
    command: 'node',
    args: [scriptPath],
    env: { PROJECT_PATH: projectPath }
  }
}

function getBuiltinNikaMcp(projectPath: string) {
  const scriptPath = path.resolve(__dirname, '../mcp/nika.js')
  return {
    command: 'node',
    args: [scriptPath],
    env: { PROJECT_PATH: projectPath }
  }
}

export function syncMcpStateToProject(projectPath: string, mcpState: Record<string, McpStateInfo>) {
  const mcpServers: Record<string, any> = {}

  const configTemplates: Record<string, (key?: string) => any> = {
    'remix-icon': () => ({ command: 'npx', args: ['-y', 'remixicon-mcp'] }),
    'tarefas': () => getBuiltinTasksMcp(projectPath),
    'browser': () => getBuiltinBrowserMcp(projectPath),
    'nika-mcp': () => getBuiltinNikaMcp(projectPath),
    'shadcn': () => ({ command: 'npx', args: ['shadcn@latest', 'mcp'] }),
    'IluminMCP': (key) => ({ command: 'npx', args: ['-y', 'ilumin-mcp', '--x-api-key', key || '<api_key>'] }),
    'context7': (key) => ({ command: 'npx', args: ['-y', '@upstash/context7-mcp', '--api-key', key || '<api_key>'] }),
    'offerspro': (key) => ({ command: 'npx', args: ['-y', 'offerspro-mcp', '--api-key', key || '<api_key>'] })
  }

  for (const [mcpId, info] of Object.entries(mcpState)) {
    if (info && info.enabled && configTemplates[mcpId]) {
      mcpServers[mcpId] = configTemplates[mcpId](info.apiKey)
    }
  }

  const customMcps = loadCustomMcps()
  for (const [customId, customMcp] of Object.entries(customMcps)) {
    if (customMcp && customMcp.enabled && customMcp.config) {
      mcpServers[customId] = customMcp.config
    }
  }

  const pathsToUpdate = [
    path.join(projectPath, '.claude', 'settings.json'),
    path.join(projectPath, '.agents', 'mcp_config.json'),
    path.join(projectPath, '.mcp.json')
  ]

  for (const filePath of pathsToUpdate) {
    let currentConfig: any = {}
    if (fs.existsSync(filePath)) {
      try {
        currentConfig = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
      } catch {
        currentConfig = {}
      }
    }
    currentConfig.mcpServers = { ...mcpServers }
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, JSON.stringify(currentConfig, null, 2), 'utf-8')
  }
}

export function registerMcpHandlers() {
  ipcMain.handle('mcp:get-state', () => loadMcpState())

  ipcMain.handle('mcp:set-enabled', (_, { mcpId, enabled, apiKey }: {
    mcpId: string; enabled: boolean; apiKey?: string
  }) => {
    const customMcps = loadCustomMcps()
    if (customMcps[mcpId]) {
      customMcps[mcpId].enabled = enabled
      saveCustomMcps(customMcps)
    } else {
      const state = loadMcpState()
      state[mcpId] = { enabled, apiKey }
      saveMcpState(state)
    }

    const projects = loadProjects()
    const state = loadMcpState()
    for (const project of projects) {
      if (!fs.existsSync(project.path)) continue
      syncMcpStateToProject(project.path, state)
    }
    return { success: true }
  })

  ipcMain.handle('mcp:get-custom-mcps', () => loadCustomMcps())

  ipcMain.handle('mcp:save-custom-mcp', (_, { id, name, configText, enabled }: {
    id: string; name?: string; configText: string; enabled?: boolean
  }) => {
    const customMcps = loadCustomMcps()
    let parsedConfig: any
    try {
      parsedConfig = parseFlexibleMcpJson(configText)
    } catch (err: any) {
      return { success: false, error: err.message || 'JSON inválido' }
    }

    let finalId = id.trim().toLowerCase().replace(/\s+/g, '')
    let finalName = name?.trim() || finalId
    let finalConfig = parsedConfig

    const keys = Object.keys(parsedConfig)
    if (keys.length > 0 && !parsedConfig.command && !parsedConfig.url) {
      const firstKey = keys[0]
      if (!finalId) {
        finalId = firstKey.trim().toLowerCase().replace(/\s+/g, '')
        finalName = firstKey
      }
      finalConfig = parsedConfig[firstKey]
    }

    if (!finalId) {
      return { success: false, error: 'ID do servidor MCP é obrigatório.' }
    }

    if (typeof finalConfig !== 'object' || (!finalConfig.command && !finalConfig.url)) {
      return { success: false, error: 'A configuração deve conter "command" ou "url".' }
    }

    const isNew = !customMcps[finalId]
    const wasEnabled = isNew ? (enabled ?? true) : customMcps[finalId].enabled

    customMcps[finalId] = {
      id: finalId,
      name: finalName,
      enabled: wasEnabled,
      config: finalConfig
    }
    saveCustomMcps(customMcps)

    const projects = loadProjects()
    const state = loadMcpState()
    for (const project of projects) {
      if (!fs.existsSync(project.path)) continue
      syncMcpStateToProject(project.path, state)
    }

    return { success: true, mcp: customMcps[finalId] }
  })

  ipcMain.handle('mcp:delete-custom-mcp', (_, { mcpId }: { mcpId: string }) => {
    const customMcps = loadCustomMcps()
    if (customMcps[mcpId]) {
      delete customMcps[mcpId]
      saveCustomMcps(customMcps)
      
      const projects = loadProjects()
      const state = loadMcpState()
      for (const project of projects) {
        if (!fs.existsSync(project.path)) continue
        syncMcpStateToProject(project.path, state)
      }
      return { success: true }
    }
    return { success: false, error: 'MCP customizado não encontrado.' }
  })
}
