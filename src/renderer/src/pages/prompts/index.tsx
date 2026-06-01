import { useState, useEffect } from 'react'
import { Sparkles, Plus } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import { PromptTemplate } from './types'
import { DEFAULT_PROMPTS } from './utils/defaultPrompts'
import PromptCard from './components/PromptCard'
import PromptModal from './components/PromptModal'
import PromptUseModal from './components/PromptUseModal'
import { PageHeader, FilterBar, EmptyState } from '../../components/ui/PageWidgets'

export default function PromptsPage() {
  const [prompts, setPrompts]           = useState<PromptTemplate[]>(DEFAULT_PROMPTS)
  const [search, setSearch]             = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'default' | 'custom'>('all')
  const [modalOpen, setModalOpen]       = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null)
  const [useOpen, setUseOpen]           = useState(false)
  const [usingPrompt, setUsingPrompt]   = useState<PromptTemplate | null>(null)

  const loadPrompts = async () => {
    if (!window.api?.prompts) return
    try {
      const customList = await window.api.prompts.list()
      const customWithProps = customList.map((p: PromptTemplate) => ({ ...p, isDefault: false }))
      setPrompts([...DEFAULT_PROMPTS, ...customWithProps])
    } catch (err) { console.error('Erro ao obter lista de prompts:', err) }
  }

  useEffect(() => { loadPrompts() }, [])

  const handleSave   = async (prompt: PromptTemplate) => { if (window.api?.prompts) { await window.api.prompts.save(prompt); await loadPrompts() } }
  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza de que deseja excluir este prompt?')) {
      if (window.api?.prompts) { await window.api.prompts.delete(id); await loadPrompts() }
    }
  }

  const filtered = prompts.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase()) || (p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase())))
    const matchFilter = activeFilter === 'all' || (activeFilter === 'default' && p.isDefault) || (activeFilter === 'custom' && !p.isDefault)
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
        title="Templates de Prompts"
        subtitle="Crie e utilize templates rápidos preenchendo variáveis para enviar à IA."
        action={{ label: 'Criar Prompt', icon: <Plus className="w-4 h-4" />, onClick: () => { setEditingPrompt(null); setModalOpen(true) } }}
      />
      <FilterBar search={search} onSearch={setSearch} placeholder="Buscar por nome, descrição ou tags..." filters={filters} activeFilter={activeFilter} onFilter={v => setActiveFilter(v as any)} />

      {filtered.length === 0
        ? <EmptyState icon={Sparkles} message="Nenhum prompt encontrado." />
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-10">
            {filtered.map(prompt => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                onEdit={p => { setEditingPrompt(p); setModalOpen(true) }}
                onDelete={handleDelete}
                onUsePrompt={p => { setUsingPrompt(p); setUseOpen(true) }}
              />
            ))}
          </div>
        )
      }

      <PromptModal isOpen={modalOpen} prompt={editingPrompt} onClose={() => setModalOpen(false)} onConfirm={handleSave} />
      <PromptUseModal isOpen={useOpen} prompt={usingPrompt} onClose={() => { setUseOpen(false); setUsingPrompt(null) }} />
    </PageShell>
  )
}
