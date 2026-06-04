import fs from 'node:fs'
import path from 'node:path'

export interface PromptArgs {
  name: string
  description: string
  content: string
  tags?: string[]
}

export interface AgentArgs {
  name: string
  description: string
  systemInstructions: string
  tags?: string[]
}

export interface McpArgs {
  id: string
  name: string
  configText: string
  enabled?: boolean
}

export interface SkillArgs {
  name: string
  description: string
  content: string
}

export function getUserDataPath(): string {
  if (process.env.USER_DATA_PATH) {
    return process.env.USER_DATA_PATH
  }
  const home = process.env.HOME || process.env.USERPROFILE || ''
  if (process.platform === 'win32') {
    return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'Nika IDE')
  } else if (process.platform === 'darwin') {
    return path.join(home, 'Library', 'Application Support', 'Nika IDE')
  } else {
    return path.join(home, '.config', 'Nika IDE')
  }
}

export function createPrompt(args: PromptArgs): string {
  const dbPath = path.join(getUserDataPath(), 'nika_prompts.json')
  let list: any[] = []
  if (fs.existsSync(dbPath)) {
    try { list = JSON.parse(fs.readFileSync(dbPath, 'utf-8')) } catch (_) {}
  }
  
  const promptId = args.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Math.floor(Math.random() * 1000)
  
  const newPrompt = {
    id: promptId,
    name: args.name,
    description: args.description,
    content: args.content,
    tags: args.tags || [],
    gradient: 'from-blue-600/20 to-blue-500/5',
    iconBg: 'bg-blue-500/15 border-blue-500/25',
    isDefault: false
  }

  list.push(newPrompt)
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  fs.writeFileSync(dbPath, JSON.stringify(list, null, 2), 'utf-8')

  return `Prompt "${args.name}" (ID: ${promptId}) criado com sucesso!`
}

export function createAgent(args: AgentArgs): string {
  const dbPath = path.join(getUserDataPath(), 'nika_agents.json')
  let list: any[] = []
  if (fs.existsSync(dbPath)) {
    try { list = JSON.parse(fs.readFileSync(dbPath, 'utf-8')) } catch (_) {}
  }

  const agentId = args.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Math.floor(Math.random() * 1000)

  const newAgent = {
    id: agentId,
    name: args.name,
    description: args.description,
    systemInstructions: args.systemInstructions,
    tags: args.tags || [],
    gradient: 'from-violet-600/20 to-violet-500/5',
    iconBg: 'bg-violet-500/15 border-violet-500/25',
    isDefault: false
  }

  list.push(newAgent)
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  fs.writeFileSync(dbPath, JSON.stringify(list, null, 2), 'utf-8')

  return `Agente "${args.name}" (ID: ${agentId}) criado com sucesso!`
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

  // Sync to project if path is valid
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

export function createSkill(args: SkillArgs, projectPath: string): string {
  const skillId = args.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const skillContent = `---\nname: ${skillId}\ndescription: ${args.description}\n---\n\n${args.content}`

  if (projectPath && fs.existsSync(projectPath)) {
    const destAgents = path.join(projectPath, '.agents', 'skills', skillId)
    fs.mkdirSync(destAgents, { recursive: true })
    fs.writeFileSync(path.join(destAgents, 'SKILL.md'), skillContent, 'utf-8')

    const destClaude = path.join(projectPath, '.claude', 'skills', skillId)
    fs.mkdirSync(destClaude, { recursive: true })
    fs.writeFileSync(path.join(destClaude, 'SKILL.md'), skillContent, 'utf-8')
  }

  const globalTemplateSkillsDir = path.resolve(__dirname, '../../templates/project-template/.agents/skills')
  if (fs.existsSync(globalTemplateSkillsDir)) {
    const destGlobal = path.join(globalTemplateSkillsDir, skillId)
    fs.mkdirSync(destGlobal, { recursive: true })
    fs.writeFileSync(path.join(destGlobal, 'SKILL.md'), skillContent, 'utf-8')
  }

  const skillsDbPath = path.join(getUserDataPath(), 'nika_skills.json')
  let skillsState: Record<string, boolean> = {}
  if (fs.existsSync(skillsDbPath)) {
    try { skillsState = JSON.parse(fs.readFileSync(skillsDbPath, 'utf-8')) } catch (_) {}
  }
  skillsState[skillId] = true
  fs.writeFileSync(skillsDbPath, JSON.stringify(skillsState, null, 2), 'utf-8')

  return `Skill "${skillId}" criada com sucesso no projeto ativo e registrada no sistema!`
}

export function listDocs(): string {
  const dbPath = path.join(getUserDataPath(), 'nika_docs.json')
  if (!fs.existsSync(dbPath)) {
    return 'Nenhuma documentação encontrada. O usuário ainda não adicionou documentações.'
  }
  let list: any[] = []
  try { list = JSON.parse(fs.readFileSync(dbPath, 'utf-8')) } catch (_) {}

  if (list.length === 0) {
    return 'Nenhuma documentação encontrada. O usuário ainda não adicionou documentações.'
  }

  const lines = list.map((d: any) =>
    `- **${d.name}** (slug: \`${d.slug}\`) — ${d.description || 'Sem descrição'}`
  )
  return `## Documentações disponíveis (${list.length})\n\nUse \`get_doc\` com o slug para obter o conteúdo completo.\n\n${lines.join('\n')}`
}

export function getDoc(slug: string): string {
  const dbPath = path.join(getUserDataPath(), 'nika_docs.json')
  if (!fs.existsSync(dbPath)) {
    return `Documentação com slug "${slug}" não encontrada.`
  }
  let list: any[] = []
  try { list = JSON.parse(fs.readFileSync(dbPath, 'utf-8')) } catch (_) {}

  const doc = list.find((d: any) => d.slug === slug)
  if (!doc) {
    return `Documentação com slug "${slug}" não encontrada. Use list_docs para ver os disponíveis.`
  }

  return `# ${doc.name}\n\n**Slug:** ${doc.slug}\n**Descrição:** ${doc.description || 'N/A'}\n\n---\n\n${doc.content}`
}

