import { useState, useRef, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { Project } from '../../../App'

interface ProjectTabsProps {
  openProjects: Project[]
  activeProjectId: string | null
  onSelectProjectTab: (projectId: string) => void
  onCloseProjectTab: (projectId: string) => void
  onAddProjectTab: (project: Project) => void
}

export default function ProjectTabs({
  openProjects,
  activeProjectId,
  onSelectProjectTab,
  onCloseProjectTab,
  onAddProjectTab
}: ProjectTabsProps) {
  const [allProjects, setAllProjects] = useState<Project[]>([])
  const [showAddProjectDropdown, setShowAddProjectDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleOpenDropdown = async () => {
    try {
      const all = await window.api.projects.list()
      // Filtra apenas projetos não-studio que não estejam atualmente abertos no dashboard
      const filtered = all.filter(
        (p) => !p.isStudio && !openProjects.some((op) => op.id === p.id)
      )
      setAllProjects(filtered)
      setShowAddProjectDropdown((prev) => !prev)
    } catch (err) {
      console.error('Erro ao listar projetos para o dropdown:', err)
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowAddProjectDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex items-center gap-1.5 min-w-0 ml-1 relative">
      <div className="flex items-center gap-1 min-w-0 overflow-x-auto max-w-[400px] no-scrollbar">
        {openProjects.map((proj) => {
          const isActive = proj.id === activeProjectId
          return (
            <div
              key={proj.id}
              onClick={() => onSelectProjectTab(proj.id)}
              className={`flex items-center gap-2 px-2.5 py-1 rounded-md cursor-pointer transition-all duration-150 border select-none max-w-[130px] flex-shrink-0 ${
                isActive
                  ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 font-semibold'
                  : 'bg-transparent border-transparent hover:bg-neutral-800/10 text-neutral-400 hover:text-neutral-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: proj.color }} />
              <span className="text-xs truncate">{proj.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onCloseProjectTab(proj.id)
                }}
                className="text-neutral-500 hover:text-red-400 transition ml-0.5 p-0.5 rounded hover:bg-neutral-800/20"
                title={`Fechar aba de ${proj.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )
        })}
      </div>

      <div className="relative">
        <button
          onClick={handleOpenDropdown}
          className="btn-ghost p-1 flex-shrink-0 rounded-md hover:bg-neutral-800/20 border border-transparent hover:border-neutral-700/10 text-neutral-400 hover:text-neutral-200"
          title="Abrir outro projeto"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {showAddProjectDropdown && (
          <div
            ref={dropdownRef}
            className="absolute top-8 left-0 mt-1 w-56 rounded-lg shadow-xl border focus:outline-none z-50 overflow-hidden backdrop-blur-md"
            style={{
              backgroundColor: 'var(--surface-overlay)',
              borderColor: 'var(--line)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
            }}
          >
            <div className="py-1.5 max-h-60 overflow-y-auto">
              <div
                className="px-3 py-1 text-[9px] font-bold text-neutral-500 uppercase tracking-wider border-b pb-1.5"
                style={{ borderColor: 'var(--line)' }}
              >
                Abrir Projeto
              </div>
              {allProjects.length === 0 ? (
                <div className="px-3 py-2 text-xs text-neutral-400 italic">
                  Nenhum projeto adicional
                </div>
              ) : (
                allProjects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onAddProjectTab(proj)
                      setShowAddProjectDropdown(false)
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-neutral-800/20 text-neutral-300 hover:text-white transition flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: proj.color }} />
                    <span className="truncate">{proj.name}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
