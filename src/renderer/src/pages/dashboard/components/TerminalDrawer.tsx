import { useState, useEffect, useCallback } from 'react'
import { X, ExternalLink } from 'lucide-react'
import '@xterm/xterm/css/xterm.css'
import AgentSelector from './AgentSelector'
import DrawerTabs from './terminal/TerminalTabs'
import NotepadView from './terminal/NotepadView'
import ResizeHandle from './terminal/ResizeHandle'
import TerminalSession from './terminal/TerminalSession'
import TerminalEmptyState from './terminal/TerminalEmptyState'
import { useTerminalContext } from '../../../context/TerminalContext'

const MIN_WIDTH     = 320
const MAX_WIDTH     = 800
const DEFAULT_WIDTH = 450

interface TerminalDrawerProps {
  projectPath: string
  isOpen: boolean
  onClose: () => void
  onProjectPathChange?: (path: string) => void
  isGlobal?: boolean
}

export default function TerminalDrawer({
  projectPath,
  isOpen,
  onClose,
  onProjectPathChange,
  isGlobal = false
}: TerminalDrawerProps) {
  const {
    getProjectState,
    addProjectTab,
    removeProjectTab,
    renameProjectTab,
    reorderProjectTabs,
    setProjectActiveTabId,
    activeSessions,
    reopenProject
  } = useTerminalContext()

  const projectsWithSessions = Array.from(
    new Map(activeSessions.map(s => [s.projectPath, s.projectName])).entries()
  ).map(([path, name]) => ({ path, name }))

  const { tabs, activeTabId } = getProjectState(projectPath)
  const [width, setWidth] = useState<number>(() => Number(localStorage.getItem('terminal_drawer_width')) || DEFAULT_WIDTH)

  useEffect(() => {
    localStorage.setItem('terminal_drawer_width', width.toString())
    window.api.settings.set({ terminal_drawer_width: width.toString() }).catch(console.error)
  }, [width])

  const activeTab      = tabs.find(t => t.id === activeTabId)

  const handleResize = useCallback((delta: number) => {
    setWidth(w => Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, w + delta)))
  }, [])

  const sendToTerminal = (terminalId: string, text: string) => {
    window.api.terminal.write(terminalId, text)
  }

  const addTerminal = (opts?: { name?: string; initialCommand?: string }) => {
    addProjectTab(projectPath, 'terminal', opts)
  }

  const addNote = () => {
    addProjectTab(projectPath, 'note')
  }

  const removeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    removeProjectTab(projectPath, id)
    // When last tab is removed we stay open and show empty state
    // so the user can create a new session without losing context
  }

  const renameTab = (id: string, name: string) => {
    renameProjectTab(projectPath, id, name)
  }

  const handleReorderTabs = (startIndex: number, endIndex: number) => {
    reorderProjectTabs(projectPath, startIndex, endIndex)
  }

  return (
    <>
      {isOpen && <ResizeHandle onResize={handleResize} />}
      <div
        style={{ width: isOpen ? width : 0, display: isOpen ? 'flex' : 'none' }}
        className="editor-terminal h-full flex-shrink-0"
      >
        {/* Header */}
        <div className="editor-terminal-header border-b" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
            {/* Seletor de Agente de IA — ocupa o lugar do título do terminal */}
            <AgentSelector projectPath={projectPath} />

            {projectsWithSessions.length > 1 && onProjectPathChange && (
              // Seletor de projetos em abas compactas se houver múltiplos
              <>
                <div className="w-px h-5 flex-shrink-0" style={{ backgroundColor: 'var(--line)' }} />
                <div className="flex items-center gap-1.5 min-w-0 overflow-x-auto no-scrollbar py-0.5">
                  {projectsWithSessions.map(proj => {
                    const isActive = proj.path === projectPath
                    return (
                      <button
                        key={proj.path}
                        onClick={() => onProjectPathChange(proj.path)}
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition whitespace-nowrap ${
                          isActive
                            ? 'bg-blue-600/10 border border-blue-500/30 text-blue-400 font-semibold'
                            : 'bg-transparent border border-transparent text-neutral-400 hover:text-neutral-200'
                        }`}
                        title={proj.name}
                      >
                        {proj.name}
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {isGlobal && (
              <button
                onClick={() => {
                  reopenProject?.(projectPath, activeTabId)
                  onClose()
                }}
                className="p-1 hover:bg-[var(--line-subtle)] rounded-md text-[var(--tx-muted)] hover:text-[var(--tx-primary)] transition flex items-center justify-center"
                title="Abrir no Projeto (Ir para o Dashboard)"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[var(--line-subtle)] rounded-md text-[var(--tx-muted)] hover:text-[var(--tx-primary)] transition-colors flex items-center justify-center"
              title="Fechar Terminal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tabs bar — hidden when empty (empty state handles creation) */}
        {tabs.length > 0 && (
          <DrawerTabs
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={(id) => setProjectActiveTabId(projectPath, id)}
            onAddTerminal={addTerminal}
            onAddNote={addNote}
            onRemoveTab={removeTab}
            onRenameTab={renameTab}
            onReorderTabs={handleReorderTabs}
          />
        )}

        {/* Content */}
        {tabs.length === 0 ? (
          <TerminalEmptyState
            onAddTerminal={addTerminal}
            onAddNote={addNote}
          />
        ) : (
          <>
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
                onSelectTab={(id) => setProjectActiveTabId(projectPath, id)}
              />
            )}
          </>
        )}
      </div>
    </>
  )
}
