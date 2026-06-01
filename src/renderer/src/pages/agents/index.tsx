import { useState, useEffect } from 'react'
import { Bot, Plus } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import { Agent } from './types'
import { DEFAULT_AGENTS } from './utils/defaultAgents'
import AgentCard from './components/AgentCard'
import AgentModal from './components/AgentModal'
import InstructionsViewerModal from './components/InstructionsViewerModal'
import { PageHeader, FilterBar, EmptyState } from '../../components/ui/PageWidgets'

export default function AgentsPage() {
  const [agents, setAgents]         = useState<Agent[]>(DEFAULT_AGENTS)
  const [search, setSearch]         = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'default' | 'custom'>('all')
  const [modalOpen, setModalOpen]   = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [viewingAgent, setViewingAgent] = useState<Agent | null>(null)

  const loadAgents = async () => {
    if (!window.api?.agents) return
    try {
      const customList = await window.api.agents.list()
      const customWithProps = customList.map((a: Agent) => ({ ...a, isDefault: false }))
      setAgents([...DEFAULT_AGENTS, ...customWithProps])
    } catch (err) { console.error('Erro ao obter lista de agentes:', err) }
  }

  useEffect(() => { loadAgents() }, [])

  const handleSave   = async (agent: Agent) => { if (window.api?.agents) { await window.api.agents.save(agent); await loadAgents() } }
  const handleDelete = async (id: string)   => {
    if (confirm('Tem certeza de que deseja excluir este agente?')) {
      if (window.api?.agents) { await window.api.agents.delete(id); await loadAgents() }
    }
  }

  const filtered = agents.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()) || (a.tags?.some(t => t.toLowerCase().includes(search.toLowerCase())))
    const matchFilter = activeFilter === 'all' || (activeFilter === 'default' && a.isDefault) || (activeFilter === 'custom' && !a.isDefault)
    return matchSearch && matchFilter
  })

  const filters = [
    { key: 'all', label: 'Todos' },
    { key: 'default', label: 'Padrão' },
    { key: 'custom', label: 'Customizados' },
  ]

  return (
    <PageShell>
      <PageHeader
        title="Agentes"
        subtitle="Configure perfis e regras do sistema (System Instructions) para guiar a IA no desenvolvimento."
        action={{ label: 'Criar Agente', icon: <Plus className="w-4 h-4" />, onClick: () => { setEditingAgent(null); setModalOpen(true) } }}
      />
      <FilterBar search={search} onSearch={setSearch} placeholder="Buscar por nome, descrição ou tags..." filters={filters} activeFilter={activeFilter} onFilter={v => setActiveFilter(v as any)} />

      {filtered.length === 0
        ? <EmptyState icon={Bot} message="Nenhum agente encontrado." />
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-10">
            {filtered.map(agent => (
              <AgentCard key={agent.id} agent={agent}
                onEdit={a => { setEditingAgent(a); setModalOpen(true) }}
                onDelete={handleDelete}
                onViewInstructions={a => { setViewingAgent(a); setViewerOpen(true) }}
              />
            ))}
          </div>
        )
      }

      <AgentModal isOpen={modalOpen} agent={editingAgent} onClose={() => setModalOpen(false)} onConfirm={handleSave} />
      <InstructionsViewerModal isOpen={viewerOpen} agent={viewingAgent} onClose={() => { setViewerOpen(false); setViewingAgent(null) }} />
    </PageShell>
  )
}
