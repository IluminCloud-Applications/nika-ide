import fs from 'node:fs'
import path from 'node:path'
import { getUserDataPath } from './utils'

export interface AgentArgs {
  name: string
  description: string
  systemInstructions: string
  tags?: string[]
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
