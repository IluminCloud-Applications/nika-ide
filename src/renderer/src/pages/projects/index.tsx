import { useState, useEffect } from 'react'
import { Loader2, Plus, FolderOpen } from 'lucide-react'
import { Project } from '../../App'
import CreateProjectModal from './components/CreateProjectModal'
import ProjectsGrid from './components/ProjectsGrid'
import PageShell from '../../components/layout/PageShell'
import { FilterBar } from '../../components/ui/PageWidgets'

export default function ProjectsPage({ onSelectProject }: { onSelectProject: (p: Project) => void }) {
  const [projects, setProjects]             = useState<Project[]>([])
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([])
  const [loading, setLoading]               = useState(true)
  const [showModal, setShowModal]           = useState(false)
  const [creating, setCreating]             = useState(false)
  const [workspacePath, setWorkspacePath]   = useState('')
  const [search, setSearch]                 = useState('')
  const [activeFilter, setActiveFilter]     = useState<'all' | 'active' | 'archived'>('active')

  useEffect(() => { loadProjects(); loadSettings() }, [])

  const loadProjects = async () => {
    try {
      const all = await window.api.projects.list()
      const allArchived = await window.api.projects.listArchived()
      setProjects(all.filter((p: any) => !p.isStudio))
      setArchivedProjects(allArchived.filter((p: any) => !p.isStudio))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const loadSettings = async () => {
    try {
      const s = await window.api.settings.get()
      if (s.workspacePath) setWorkspacePath(s.workspacePath)
    } catch {}
  }

  const handleCreate = async (details: { name: string; description: string; color: string; path: string; imagePath?: string }) => {
    setCreating(true)
    try {
      const created = await window.api.projects.create(details)
      setProjects(prev => [...prev, created])
      setShowModal(false)
      onSelectProject(created)
    } catch (err) { alert('Erro ao criar projeto: ' + (err as Error).message) }
    finally { setCreating(false) }
  }



  const handleRollback    = async (projectPath: string, hash: string) => {
    await window.api.projects.gitRollback(projectPath, hash)
    const project = projects.find(p => p.path === projectPath)
    if (project) await window.api.projects.updateStatus(project.id, 'draft')
  }
  const handleStatusChange = (id: string) =>
    setProjects(prev => prev.map(p => p.id === id ? { ...p, status: 'draft' as const } : p))
  const handleUpdate      = async (id: string, updates: Partial<Project>) => {
    const updated = await window.api.projects.update(id, updates)
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p))
  }
  const handleArchive     = async (id: string) => {
    try { await window.api.projects.archive(id); await loadProjects() }
    catch (err) { alert('Erro ao arquivar projeto: ' + (err as Error).message) }
  }
  const handleRestore     = async (id: string) => {
    try { await window.api.projects.restore(id); await loadProjects() }
    catch (err) { alert('Erro ao restaurar projeto: ' + (err as Error).message) }
  }

  const EmptyState = ({ archived }: { archived?: boolean }) => (
    <div className="flex-1 flex flex-col items-center justify-center rounded-2xl p-16 border border-dashed"
      style={{ borderColor: 'var(--line)', backgroundColor: 'var(--surface-raised)' }}
    >
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)' }}
      >
        <FolderOpen className="w-7 h-7 tx-faint" />
      </div>
      <h3 className="text-base font-semibold tx-secondary">
        {archived ? 'Nenhum projeto arquivado' : 'Nenhum projeto ativo'}
      </h3>
      <p className="tx-muted text-sm mt-2 text-center max-w-xs">
        {archived
          ? 'Projetos arquivados no seu workspace aparecerão aqui.'
          : workspacePath
            ? 'Clique em "Novo Projeto" para iniciar.'
            : 'Configure uma pasta padrão em Configurações e crie seu primeiro projeto.'}
      </p>
      {!archived && (
        <div className="flex gap-3 mt-5">
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition font-medium"
          >
            <Plus className="w-4 h-4" /> Criar projeto
          </button>
        </div>
      )}
    </div>
  )

  return (
    <PageShell>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tx-primary">Meus Projetos</h1>
          <p className="tx-muted text-sm mt-1">
            Crie ou abra um projeto existente.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg hover:shadow-blue-500/25 transition duration-200"
          >
            <Plus className="w-4 h-4" /> Novo Projeto
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Buscar projetos..."
        filters={[
          { key: 'all', label: 'Todos' },
          { key: 'active', label: 'Ativos' },
          { key: 'archived', label: 'Arquivados' }
        ]}
        activeFilter={activeFilter}
        onFilter={v => setActiveFilter(v as any)}
      />

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
        </div>
      ) : (projects.length === 0 && archivedProjects.length === 0 && !search) ? (
        <EmptyState />
      ) : (
        <ProjectsGrid
          projects={projects}
          archivedProjects={archivedProjects}
          search={search}
          activeFilter={activeFilter}
          onSelectProject={onSelectProject}
          onRollback={handleRollback}
          onStatusChange={handleStatusChange}
          onUpdate={handleUpdate}
          onArchive={handleArchive}
          onRestore={handleRestore}
        />
      )}

      <CreateProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreate={handleCreate}
        creating={creating}
        workspacePath={workspacePath}
      />
    </PageShell>
  )
}
