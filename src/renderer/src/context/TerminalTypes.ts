export interface Tab {
  id: string
  name: string
  type: 'terminal' | 'note'
  terminalId: string | null
  connected: boolean
  initialCommand?: string
}

export interface ProjectState {
  tabs: Tab[]
  activeTabId: string
}

export interface GlobalSession {
  terminalId: string
  projectPath: string
  projectName: string
  tabId: string
  tabName: string
  dataBuffer: string
  connected: boolean
  listeners: Set<(data: string) => void>
  exitListeners: Set<() => void>
  cleanup: () => void
}
