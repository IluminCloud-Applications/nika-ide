import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { Project } from '../../../App'
import ProjectCard from './ProjectCard'
import ProjectModals from './ProjectModals'
import { SortCol, SortDir, loadPinned, savePinned } from './utils'

interface ProjectsGridProps {
  projects: Project[]
  archivedProjects: Project[]
  search: string
  activeFilter: 'all' | 'active' | 'archived'
  onSelectProject: (p: Project) => void
  onRollback: (projectPath: string, hash: string) => Promise<void>
  onStatusChange: (id: string) => void
  onUpdate: (id: string, updates: Partial<Project>) => Promise<void>
  onArchive: (id: string) => Promise<void>
  onRestore?: (id: string) => Promise<void>
}

const SORT_OPTIONS: { key: string; label: string; col: SortCol; dir: SortDir }[] = [
  { key: 'createdAt-desc', label: 'Mais recentes', col: 'createdAt', dir: 'desc' },
  { key: 'createdAt-asc', label: 'Mais antigos', col: 'createdAt', dir: 'asc' },
  { key: 'name-asc', label: 'Nome (A-Z)', col: 'name', dir: 'asc' },
  { key: 'name-desc', label: 'Nome (Z-A)', col: 'name', dir: 'desc' },
]

export default function ProjectsGrid({
  projects,
  archivedProjects,
  search,
  activeFilter,
  onSelectProject,
  onRollback,
  onStatusChange,
  onUpdate,
  onArchive,
  onRestore
}: ProjectsGridProps) {
  const [historyProject, setHistoryProject] = useState<Project | null>(null)
  const [editProject, setEditProject]       = useState<Project | null>(null)
  const [archiveProject, setArchiveProject] = useState<Project | null>(null)
  const [saving, setSaving]                 = useState(false)
  
  const [sort, setSort]                     = useState<{ col: SortCol; dir: SortDir }>({ col: 'createdAt', dir: 'desc' })
  const [pinned, setPinned]                 = useState<Set<string>>(loadPinned)

  const [showSortMenu, setShowSortMenu]     = useState(false)
  const sortMenuRef                         = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target as Node)) {
        setShowSortMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const togglePin = (id: string) =>
    setPinned(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      savePinned(next)
      return next
    })

  const handleSaveEdit = async (updates: Partial<Project>) => {
    if (!editProject) return
    setSaving(true)
    try { await onUpdate(editProject.id, updates); setEditProject(null) }
    finally { setSaving(false) }
  }

  const allList = useMemo(() => {
    return [
      ...projects.map(p => ({ ...p, isArchived: false })),
      ...archivedProjects.map(p => ({ ...p, isArchived: true }))
    ]
  }, [projects, archivedProjects])

  const filtered = useMemo(() => {
    return allList.filter(p => {
      const query = search.toLowerCase()
      const matchSearch = p.name.toLowerCase().includes(query) || 
                          (p.description && p.description.toLowerCase().includes(query))
      const matchFilter = activeFilter === 'all' || 
                          (activeFilter === 'active' && !p.isArchived) || 
                          (activeFilter === 'archived' && p.isArchived)
      return matchSearch && matchFilter
    })
  }, [allList, search, activeFilter])

  const sorted = useMemo(() => {
    const list = [...filtered]
    
    list.sort((a, b) => {
      const av = sort.col === 'name' ? a.name.toLowerCase() : a.createdAt
      const bv = sort.col === 'name' ? b.name.toLowerCase() : b.createdAt
      
      if (sort.col === 'createdAt') {
        return sort.dir === 'asc' 
          ? new Date(av).getTime() - new Date(bv).getTime()
          : new Date(bv).getTime() - new Date(av).getTime()
      }
      
      return sort.dir === 'asc' 
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av))
    })

    return [...list.filter(p => pinned.has(p.id)), ...list.filter(p => !pinned.has(p.id))]
  }, [filtered, sort, pinned])

  const activeSortLabel = SORT_OPTIONS.find(opt => opt.col === sort.col && opt.dir === sort.dir)?.label || 'Ordenar'

  return (
    <>
      <div className="flex items-center justify-end gap-2 mb-6 w-full">
        <span className="text-xs tx-muted whitespace-nowrap">Ordenar:</span>
        <div className="relative text-left" ref={sortMenuRef}>
          <button
            type="button"
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="input-field py-1.5 pl-3 pr-8 text-xs cursor-pointer select-none flex items-center gap-1.5 relative w-36 text-left"
            style={{
              backgroundColor: 'var(--surface-overlay)',
              border: '1px solid var(--line)',
              borderRadius: '8px'
            }}
          >
            <span className="truncate">{activeSortLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 tx-muted absolute right-2.5 top-1/2 -translate-y-1/2" />
          </button>

          {showSortMenu && (
            <div
              className="absolute right-0 mt-1 w-40 rounded-lg border shadow-xl z-50 p-1 animate-in fade-in slide-in-from-top-1 duration-100"
              style={{ backgroundColor: 'var(--surface-overlay)', borderColor: 'var(--line)' }}
            >
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => { setSort({ col: opt.col, dir: opt.dir }); setShowSortMenu(false) }}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${
                    sort.col === opt.col && sort.dir === opt.dir ? 'bg-blue-600/10 text-blue-400 font-medium' : 'tx-secondary hover:text-white hover:bg-white/5'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div 
          className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-dashed text-center"
          style={{ borderColor: 'var(--line)', backgroundColor: 'var(--surface-raised)' }}
        >
          <span className="text-sm tx-muted">Nenhum projeto encontrado.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-10 animate-fade-in">
          {sorted.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onOpen={project.isArchived ? undefined : () => onSelectProject(project)}
              onHistory={project.isArchived ? undefined : () => setHistoryProject(project)}
              onEdit={project.isArchived ? undefined : () => setEditProject(project)}
              onArchive={project.isArchived ? undefined : () => setArchiveProject(project)}
              onRestore={project.isArchived && onRestore ? () => onRestore(project.id) : undefined}
              isArchived={project.isArchived}
              isPinned={pinned.has(project.id)}
              onTogglePin={project.isArchived ? undefined : () => togglePin(project.id)}
            />
          ))}
        </div>
      )}

      <ProjectModals
        historyProject={historyProject}
        onCloseHistory={() => setHistoryProject(null)}
        onRollback={onRollback}
        onStatusChange={onStatusChange}
        editProject={editProject}
        onCloseEdit={() => setEditProject(null)}
        onSaveEdit={handleSaveEdit}
        saving={saving}
        archiveProject={archiveProject}
        onCloseArchive={() => setArchiveProject(null)}
        onArchive={onArchive}
      />
    </>
  )
}
