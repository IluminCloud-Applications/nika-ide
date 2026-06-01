import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

const getCustomMcpsDbPath = () => path.join(app.getPath('userData'), 'nika_custom_mcps.json')

export interface CustomMcp {
  id: string
  name: string
  enabled: boolean
  config: any
}

export function loadCustomMcps(): Record<string, CustomMcp> {
  const p = getCustomMcpsDbPath()
  if (!fs.existsSync(p)) return {}
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'))
  } catch {
    return {}
  }
}

export function saveCustomMcps(mcps: Record<string, CustomMcp>) {
  const p = getCustomMcpsDbPath()
  fs.writeFileSync(p, JSON.stringify(mcps, null, 2), 'utf-8')
}

export function parseFlexibleMcpJson(inputStr: string): Record<string, any> {
  let cleaned = inputStr.trim()
  
  try {
    const parsed = JSON.parse(cleaned)
    if (parsed && typeof parsed === 'object') {
      if (parsed.mcpServers && typeof parsed.mcpServers === 'object') {
        return parsed.mcpServers
      }
      if (parsed.servers && typeof parsed.servers === 'object') {
        return parsed.servers
      }
      return parsed
    }
  } catch (e) {
    // Ignora erro e tenta parse com chaves extras ou faltantes
  }

  if (!cleaned.startsWith('{')) {
    cleaned = '{' + cleaned
  }

  let temp = cleaned
  while (temp.length > 0) {
    try {
      const parsed = JSON.parse(temp)
      if (parsed && typeof parsed === 'object') {
        if (parsed.mcpServers && typeof parsed.mcpServers === 'object') {
          return parsed.mcpServers
        }
        if (parsed.servers && typeof parsed.servers === 'object') {
          return parsed.servers
        }
        return parsed
      }
    } catch (err) {
      if (temp.endsWith('}')) {
        temp = temp.slice(0, -1).trim()
      } else {
        break
      }
    }
  }

  throw new Error('Não foi possível fazer o parse do JSON. Verifique se o formato está correto.')
}
