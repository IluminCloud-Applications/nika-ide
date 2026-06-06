import fs from 'node:fs'
import path from 'node:path'
import { getUserDataPath } from './utils'

export interface McpArgs {
  id: string
  name: string
  configText: string
  enabled?: boolean
}

export function createMcp(args: McpArgs, projectPath: string): string {
  const dbPath = path.join(getUserDataPath(), 'nika_custom_mcps.json')
  let customMcps: Record<string, any> = {}
  if (fs.existsSync(dbPath)) {
    try { customMcps = JSON.parse(fs.readFileSync(dbPath, 'utf-8')) } catch (_) {}
  }

  let parsedConfig: any
  try {
    parsedConfig = JSON.parse(args.configText.trim())
    if (parsedConfig && typeof parsedConfig === 'object') {
      if (parsedConfig.mcpServers && typeof parsedConfig.mcpServers === 'object') {
        parsedConfig = parsedConfig.mcpServers
      } else if (parsedConfig.servers && typeof parsedConfig.servers === 'object') {
        parsedConfig = parsedConfig.servers
      }
    }
  } catch (err: any) {
    throw new Error('Configuração JSON inválida: ' + err.message)
  }

  const keys = Object.keys(parsedConfig)
  let finalConfig = parsedConfig
  if (keys.length > 0 && !parsedConfig.command && !parsedConfig.url) {
    finalConfig = parsedConfig[keys[0]]
  }

  if (typeof finalConfig !== 'object' || (!finalConfig.command && !finalConfig.url)) {
    throw new Error('A configuração deve conter "command" ou "url".')
  }

  const finalId = args.id.trim().toLowerCase().replace(/\s+/g, '')
  customMcps[finalId] = {
    id: finalId,
    name: args.name,
    enabled: args.enabled ?? true,
    config: finalConfig
  }

  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  fs.writeFileSync(dbPath, JSON.stringify(customMcps, null, 2), 'utf-8')

  if (projectPath && fs.existsSync(projectPath)) {
    const mcpStateDbPath = path.join(getUserDataPath(), 'nika_mcp.json')
    let mcpState: Record<string, any> = {}
    if (fs.existsSync(mcpStateDbPath)) {
      try { mcpState = JSON.parse(fs.readFileSync(mcpStateDbPath, 'utf-8')) } catch (_) {}
    }

    const mcpServers: Record<string, any> = {}
    const getBuiltinTasksMcp = (p: string) => ({ command: 'node', args: [path.resolve(__dirname, '../mcp/tasks.js')], env: { PROJECT_PATH: p } })
    const getBuiltinBrowserMcp = (p: string) => ({ command: 'node', args: [path.resolve(__dirname, '../mcp/browser.js')], env: { PROJECT_PATH: p } })
    const getBuiltinNikaMcp = (p: string) => ({ command: 'node', args: [path.resolve(__dirname, '../mcp/nika.js')], env: { PROJECT_PATH: p, USER_DATA_PATH: getUserDataPath() } })

    const configTemplates: Record<string, (key?: string) => any> = {
      'remix-icon': () => ({ command: 'npx', args: ['-y', 'remixicon-mcp'] }),
      'tarefas': () => getBuiltinTasksMcp(projectPath),
      'browser': () => getBuiltinBrowserMcp(projectPath),
      'nika-mcp': () => getBuiltinNikaMcp(projectPath),
      'shadcn': () => ({ command: 'npx', args: ['shadcn@latest', 'mcp'] }),
      'IluminMCP': (key) => ({ command: 'npx', args: ['-y', 'ilumin-mcp', '--x-api-key', key || '<api_key>'] }),
      'context7': (key) => ({ command: 'npx', args: ['-y', '@upstash/context7-mcp', '--api-key', key || '<api_key>'] }),
      'offerspro': (key) => ({ command: 'npx', args: ['-y', 'offerspro-mcp', '--api-key', key || '<api_key>'] }),
      'stripe': (key) => ({ command: 'npx', args: ['-y', '@stripe/mcp@latest'], env: { STRIPE_SECRET_KEY: key || '<stripe_secret_key>' } }),
      'asaas': () => ({ url: 'https://docs.asaas.com/mcp' })
    }

    for (const [mcpId, info] of Object.entries(mcpState)) {
      if (info && info.enabled && configTemplates[mcpId]) {
        mcpServers[mcpId] = configTemplates[mcpId](info.apiKey)
      }
    }
    for (const [cId, cMcp] of Object.entries(customMcps)) {
      if (cMcp && cMcp.enabled && cMcp.config) {
        mcpServers[cId] = cMcp.config
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
        try { currentConfig = JSON.parse(fs.readFileSync(filePath, 'utf-8')) } catch (_) {}
      }
      currentConfig.mcpServers = { ...mcpServers }
      fs.mkdirSync(path.dirname(filePath), { recursive: true })
      fs.writeFileSync(filePath, JSON.stringify(currentConfig, null, 2), 'utf-8')
    }
  }

  return `MCP customizado "${args.name}" (ID: ${finalId}) criado e configurado com sucesso!`
}
