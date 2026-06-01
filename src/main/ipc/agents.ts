import { app, ipcMain } from 'electron'
import fs from 'node:fs'
import path from 'node:path'

const getAgentsDbPath = () => path.join(app.getPath('userData'), 'nika_agents.json')

export interface Agent {
  id: string
  name: string
  description: string
  systemInstructions: string
  isDefault?: boolean
  gradient?: string
  iconBg?: string
  tags?: string[]
}

function loadCustomAgents(): Agent[] {
  const p = getAgentsDbPath()
  if (!fs.existsSync(p)) return []
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'))
  } catch {
    return []
  }
}

function saveCustomAgents(agents: Agent[]) {
  const p = getAgentsDbPath()
  fs.writeFileSync(p, JSON.stringify(agents, null, 2), 'utf-8')
}

export function registerAgentsHandlers() {
  ipcMain.handle('agents:list', () => {
    return loadCustomAgents()
  })

  ipcMain.handle('agents:save', (_, agent: Agent) => {
    const agents = loadCustomAgents()
    const index = agents.findIndex((a) => a.id === agent.id)
    if (index >= 0) {
      agents[index] = agent
    } else {
      agents.push(agent)
    }
    saveCustomAgents(agents)
    return { success: true }
  })

  ipcMain.handle('agents:delete', (_, id: string) => {
    const agents = loadCustomAgents()
    const filtered = agents.filter((a) => a.id !== id)
    saveCustomAgents(filtered)
    return { success: true }
  })
}
