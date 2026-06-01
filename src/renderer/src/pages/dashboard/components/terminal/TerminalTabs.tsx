import { useState, useRef, useEffect } from 'react'
import { Plus, X, Circle, StickyNote, Terminal, ChevronDown } from 'lucide-react'

export interface Tab {
  id: string
  name: string
  type: 'terminal' | 'note'
  terminalId: string | null
  connected: boolean
  initialCommand?: string   // sent once after terminal connects
}

interface DrawerTabsProps {
  tabs: Tab[]
  activeTabId: string
  onSelectTab: (id: string) => void
  onAddTerminal: (opts?: { name?: string; initialCommand?: string }) => void
  onAddNote: () => void
  onRemoveTab: (id: string, e: React.MouseEvent) => void
  onRenameTab: (id: string, name: string) => void
  onReorderTabs: (startIndex: number, endIndex: number) => void
}

export default function DrawerTabs({
  tabs, activeTabId, onSelectTab, onAddTerminal, onAddNote, onRemoveTab, onRenameTab, onReorderTabs
}: DrawerTabsProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(null)
  const addBtnRef = useRef<HTMLButtonElement>(null)

  const [draggedTabId, setDraggedTabId] = useState<string | null>(null)
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTabId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    if (draggedTabId === targetId) return
    e.preventDefault()
    setDragOverTabId(targetId)
  }

  const handleDragLeave = () => {
    setDragOverTabId(null)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDragOverTabId(null)
    if (!draggedTabId || draggedTabId === targetId) return

    const startIndex = tabs.findIndex(t => t.id === draggedTabId)
    const endIndex = tabs.findIndex(t => t.id === targetId)

    if (startIndex !== -1 && endIndex !== -1) {
      onReorderTabs(startIndex, endIndex)
    }
    setDraggedTabId(null)
  }

  const handleDragEnd = () => {
    setDraggedTabId(null)
    setDragOverTabId(null)
  }

  useEffect(() => {
    if (showAddMenu && addBtnRef.current) {
      const rect = addBtnRef.current.getBoundingClientRect()
      setMenuPos({ top: rect.bottom + 4, left: rect.left })
    }
  }, [showAddMenu])

  const commitRename = (tabId: string) => {
    if (renameValue.trim()) onRenameTab(tabId, renameValue.trim())
    setRenamingId(null)
  }

  const addMenuItems = [
    {
      label: 'Novo Terminal',
      icon: Terminal,
      iconColor: 'text-emerald-400',
      action: () => onAddTerminal(),
    },
    {
      label: 'Claude Code',
      iconPath: '/icons/claude-code.svg',
      action: () => onAddTerminal({ name: 'Claude Code', initialCommand: 'claude --dangerously-skip-permissions\r' }),
    },
    {
      label: 'Antigravity CLI',
      iconPath: '/icons/antigravity.svg',
      action: () => onAddTerminal({ name: 'Antigravity', initialCommand: 'agy --dangerously-skip-permissions\r' }),
    },
    {
      label: 'Codex CLI',
      iconPath: '/icons/codex.svg',
      action: () => onAddTerminal({ name: 'Codex CLI', initialCommand: 'codex --yolo\r' }),
    },
    {
      label: 'Nova Anotação',
      icon: StickyNote,
      iconColor: 'text-amber-400',
      action: onAddNote,
      divider: true,
    },
  ]

  const getTerminalIcon = (tab: Tab, isActive: boolean) => {
    if (tab.type === 'note') {
      return <StickyNote className={`w-3 h-3 flex-shrink-0 ${isActive ? 'text-amber-400' : 'tx-faint'}`} />
    }
    const lower = tab.name.toLowerCase()
    if (lower.includes('claude')) {
      return <img src="/icons/claude-code.svg" className="w-3.5 h-3.5 flex-shrink-0" alt="Claude" />
    }
    if (lower.includes('antigravity') || lower.includes('agy')) {
      return <img src="/icons/antigravity.svg" className="w-3.5 h-3.5 flex-shrink-0" alt="Antigravity" />
    }
    if (lower.includes('codex')) {
      return <img src="/icons/codex.svg" className="w-3.5 h-3.5 flex-shrink-0" alt="Codex" />
    }
    const dotColor = tab.connected ? 'text-emerald-400 fill-emerald-400' : 'tx-faint fill-current'
    return <Circle className={`w-2 h-2 flex-shrink-0 ${dotColor}`} />
  }

  return (
    <div className="editor-tabs-bar scrollbar-none relative">
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId
        const isDragging = tab.id === draggedTabId
        const isDragOver = tab.id === dragOverTabId

        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            draggable={renamingId !== tab.id}
            onDragStart={(e) => handleDragStart(e, tab.id)}
            onDragOver={(e) => handleDragOver(e, tab.id)}
            onDragLeave={handleDragLeave}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, tab.id)}
            className={`editor-tab group ${
              isActive ? 'active' : ''
            } ${
              isDragging ? 'opacity-40 scale-95 border-dashed' : ''
            } ${
              isDragOver ? '!border-blue-500/60 !text-blue-400' : ''
            }`}
            style={isDragOver ? { backgroundColor: 'rgba(59,130,246,0.05)' } : {}}
          >
            {getTerminalIcon(tab, isActive)}
            {renamingId === tab.id ? (
              <input
                autoFocus
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onBlur={() => commitRename(tab.id)}
                onKeyDown={e => e.key === 'Enter' && commitRename(tab.id)}
                className="bg-transparent outline-none text-xs w-20 px-1 py-0.5 rounded"
                style={{ backgroundColor: 'var(--surface-base)', border: '1px solid rgba(59,130,246,0.6)', color: 'var(--tx-primary)' }}
              />
            ) : (
              <span
                onDoubleClick={() => { setRenamingId(tab.id); setRenameValue(tab.name) }}
                className="truncate max-w-[80px]"
              >
                {tab.name}
              </span>
            )}
            {tabs.length > 1 && (
              <button
                onClick={e => onRemoveTab(tab.id, e)}
                className={`p-0.5 rounded-md hover:bg-[var(--line-subtle)] text-[var(--tx-muted)] hover:text-[var(--tx-primary)] transition-all flex-shrink-0 flex items-center justify-center ml-1 ${
                  isActive ? 'opacity-70' : 'opacity-0'
                } group-hover:opacity-100`}
                title="Fechar aba"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )
      })}

      {/* Add dropdown */}
      <div className="relative ml-0.5">
        <button
          ref={addBtnRef}
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="btn-ghost p-1 rounded flex items-center gap-0.5"
          title="Adicionar tab"
        >
          <Plus className="w-3.5 h-3.5" />
          <ChevronDown className="w-2.5 h-2.5" />
        </button>

        {showAddMenu && menuPos && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setShowAddMenu(false)} />
            <div
              style={{ top: menuPos.top, left: menuPos.left }}
              className="fixed w-44 editor-dropdown z-[9999] py-1 animate-fade-in"
            >
              {addMenuItems.map((item) => (
                <div key={item.label}>
                  {item.divider && <div className="h-px my-1" style={{ backgroundColor: 'var(--line)' }} />}
                  <button
                    onClick={() => { item.action(); setShowAddMenu(false) }}
                    className="editor-dropdown-item"
                  >
                    {item.iconPath ? (
                      <img src={item.iconPath} className="w-3.5 h-3.5 flex-shrink-0" alt={item.label} />
                    ) : item.icon ? (
                      <item.icon className={`w-3.5 h-3.5 ${item.iconColor || ''}`} />
                    ) : null}
                    {item.label}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
