import { useState, useRef, useEffect, useCallback } from 'react'
import { Plus, X, Circle, StickyNote, Terminal, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'

export interface Tab {
  id: string
  name: string
  type: 'terminal' | 'note'
  terminalId: string | null
  connected: boolean
  initialCommand?: string
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
  const [renamingId, setRenamingId]     = useState<string | null>(null)
  const [renameValue, setRenameValue]   = useState('')
  const [showAddMenu, setShowAddMenu]   = useState(false)
  const [canScrollLeft, setCanScrollLeft]   = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [draggedTabId, setDraggedTabId]   = useState<string | null>(null)
  const [dragOverTabId, setDragOverTabId] = useState<string | null>(null)

  const addMenuRef  = useRef<HTMLDivElement>(null)
  const scrollRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Detecta se há overflow scrollável
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const obs = new ResizeObserver(updateScrollState)
    obs.observe(el)
    return () => { el.removeEventListener('scroll', updateScrollState); obs.disconnect() }
  }, [updateScrollState, tabs])

  // Rola para manter a tab ativa visível
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const activeEl = el.querySelector('[data-active="true"]') as HTMLElement | null
    activeEl?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' })
  }, [activeTabId])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -120 : 120, behavior: 'smooth' })
  }

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTabId(id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', id)
  }
  const handleDragOver = (e: React.DragEvent, id: string) => {
    if (draggedTabId === id) return; e.preventDefault(); setDragOverTabId(id)
  }
  const handleDragLeave = () => setDragOverTabId(null)
  const handleDragEnd   = () => { setDraggedTabId(null); setDragOverTabId(null) }
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault(); setDragOverTabId(null)
    if (!draggedTabId || draggedTabId === targetId) return
    const si = tabs.findIndex(t => t.id === draggedTabId)
    const ei = tabs.findIndex(t => t.id === targetId)
    if (si !== -1 && ei !== -1) onReorderTabs(si, ei)
    setDraggedTabId(null)
  }

  const commitRename = (tabId: string) => {
    if (renameValue.trim()) onRenameTab(tabId, renameValue.trim())
    setRenamingId(null)
  }

  const getIcon = (tab: Tab, isActive: boolean) => {
    if (tab.type === 'note') return <StickyNote className={`w-3 h-3 flex-shrink-0 ${isActive ? 'text-amber-400' : 'tx-faint'}`} />
    const lower = tab.name.toLowerCase()
    if (lower.includes('claude'))      return <img src="/icons/claude-code.svg" className="w-3.5 h-3.5 flex-shrink-0" alt="Claude" />
    if (lower.includes('antigravity') || lower.includes('agy')) return <img src="/icons/antigravity.svg" className="w-3.5 h-3.5 flex-shrink-0" alt="Antigravity" />
    if (lower.includes('codex'))       return <img src="/icons/codex.svg" className="w-3.5 h-3.5 flex-shrink-0" alt="Codex" />
    return <Circle className={`w-2 h-2 flex-shrink-0 ${tab.connected ? 'text-emerald-400 fill-emerald-400' : 'tx-faint fill-current'}`} />
  }

  const addMenuItems = [
    { label: 'Novo Terminal',   icon: Terminal,   iconColor: 'text-emerald-400', action: () => onAddTerminal(), dividerAfter: true },
    { label: 'Claude Code',     iconPath: '/icons/claude-code.svg', action: () => onAddTerminal({ name: 'Claude Code',  initialCommand: 'claude --dangerously-skip-permissions\r' }) },
    { label: 'Antigravity CLI', iconPath: '/icons/antigravity.svg', action: () => onAddTerminal({ name: 'Antigravity',  initialCommand: 'agy --dangerously-skip-permissions\r' }) },
    { label: 'Codex CLI',       iconPath: '/icons/codex.svg',       action: () => onAddTerminal({ name: 'Codex CLI',    initialCommand: 'codex --yolo\r' }) },
    { label: 'Nova Anotação',   icon: StickyNote, iconColor: 'text-amber-400',   action: onAddNote, divider: true },
  ]



  return (
    <div className="editor-tabs-bar flex items-center overflow-visible gap-0">

      {/* Seta esquerda — aparece quando há scroll para a esquerda */}
      <button
        onClick={() => scroll('left')}
        className={`flex-shrink-0 p-0.5 rounded transition-all ${canScrollLeft ? 'text-[var(--tx-muted)] hover:text-[var(--tx-primary)] hover:bg-[var(--line-subtle)]' : 'opacity-0 pointer-events-none w-0 overflow-hidden'}`}
        style={{ width: canScrollLeft ? undefined : 0 }}
        tabIndex={-1}
        aria-hidden={!canScrollLeft}
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {/* Container scrollável de tabs */}
      <div
        ref={scrollRef}
        className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-none min-w-0"
      >
        {tabs.map(tab => {
          const isActive   = tab.id === activeTabId
          const isDragging = tab.id === draggedTabId
          const isDragOver = tab.id === dragOverTabId
          return (
            <div
              key={tab.id}
              data-active={isActive}
              onClick={() => onSelectTab(tab.id)}
              draggable={renamingId !== tab.id}
              onDragStart={e => handleDragStart(e, tab.id)}
              onDragOver={e => handleDragOver(e, tab.id)}
              onDragLeave={handleDragLeave}
              onDragEnd={handleDragEnd}
              onDrop={e => handleDrop(e, tab.id)}
              className={`editor-tab flex-shrink-0 group ${isActive ? 'active' : ''} ${isDragging ? 'opacity-40 scale-95 border-dashed' : ''} ${isDragOver ? '!border-blue-500/60 !text-blue-400' : ''}`}
              style={isDragOver ? { backgroundColor: 'rgba(59,130,246,0.05)' } : {}}
            >
              {getIcon(tab, isActive)}
              {renamingId === tab.id ? (
                <input
                  autoFocus value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={() => commitRename(tab.id)}
                  onKeyDown={e => e.key === 'Enter' && commitRename(tab.id)}
                  className="bg-transparent outline-none text-xs w-20 px-1 py-0.5 rounded"
                  style={{ backgroundColor: 'var(--surface-base)', border: '1px solid rgba(59,130,246,0.6)', color: 'var(--tx-primary)' }}
                />
              ) : (
                <span onDoubleClick={() => { setRenamingId(tab.id); setRenameValue(tab.name) }} className="truncate max-w-[80px]">
                  {tab.name}
                </span>
              )}
              {tabs.length > 1 && (
                <button
                  onClick={e => onRemoveTab(tab.id, e)}
                  className={`p-0.5 rounded-md hover:bg-[var(--line-subtle)] text-[var(--tx-muted)] hover:text-[var(--tx-primary)] transition-all flex-shrink-0 flex items-center justify-center ml-1 ${isActive ? 'opacity-70' : 'opacity-0'} group-hover:opacity-100`}
                  title="Fechar aba"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Seta direita — aparece quando há mais tabs para a direita */}
      <button
        onClick={() => scroll('right')}
        className={`flex-shrink-0 p-0.5 rounded transition-all ${canScrollRight ? 'text-[var(--tx-muted)] hover:text-[var(--tx-primary)] hover:bg-[var(--line-subtle)]' : 'opacity-0 pointer-events-none'}`}
        style={{ width: canScrollRight ? undefined : 0 }}
        tabIndex={-1}
        aria-hidden={!canScrollRight}
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      {/* Separador visual */}
      <div className="w-px h-4 flex-shrink-0 mx-0.5" style={{ backgroundColor: 'var(--line)' }} />

      {/* Botão adicionar — vira × quando o menu está aberto */}
      <div ref={addMenuRef} className="relative flex-shrink-0">
        <button
          onClick={() => setShowAddMenu(v => !v)}
          className={`p-1 rounded flex items-center gap-0.5 transition-colors ${showAddMenu ? 'text-[var(--tx-primary)] bg-[var(--line-subtle)]' : 'btn-ghost'}`}
          title={showAddMenu ? 'Fechar menu' : 'Novo terminal'}
        >
          {showAddMenu ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {!showAddMenu && <ChevronDown className="w-2.5 h-2.5" />}
        </button>

        {showAddMenu && (
          <div
            className="absolute right-0 top-full mt-1.5 w-44 rounded-lg shadow-xl border focus:outline-none z-50 overflow-hidden backdrop-blur-md animate-fade-in"
            style={{
              backgroundColor: 'var(--surface-overlay)',
              borderColor: 'var(--line)'
            }}
          >
            <div className="py-1 max-h-60 overflow-y-auto">
              {addMenuItems.map(item => (
                <div key={item.label}>
                  {item.divider && <div className="h-px my-1" style={{ backgroundColor: 'var(--line)' }} />}
                  <button
                    onClick={() => { item.action(); setShowAddMenu(false) }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-800/20 text-neutral-300 hover:text-white transition flex items-center gap-2"
                  >
                    {item.iconPath ? <img src={item.iconPath} className="w-3.5 h-3.5 flex-shrink-0" alt={item.label} />
                      : item.icon ? <item.icon className={`w-3.5 h-3.5 ${item.iconColor || ''}`} /> : null}
                    <span>{item.label}</span>
                  </button>
                  {item.dividerAfter && <div className="h-px my-1" style={{ backgroundColor: 'var(--line)' }} />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
