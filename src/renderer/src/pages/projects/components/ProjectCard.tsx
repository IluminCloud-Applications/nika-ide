import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Pin, PinOff, ExternalLink, Pencil, GitBranch, Archive, RotateCcw, Folder, Clock, FolderOpen } from 'lucide-react'
import { Project } from '../../../App'
import ProjectAvatar from './ProjectAvatar'
import { ItemCard } from '../../../components/ui/PageWidgets'

interface ProjectCardProps {
  project: Project
  onOpen?: () => void
  onHistory?: () => void
  onEdit?: () => void
  onArchive?: () => void
  onRestore?: () => void
  isArchived?: boolean
  isPinned?: boolean
  onTogglePin?: () => void
}

export default function ProjectCard({
  project,
  onOpen,
  onHistory,
  onEdit,
  onArchive,
  onRestore,
  isArchived,
  isPinned,
  onTogglePin
}: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

  const folderName = project.path.split(/[\\/]/).pop() || project.path

  return (
    <ItemCard enabled={!isArchived} accentColor={project.color} overflowVisible={true}>
      <div 
        onClick={onOpen}
        className={`p-5 flex flex-col justify-between min-h-[190px] relative ${onOpen ? 'cursor-pointer' : ''}`}
      >
        <div>
          {/* Card Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <ProjectAvatar project={project} size={40} />
              <div className="min-w-0">
                <h3 className="text-sm font-bold tx-primary leading-tight group-hover:text-blue-400 transition-colors truncate">
                  {project.name}
                </h3>
                <span className="text-[10px] tx-faint flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(project.createdAt)}
                </span>
              </div>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
              {!isArchived && onTogglePin && (
                <button
                  onClick={onTogglePin}
                  className={`p-1.5 rounded-lg transition-all duration-200 ${
                    isPinned 
                      ? 'text-blue-400 bg-blue-500/10' 
                      : 'tx-muted hover:text-blue-400 hover:bg-blue-500/10 opacity-0 group-hover:opacity-100'
                  }`}
                  title={isPinned ? 'Desafixar projeto' : 'Fixar projeto'}
                >
                  {isPinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                </button>
              )}

              {isArchived ? (
                onRestore && (
                  <button
                    onClick={onRestore}
                    className="p-1.5 rounded-lg tx-muted hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    title="Restaurar projeto"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )
              ) : (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={`p-1.5 rounded-lg tx-muted hover:tx-primary hover:bg-white/5 transition-colors ${
                      showMenu ? 'tx-primary bg-white/5' : ''
                    }`}
                    title="Mais ações"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {showMenu && (
                    <div 
                      className="absolute right-0 mt-1 w-48 rounded-lg border shadow-xl z-50 p-1 animate-in fade-in slide-in-from-top-1 duration-100"
                      style={{ backgroundColor: 'var(--surface-overlay)', borderColor: 'var(--line)' }}
                    >
                      <button
                        onClick={() => { onOpen?.(); setShowMenu(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left tx-secondary hover:text-white hover:bg-blue-600/10 hover:text-blue-400 rounded-md transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Abrir IDE
                      </button>
                      <button
                        onClick={() => { window.api.system.openPath(project.path); setShowMenu(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left tx-secondary hover:text-white hover:bg-white/5 rounded-md transition-colors"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        Abrir no Explorer
                      </button>
                      <button
                        onClick={() => { onEdit?.(); setShowMenu(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left tx-secondary hover:text-white hover:bg-white/5 rounded-md transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Editar Configurações
                      </button>
                      <button
                        onClick={() => { onHistory?.(); setShowMenu(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left tx-secondary hover:text-white hover:bg-white/5 rounded-md transition-colors"
                      >
                        <GitBranch className="w-3.5 h-3.5" />
                        Histórico de Commits
                      </button>
                      <div className="h-px my-1" style={{ backgroundColor: 'var(--line-subtle)' }} />
                      <button
                        onClick={() => { onArchive?.(); setShowMenu(false) }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left text-amber-400 hover:bg-amber-500/10 rounded-md transition-colors"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        Arquivar Projeto
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-3 pl-1">
            <p className="text-xs tx-muted leading-relaxed line-clamp-2 min-h-[32px]">
              {project.description || 'Nenhuma descrição fornecida.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t pl-1 flex items-center" style={{ borderColor: 'var(--line-subtle)' }}>
          <div 
            className="flex items-center gap-1.5 text-[10px] tx-muted truncate max-w-full"
            title={project.path}
          >
            <Folder className="w-3 h-3 tx-faint shrink-0" />
            <span className="truncate">{folderName}</span>
          </div>
        </div>
      </div>
    </ItemCard>
  )
}
