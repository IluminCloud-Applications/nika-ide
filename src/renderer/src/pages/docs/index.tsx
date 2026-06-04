import { useState, useEffect } from 'react'
import { BookOpen, Plus } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import { PageHeader, FilterBar, EmptyState } from '../../components/ui/PageWidgets'
import { DocEntry } from './types'
import DocCard from './components/DocCard'
import DocModal from './components/DocModal'
import DocViewModal from './components/DocViewModal'
import { DEFAULT_DOCS } from './utils/defaultDocs'

export default function DocsPage() {
  const [docs, setDocs]             = useState<DocEntry[]>([])
  const [search, setSearch]         = useState('')
  const [modalOpen, setModalOpen]   = useState(false)
  const [viewOpen, setViewOpen]     = useState(false)
  const [editingDoc, setEditingDoc] = useState<DocEntry | null>(null)
  const [viewingDoc, setViewingDoc] = useState<DocEntry | null>(null)

  const loadDocs = async () => {
    if (!window.api?.docs) return
    try {
      const list = await window.api.docs.list()
      const customWithProps = list.map(d => ({ ...d, isDefault: false }))
      setDocs([...DEFAULT_DOCS, ...customWithProps])
    } catch (err) { console.error('Erro ao listar docs:', err) }
  }

  useEffect(() => { loadDocs() }, [])

  const handleSave = async (doc: DocEntry) => {
    if (!window.api?.docs) return
    await window.api.docs.save(doc)
    await loadDocs()
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('Tem certeza de que deseja excluir esta documentação?')) return
    if (!window.api?.docs) return
    await window.api.docs.delete(slug)
    await loadDocs()
  }

  const filtered = docs.filter(d =>
    !search ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.description.toLowerCase().includes(search.toLowerCase()) ||
    d.slug.includes(search.toLowerCase())
  )

  return (
    <PageShell>
      <PageHeader
        title="Documentações"
        subtitle="Salve documentações de APIs e libs para que a IA consulte durante o desenvolvimento."
        action={{ label: 'Nova Doc', icon: <Plus className="w-4 h-4" />, onClick: () => { setEditingDoc(null); setModalOpen(true) } }}
      />
      <FilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Buscar por nome, slug ou descrição..."
        filters={[]}
        activeFilter=""
        onFilter={() => {}}
      />

      {filtered.length === 0
        ? <EmptyState icon={BookOpen} message="Nenhuma documentação encontrada. Adicione sua primeira!" />
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-10">
            {filtered.map(doc => (
              <DocCard
                key={doc.slug}
                doc={doc}
                onEdit={d => { setEditingDoc(d); setModalOpen(true) }}
                onDelete={handleDelete}
                onView={d => { setViewingDoc(d); setViewOpen(true) }}
              />
            ))}
          </div>
        )
      }

      <DocModal
        isOpen={modalOpen}
        doc={editingDoc}
        onClose={() => setModalOpen(false)}
        onConfirm={handleSave}
      />
      <DocViewModal
        isOpen={viewOpen}
        doc={viewingDoc}
        onClose={() => { setViewOpen(false); setViewingDoc(null) }}
      />
    </PageShell>
  )
}
