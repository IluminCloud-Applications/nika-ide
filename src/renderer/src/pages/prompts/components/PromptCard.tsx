import { Sparkles, Edit2, Trash2, Play } from 'lucide-react'
import { PromptTemplate } from '../types'
import { ItemCard, ItemTag } from '../../../components/ui/PageWidgets'

interface PromptCardProps {
  prompt: PromptTemplate
  onEdit?: (prompt: PromptTemplate) => void
  onDelete?: (id: string) => void
  onUsePrompt: (prompt: PromptTemplate) => void
}

const actionClass = 'p-1.5 rounded-lg border transition flex items-center justify-center btn-ghost'

export default function PromptCard({ prompt, onEdit, onDelete, onUsePrompt }: PromptCardProps) {
  return (
    <ItemCard>
      <div className="p-5 flex flex-col min-h-[190px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-xl border" style={{ backgroundColor: '#8b5cf622', borderColor: '#8b5cf640' }}>
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => onUsePrompt(prompt)} title="Utilizar Prompt"
              className={`${actionClass} tx-muted hover:text-blue-400`}
              style={{ borderColor: 'var(--line)' }}>
              <Play className="w-3.5 h-3.5" />
            </button>
            {!prompt.isDefault && (
              <>
                {onEdit && (
                  <button onClick={() => onEdit(prompt)} title="Editar Prompt"
                    className={`${actionClass} tx-muted hover:tx-primary`}
                    style={{ borderColor: 'var(--line)' }}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(prompt.id)} title="Excluir Prompt"
                    className={`${actionClass} tx-muted hover:text-red-400`}
                    style={{ borderColor: 'var(--line)' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Name & description */}
        <div className="flex-1 mb-2">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-bold tx-primary leading-tight truncate">{prompt.name}</h3>
            {prompt.isDefault && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium shrink-0">
                Padrão
              </span>
            )}
          </div>
          <p className="text-xs tx-muted line-clamp-2 leading-relaxed">{prompt.description}</p>
        </div>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {prompt.tags.slice(0, 3).map(tag => <ItemTag key={tag}>{tag}</ItemTag>)}
            {prompt.tags.length > 3 && <span className="text-[10px] tx-faint">+{prompt.tags.length - 3}</span>}
          </div>
        )}
      </div>
    </ItemCard>
  )
}
