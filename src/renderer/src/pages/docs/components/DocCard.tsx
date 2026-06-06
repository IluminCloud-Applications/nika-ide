import { BookOpen, Edit2, Trash2, ExternalLink } from 'lucide-react'
import { DocEntry } from '../types'
import { ItemCard, ItemTag } from '../../../components/ui/PageWidgets'

interface DocCardProps {
  doc: DocEntry
  onEdit: (doc: DocEntry) => void
  onDelete: (slug: string) => void
  onView: (doc: DocEntry) => void
}

const actionClass = 'p-1.5 rounded-lg border transition flex items-center justify-center btn-ghost'

export default function DocCard({ doc, onEdit, onDelete, onView }: DocCardProps) {
  const wordCount = doc.content ? doc.content.trim().split(/\s+/).length : 0

  return (
    <ItemCard>
      <div className="p-5 flex flex-col min-h-[190px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-xl border" style={{ backgroundColor: '#0ea5e922', borderColor: '#0ea5e940' }}>
            <BookOpen className="w-5 h-5 text-sky-400" />
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onView(doc)} title="Visualizar Doc"
              className={`${actionClass} tx-muted hover:text-sky-400`}
              style={{ borderColor: 'var(--line)' }}>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            {!doc.isDefault && (
              <>
                <button onClick={() => onEdit(doc)} title="Editar Doc"
                  className={`${actionClass} tx-muted hover:tx-primary`}
                  style={{ borderColor: 'var(--line)' }}>
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(doc.slug)} title="Excluir Doc"
                  className={`${actionClass} tx-muted hover:text-red-400`}
                  style={{ borderColor: 'var(--line)' }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Name & description */}
        <div className="flex-1 mb-2">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold tx-primary leading-tight truncate">{doc.name}</h3>
            {doc.isDefault && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium shrink-0">
                Padrão
              </span>
            )}
          </div>
          <p className="text-xs tx-muted line-clamp-2 leading-relaxed">{doc.description}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
          <ItemTag>{doc.slug}</ItemTag>
          <span className="text-[10px] tx-faint">{wordCount.toLocaleString()} palavras</span>
        </div>
      </div>
    </ItemCard>
  )
}
