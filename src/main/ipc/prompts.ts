import { app, ipcMain } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

const getPromptsDbPath = () => path.join(app.getPath('userData'), 'nika_prompts.json')

export interface PromptTemplate {
  id: string
  name: string
  description: string
  content: string
  isDefault?: boolean
  gradient?: string
  iconBg?: string
  tags?: string[]
}

function loadCustomPrompts(): PromptTemplate[] {
  const p = getPromptsDbPath()
  if (!fs.existsSync(p)) return []
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'))
  } catch {
    return []
  }
}

function saveCustomPrompts(prompts: PromptTemplate[]) {
  const p = getPromptsDbPath()
  fs.writeFileSync(p, JSON.stringify(prompts, null, 2), 'utf-8')
}

export function registerPromptsHandlers() {
  ipcMain.handle('prompts:list', () => {
    return loadCustomPrompts()
  })

  ipcMain.handle('prompts:save', (_, prompt: PromptTemplate) => {
    const prompts = loadCustomPrompts()
    const index = prompts.findIndex((p) => p.id === prompt.id)
    if (index >= 0) {
      prompts[index] = prompt
    } else {
      prompts.push(prompt)
    }
    saveCustomPrompts(prompts)
    return { success: true }
  })

  ipcMain.handle('prompts:delete', (_, id: string) => {
    const prompts = loadCustomPrompts()
    const filtered = prompts.filter((p) => p.id !== id)
    saveCustomPrompts(filtered)
    return { success: true }
  })
}
