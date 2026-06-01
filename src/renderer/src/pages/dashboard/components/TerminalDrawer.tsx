import { useState, useEffect, useCallback } from 'react'
import { Terminal as TermIcon, X } from 'lucide-react'
import 'xterm/css/xterm.css'
import DrawerTabs, { Tab } from './terminal/TerminalTabs'
import NotepadView from './terminal/NotepadView'
import ResizeHandle from './terminal/ResizeHandle'
import TerminalSession from './terminal/TerminalSession'

const MIN_WIDTH     = 320
const MAX_WIDTH     = 800
const DEFAULT_WIDTH = 450

interface TerminalDrawerProps {
  projectPath: string
  isOpen: boolean
  onClose: () => void
}

export default function TerminalDrawer({ projectPath, isOpen, onClose }: TerminalDrawerProps) {
  const [tabs, setTabs]         = useState<Tab[]>(() => {
    try {
      const saved = localStorage.getItem(`terminal_drawer_tabs:${projectPath}`)
      if (saved) return JSON.parse(saved).map((t: Tab) => ({ ...t, terminalId: null, connected: false }))
    } catch {}
    return [{ id: '1', name: 'Terminal 1', type: 'terminal', terminalId: null, connected: false }]
  })
  const [activeTabId, setActiveTabId] = useState<string>(() => localStorage.getItem(`terminal_drawer_active_tab:${projectPath}`) || '1')
  const [width, setWidth]             = useState<number>(() => Number(localStorage.getItem('terminal_drawer_width')) || DEFAULT_WIDTH)
  // Save drawer tabs and active tab to localStorage on changes
  useEffect(() => {
    const toSave = tabs.map(t => ({ ...t, terminalId: null, connected: false }))
    localStorage.setItem(`terminal_drawer_tabs:${projectPath}`, JSON.stringify(toSave))
    localStorage.setItem(`terminal_drawer_active_tab:${projectPath}`, activeTabId)
  }, [tabs, activeTabId, projectPath])

  // Save drawer width to localStorage on change
  useEffect(() => {
    localStorage.setItem('terminal_drawer_width', width.toString())
  }, [width])

  const activeTab      = tabs.find(t => t.id === activeTabId)
  const isTerminalTab  = activeTab?.type === 'terminal'

  const handleResize = useCallback((delta: number) => {
    setWidth(w => Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, w + delta)))
  }, [])

  const sendToTerminal = (terminalId: string, text: string) => {
    window.api.terminal.write(terminalId, text)
  }

  const addTerminal = (opts?: { name?: string; initialCommand?: string }) => {
    const id    = Date.now().toString()
    const count = tabs.filter(t => t.type === 'terminal').length + 1
    const name  = opts?.name ?? `Terminal ${count}`
    setTabs(prev => [
      ...prev,
      { id, name, type: 'terminal', terminalId: null, connected: false, initialCommand: opts?.initialCommand }
    ])
    setActiveTabId(id)
  }

  const addNote = () => {
    const id    = Date.now().toString()
    const count = tabs.filter(t => t.type === 'note').length + 1
    setTabs(prev => [...prev, { id, name: `Nota ${count}`, type: 'note', terminalId: null, connected: false }])
    setActiveTabId(id)
  }

  const removeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const tab = tabs.find(t => t.id === id)
    if (tab?.type === 'terminal' && tab.terminalId) window.api.terminal.kill(tab.terminalId)
    if (tab?.type === 'note') localStorage.removeItem(`note:${projectPath}:${id}`)
    const remaining = tabs.filter(t => t.id !== id)
    if (remaining.length === 0) { onClose(); return }
    setTabs(remaining)
    if (activeTabId === id) setActiveTabId(remaining[0].id)
  }

  const renameTab = (id: string, name: string) => {
    setTabs(prev => prev.map(t => t.id === id ? { ...t, name } : t))
  }

  const handleReorderTabs = (startIndex: number, endIndex: number) => {
    setTabs(prev => {
      const result = Array.from(prev)
      const [removed] = result.splice(startIndex, 1)
      result.splice(endIndex, 0, removed)
      return result
    })
  }

  return (
    <>
      {isOpen && <ResizeHandle onResize={handleResize} />}
      <div
        style={{ width: isOpen ? width : 0, display: isOpen ? 'flex' : 'none' }}
        className="editor-terminal h-full flex-shrink-0"
      >
        {/* Header */}
        <div className="editor-terminal-header">
          <div className="flex items-center gap-2">
            <TermIcon className="w-3.5 h-3.5 tx-muted" />
            <span className="text-[11px] font-semibold tx-muted uppercase tracking-widest">
              {isTerminalTab ? 'Terminal' : 'Anotação'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[var(--line-subtle)] rounded-md text-[var(--tx-muted)] hover:text-[var(--tx-primary)] transition-colors flex items-center justify-center"
            title="Fechar Terminal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tabs bar */}
        <DrawerTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
          onAddTerminal={addTerminal}
          onAddNote={addNote}
          onRemoveTab={removeTab}
          onRenameTab={renameTab}
          onReorderTabs={handleReorderTabs}
        />

        {/* Content */}
        {tabs.map((t) => {
          if (t.type !== 'terminal') return null
          const isActive = t.id === activeTabId
          return (
            <div
              key={t.id}
              style={{ display: isActive ? 'flex' : 'none' }}
              className="flex-1 flex flex-col overflow-hidden p-2 animate-fade-in min-w-0 min-h-0"
            >
              <TerminalSession
                projectPath={projectPath}
                tab={t}
                isOpen={isOpen && isActive}
                drawerWidth={width}
                onTerminalCreated={(termId) => {
                  setTabs(prev => prev.map(tab => tab.id === t.id ? { ...tab, terminalId: termId, connected: true } : tab))
                }}
                onTerminalExit={() => {
                  setTabs(prev => prev.map(tab => tab.id === t.id ? { ...tab, connected: false } : tab))
                }}
              />
            </div>
          )
        })}

        {activeTab?.type === 'note' && (
          <NotepadView
            noteId={activeTab.id}
            projectPath={projectPath}
            terminalTabs={tabs}
            onSendToTerminal={sendToTerminal}
          />
        )}
      </div>
    </>
  )
}
