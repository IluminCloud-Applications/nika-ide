import fs from 'node:fs'
import path from 'node:path'
import { getUserDataPath } from './utils'

export interface DocArgs {
  name: string
  description: string
  content: string
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

export function createDoc(args: DocArgs): string {
  const dbPath = path.join(getUserDataPath(), 'nika_docs.json')
  let list: any[] = []
  if (fs.existsSync(dbPath)) {
    try { list = JSON.parse(fs.readFileSync(dbPath, 'utf-8')) } catch (_) {}
  }

  const slug = args.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  
  const existingIndex = list.findIndex((d: any) => d.slug === slug)
  const newDoc = {
    slug,
    name: args.name.trim(),
    description: args.description.trim(),
    content: args.content.trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  if (existingIndex > -1) {
    list[existingIndex] = {
      ...list[existingIndex],
      ...newDoc,
      createdAt: list[existingIndex].createdAt || newDoc.createdAt
    }
  } else {
    list.push(newDoc)
  }

  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  fs.writeFileSync(dbPath, JSON.stringify(list, null, 2), 'utf-8')

  return `Documentação "${args.name}" (slug: ${slug}) salva com sucesso!`
}
