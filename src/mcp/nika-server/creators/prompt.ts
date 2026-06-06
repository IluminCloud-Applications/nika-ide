import fs from 'node:fs'
import path from 'node:path'
import { getUserDataPath } from './utils'

export interface PromptArgs {
  name: string
  description: string
  content: string
  tags?: string[]
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
