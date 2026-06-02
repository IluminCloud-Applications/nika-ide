import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

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

interface TerminalContextProps {
  projectStates: Record<string, ProjectState>
  activeSessions: GlobalSession[]
  drawerVisible: boolean
  setDrawerVisible: (visible: boolean) => void
  terminalProjectPath: string
  setTerminalProjectPath: (path: string) => void
  getProjectState: (projectPath: string) => ProjectState
  addProjectTab: (projectPath: string, type: 'terminal' | 'note', opts?: { name?: string; initialCommand?: string }) => void
  removeProjectTab: (projectPath: string, tabId: string) => void
  renameProjectTab: (projectPath: string, tabId: string, name: string) => void
  reorderProjectTabs: (projectPath: string, startIndex: number, endIndex: number) => void
  setProjectActiveTabId: (projectPath: string, activeTabId: string) => void
  registerTerminal: (terminalId: string, projectPath: string, projectName: string, tabId: string, tabName: string) => void
  getSession: (terminalId: string) => GlobalSession | undefined
  getSessionsForProject: (projectPath: string) => Record<string, GlobalSession>
  writeTerminal: (terminalId: string, data: string) => void
  killTerminal: (terminalId: string) => void
  resizeTerminal: (terminalId: string, cols: number, rows: number) => void
  subscribe: (terminalId: string, onData: (data: string) => void, onExit: () => void) => () => void
  reopenProject?: (projectPath: string, activeTabId?: string) => void
}

const TerminalContext = createContext<TerminalContextProps | undefined>(undefined)

export function useTerminalContext() {
  const context = useContext(TerminalContext)
  if (!context) throw new Error('useTerminalContext must be used within a TerminalProvider')
  return context
}

interface TerminalProviderProps {
  children: React.ReactNode
  reopenProject?: (projectPath: string, activeTabId?: string) => void
}

export function TerminalProvider({ children, reopenProject }: TerminalProviderProps) {
  const sessionsRef = useRef<Record<string, GlobalSession>>({})
  const [renderTick, setRenderTick] = useState(0)
  const forceUpdate = useCallback(() => setRenderTick(t => t + 1), [])
  const [projectStates, setProjectStates] = useState<Record<string, ProjectState>>({})
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [terminalProjectPath, setTerminalProjectPath] = useState<string>('')

  const getSessionsForProject = useCallback((projectPath: string): Record<string, GlobalSession> => {
    const result: Record<string, GlobalSession> = {}
    Object.values(sessionsRef.current).forEach(s => {
      if (s.projectPath === projectPath) result[s.tabId] = s
    })
    return result
  }, [])

  const getProjectState = useCallback((projectPath: string): ProjectState => {
    let baseState = projectStates[projectPath]
    if (!baseState) {
      let tabs: Tab[] = [{ id: '1', name: 'Terminal 1', type: 'terminal', terminalId: null, connected: false }]
      let activeTabId = '1'
      try {
        const savedTabs = localStorage.getItem(`terminal_drawer_tabs:${projectPath}`)
        const savedActive = localStorage.getItem(`terminal_drawer_active_tab:${projectPath}`)
        if (savedTabs) tabs = JSON.parse(savedTabs).map((t: Tab) => ({ ...t, terminalId: null, connected: false }))
        if (savedActive) activeTabId = savedActive
      } catch {}
      baseState = { tabs, activeTabId }
    }

    const sessions = getSessionsForProject(projectPath)
    const reconciledTabs = baseState.tabs.map(tab => {
      const live = sessions[tab.id]
      if (live && live.connected) {
        return { ...tab, terminalId: live.terminalId, connected: true }
      }
      return { ...tab, terminalId: null, connected: false }
    })

    return { tabs: reconciledTabs, activeTabId: baseState.activeTabId }
  }, [projectStates, getSessionsForProject])

  const saveToStorage = (projectPath: string, tabs: Tab[], activeTabId: string) => {
    const toSave = tabs.map(t => ({ ...t, terminalId: null, connected: false }))
    localStorage.setItem(`terminal_drawer_tabs:${projectPath}`, JSON.stringify(toSave))
    localStorage.setItem(`terminal_drawer_active_tab:${projectPath}`, activeTabId)
  }

  const addProjectTab = useCallback((projectPath: string, type: 'terminal' | 'note', opts?: { name?: string; initialCommand?: string }) => {
    setProjectStates(prev => {
      const curr = prev[projectPath] || { tabs: [], activeTabId: '' }
      const count = curr.tabs.filter(t => t.type === type).length + 1
      const defaultName = type === 'terminal' ? `Terminal ${count}` : `Nota ${count}`
      const newTab: Tab = {
        id: Date.now().toString(),
        name: opts?.name ?? defaultName,
        type,
        terminalId: null,
        connected: false,
        initialCommand: opts?.initialCommand
      }
      const newTabs = [...curr.tabs, newTab]
      saveToStorage(projectPath, newTabs, newTab.id)
      return { ...prev, [projectPath]: { tabs: newTabs, activeTabId: newTab.id } }
    })
  }, [])

  const killTerminal = useCallback((terminalId: string) => {
    window.api.terminal.kill(terminalId)
    const session = sessionsRef.current[terminalId]
    if (session) {
      session.cleanup()
      delete sessionsRef.current[terminalId]
      forceUpdate()
    }
  }, [forceUpdate])

  const removeProjectTab = useCallback((projectPath: string, tabId: string) => {
    setProjectStates(prev => {
      const curr = prev[projectPath]
      if (!curr) return prev
      const tab = curr.tabs.find(t => t.id === tabId)
      if (tab?.type === 'terminal' && tab.terminalId) killTerminal(tab.terminalId)
      if (tab?.type === 'note') localStorage.removeItem(`note:${projectPath}:${tabId}`)
      const remaining = curr.tabs.filter(t => t.id !== tabId)
      const nextActiveId = curr.activeTabId === tabId ? (remaining.length > 0 ? remaining[0].id : '') : curr.activeTabId
      saveToStorage(projectPath, remaining, nextActiveId)
      return { ...prev, [projectPath]: { tabs: remaining, activeTabId: nextActiveId } }
    })
  }, [killTerminal])

  const renameProjectTab = useCallback((projectPath: string, tabId: string, name: string) => {
    setProjectStates(prev => {
      const curr = prev[projectPath]
      if (!curr) return prev
      const updated = curr.tabs.map(t => t.id === tabId ? { ...t, name } : t)
      saveToStorage(projectPath, updated, curr.activeTabId)
      return { ...prev, [projectPath]: { ...curr, tabs: updated } }
    })
  }, [])

  const reorderProjectTabs = useCallback((projectPath: string, startIndex: number, endIndex: number) => {
    setProjectStates(prev => {
      const curr = prev[projectPath]
      if (!curr) return prev
      const result = Array.from(curr.tabs)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      saveToStorage(projectPath, result, curr.activeTabId)
      return { ...prev, [projectPath]: { ...curr, tabs: result } }
    })
  }, [])

  const setProjectActiveTabId = useCallback((projectPath: string, activeTabId: string) => {
    setProjectStates(prev => {
      const curr = prev[projectPath]
      if (!curr) return prev
      localStorage.setItem(`terminal_drawer_active_tab:${projectPath}`, activeTabId)
      return { ...prev, [projectPath]: { ...curr, activeTabId } }
    })
  }, [])

  const registerTerminal = useCallback((terminalId: string, projectPath: string, projectName: string, tabId: string, tabName: string) => {
    if (sessionsRef.current[terminalId]) {
      sessionsRef.current[terminalId].tabId = tabId
      sessionsRef.current[terminalId].tabName = tabName
      return
    }
    const listeners = new Set<(data: string) => void>()
    const exitListeners = new Set<() => void>()
    const cleanupData = window.api.terminal.onData(terminalId, (data: string) => {
      const session = sessionsRef.current[terminalId]
      if (session) { session.dataBuffer += data; listeners.forEach(cb => cb(data)) }
    })
    const cleanupExit = window.api.terminal.onExit(terminalId, () => {
      const session = sessionsRef.current[terminalId]
      if (session) { session.connected = false; exitListeners.forEach(cb => cb()); forceUpdate() }
    })
    sessionsRef.current[terminalId] = {
      terminalId, projectPath, projectName, tabId, tabName,
      dataBuffer: '', connected: true, listeners, exitListeners, cleanup: () => { cleanupData(); cleanupExit() }
    }
    forceUpdate()
  }, [forceUpdate])

  const writeTerminal = useCallback((terminalId: string, data: string) => window.api.terminal.write(terminalId, data), [])
  const resizeTerminal = useCallback((terminalId: string, cols: number, rows: number) => window.api.terminal.resize(terminalId, cols, rows), [])
  const getSession = useCallback((terminalId: string) => sessionsRef.current[terminalId], [])
  
  const subscribe = useCallback((terminalId: string, onData: (data: string) => void, onExit: () => void) => {
    const session = sessionsRef.current[terminalId]
    if (!session) return () => {}
    session.listeners.add(onData)
    session.exitListeners.add(onExit)
    return () => {
      session.listeners.delete(onData)
      session.exitListeners.delete(onExit)
    }
  }, [])

  useEffect(() => {
    return () => Object.values(sessionsRef.current).forEach(s => s.cleanup())
  }, [])

  const activeSessions = Object.values(sessionsRef.current).filter(s => s.connected)
  void renderTick

  return (
    <TerminalContext.Provider value={{
      projectStates, activeSessions, drawerVisible, setDrawerVisible, getProjectState,
      addProjectTab, removeProjectTab, renameProjectTab, reorderProjectTabs, setProjectActiveTabId,
      registerTerminal, getSession, getSessionsForProject, writeTerminal, killTerminal, resizeTerminal, subscribe, reopenProject,
      terminalProjectPath, setTerminalProjectPath
    }}>
      {children}
    </TerminalContext.Provider>
  )
}
