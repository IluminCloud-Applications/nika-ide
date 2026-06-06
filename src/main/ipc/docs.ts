import { app, ipcMain } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

const getDocsDbPath = () => path.join(app.getPath('userData'), 'nika_docs.json')

export interface DocEntry {
  slug: string
  name: string
  description: string
  content: string
  createdAt: string
  updatedAt: string
}

function loadDocs(): DocEntry[] {
  const p = getDocsDbPath()
  if (!fs.existsSync(p)) return []
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'))
  } catch {
    return []
  }
}

function saveDocs(docs: DocEntry[]) {
  const p = getDocsDbPath()
  fs.writeFileSync(p, JSON.stringify(docs, null, 2), 'utf-8')
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function registerDocsHandlers() {
  ipcMain.handle('docs:list', () => {
    return loadDocs().map(({ slug, name, description, content, updatedAt }) => ({
      slug,
      name,
      description,
      content,
      updatedAt
    }))
  })

  ipcMain.handle('docs:get', (_, slug: string) => {
    const docs = loadDocs()
    return docs.find((d) => d.slug === slug) ?? null
  })

  ipcMain.handle('docs:save', (_, doc: Omit<DocEntry, 'slug' | 'createdAt' | 'updatedAt'> & { slug?: string }) => {
    const docs = loadDocs()
    const now = new Date().toISOString()
    const slug = doc.slug ?? toSlug(doc.name)
    const index = docs.findIndex((d) => d.slug === slug)

    if (index >= 0) {
      docs[index] = { ...docs[index], ...doc, slug, updatedAt: now }
    } else {
      docs.push({ slug, name: doc.name, description: doc.description, content: doc.content, createdAt: now, updatedAt: now })
    }

    saveDocs(docs)
    return { success: true, slug }
  })

  ipcMain.handle('docs:delete', (_, slug: string) => {
    const docs = loadDocs()
    saveDocs(docs.filter((d) => d.slug !== slug))
    return { success: true }
  })
}
