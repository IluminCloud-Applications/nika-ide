import { useState, useEffect } from 'react'
import { Loader2, Plus, Trash2, RotateCcw, Palette } from 'lucide-react'
import { Project } from '../../App'
import PageShell from '../../components/layout/PageShell'
import StudioCreateModal from './components/StudioCreateModal'
import { PageHeader, FilterBar, EmptyState, ItemCard } from '../../components/ui/PageWidgets'

interface StudioPageProps {
  onSelectStudio: (p: Project) => void
}

function RiBrushAiLine({ className, ...props }: React.HTMLAttributes<HTMLElement> & { strokeWidth?: number }) {
  return (
    <i
      className={`ri-brush-ai-line flex items-center justify-center ${className || ''}`}
      {...props}
      style={{ fontSize: '24px', width: '24px', height: '24px', lineHeight: 1, color: 'currentColor' }}
    />
  )
}

export default function StudioPage({ onSelectStudio }: StudioPageProps) {
  const [studios, setStudios] = useState<Project[]>([])
  const [archivedStudios, setArchivedStudios] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [workspacePath, setWorkspacePath] = useState('')
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'archived'>('active')

  useEffect(() => {
    loadStudios()
    loadSettings()
  }, [])

  const loadStudios = async () => {
    try {
      const all = await window.api.projects.list()
      const allArchived = await window.api.projects.listArchived()
      setStudios(all.filter((p: any) => p.isStudio === true))
      setArchivedStudios(allArchived.filter((p: any) => p.isStudio === true))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadSettings = async () => {
    try {
      const s = await window.api.settings.get()
      if (s.workspacePath) setWorkspacePath(s.workspacePath)
    } catch {}
  }

  const handleCreateStudio = async (details: { name: string; description: string; color: string; path: string }) => {
    setCreating(true)
    try {
      const created = await window.api.projects.create({
        ...details,
        isStudio: true
      })
      setStudios(prev => [...prev, created])
      setShowCreateModal(false)
      onSelectStudio(created)
    } catch (err) {
      alert('Erro ao criar estúdio: ' + (err as Error).message)
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteStudio = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!confirm('Deseja realmente arquivar este estúdio de design?')) return
    try {
      await window.api.projects.archive(id)
      await loadStudios()
    } catch (err) {
      alert('Erro ao excluir estúdio: ' + (err as Error).message)
    }
  }

  const handleRestoreStudio = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await window.api.projects.restore(id)
      await loadStudios()
    } catch (err) {
      alert('Erro ao restaurar estúdio: ' + (err as Error).message)
    }
  }

  const allList = [
    ...studios.map(s => ({ ...s, isArchived: false })),
    ...archivedStudios.map(s => ({ ...s, isArchived: true }))
  ]

  const filtered = allList.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
    const matchFilter = activeFilter === 'all' || (activeFilter === 'active' && !s.isArchived) || (activeFilter === 'archived' && s.isArchived)
    return matchSearch && matchFilter
  })

  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'active', label: 'Ativos' },
    { key: 'archived', label: 'Arquivados' },
  ]

  return (
    <PageShell>
      <PageHeader
        title="Estúdio de Design"
        subtitle="Crie protótipos visuais de temas e exporte estilos CSS (Tailwind/ShadCN) customizados."
        action={{
          label: 'Novo Estúdio',
          onClick: () => setShowCreateModal(true)
        }}
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : (studios.length === 0 && archivedStudios.length === 0 && !search) ? (
        <div
          className="flex-1 flex flex-col items-center justify-center rounded-2xl p-16 border border-dashed"
          style={{ borderColor: 'var(--line)', backgroundColor: 'var(--surface-raised)' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-zinc-400"
            style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)' }}
          >
            <RiBrushAiLine />
          </div>
          <h3 className="text-base font-semibold tx-secondary">Nenhum Estúdio Criado</h3>
          <p className="tx-muted text-sm mt-2 text-center max-w-xs">
            Crie um estúdio para visualizar e modificar componentes em tempo real usando IA ou controles manuais.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-5 flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition font-medium"
          >
            <Plus className="w-4 h-4" /> Criar Estúdio
          </button>
        </div>
      ) : (
        <>
          <FilterBar
            search={search}
            onSearch={setSearch}
            placeholder="Buscar estúdio..."
            filters={filters}
            activeFilter={activeFilter}
            onFilter={v => setActiveFilter(v as any)}
          />

          {filtered.length === 0 ? (
            <EmptyState icon={RiBrushAiLine} message="Nenhum estúdio encontrado." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-10">
              {filtered.map(studio => (
                <ItemCard key={studio.id} enabled={!studio.isArchived}>
                  <div
                    onClick={() => !studio.isArchived && onSelectStudio(studio)}
                    className={`p-5 flex flex-col justify-between min-h-[12rem] relative group ${!studio.isArchived ? 'cursor-pointer' : ''}`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="p-2.5 rounded-xl border shrink-0"
                          style={{ backgroundColor: studio.color + '22', borderColor: studio.color + '40' }}
                        >
                          <Palette className="w-5 h-5" style={{ color: studio.color }} />
                        </div>
                        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                          {studio.isArchived ? (
                            <button
                              onClick={(e) => handleRestoreStudio(e, studio.id)}
                              className="p-1.5 rounded-lg border border-transparent hover:border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 text-xs flex items-center justify-center transition-colors text-emerald-400 hover:text-emerald-300"
                              title="Restaurar estúdio"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleDeleteStudio(e, studio.id)}
                              className="p-1.5 rounded-lg border border-transparent hover:border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-xs flex items-center justify-center transition-colors text-red-400 hover:text-red-300"
                              title="Arquivar estúdio"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 mb-2">
                        <h3 className="text-sm font-bold tx-primary leading-tight group-hover:text-blue-400 transition-colors truncate">
                          {studio.name}
                        </h3>
                        <p className="tx-muted text-xs mt-2 line-clamp-2 leading-relaxed">
                          {studio.description || 'Sem descrição.'}
                        </p>
                      </div>
                    </div>
                    <div
                      className="flex items-center justify-between gap-2 mt-4 text-[10px] tx-muted border-t pt-3"
                      style={{ borderColor: 'var(--line-subtle)' }}
                    >
                      <span className="truncate min-w-0">Caminho: {studio.path.split('/').pop()}</span>
                      <span className="shrink-0">{new Date(studio.createdAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </ItemCard>
              ))}
            </div>
          )}
        </>
      )}

      <StudioCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateStudio}
        creating={creating}
        workspacePath={workspacePath}
      />
    </PageShell>
  )
}
