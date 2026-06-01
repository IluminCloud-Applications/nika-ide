import { Bot, Edit2, Trash2, Eye } from 'lucide-react'
import { Agent } from '../types'
import { ItemCard, ItemTag } from '../../../components/ui/PageWidgets'

interface AgentCardProps {
  agent: Agent
  onEdit?: (agent: Agent) => void
  onDelete?: (id: string) => void
  onViewInstructions: (agent: Agent) => void
}

const cardActionClass = 'p-1.5 rounded-lg transition btn-ghost border'

export default function AgentCard({ agent, onEdit, onDelete, onViewInstructions }: AgentCardProps) {
  return (
    <ItemCard>
      <div className="p-5 flex flex-col min-h-[190px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-2.5 rounded-xl border" style={{ backgroundColor: '#6366f122', borderColor: '#6366f140' }}>
            <Bot className="w-5 h-5 text-violet-400" />
          </div>
          <div className="flex items-center gap-1" style={{ borderColor: 'var(--line)' }}>
            <button onClick={() => onViewInstructions(agent)} title="Visualizar Instruções"
              className={`${cardActionClass} tx-muted hover:text-blue-400`}
              style={{ borderColor: 'var(--line)' }}>
              <Eye className="w-3.5 h-3.5" />
            </button>
            {!agent.isDefault && (
              <>
                {onEdit && (
                  <button onClick={() => onEdit(agent)} title="Editar Agente"
                    className={`${cardActionClass} tx-muted hover:text-blue-400`}
                    style={{ borderColor: 'var(--line)' }}>
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(agent.id)} title="Excluir Agente"
                    className={`${cardActionClass} tx-muted hover:text-red-400`}
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
            <h3 className="text-sm font-bold tx-primary leading-tight truncate">{agent.name}</h3>
            {agent.isDefault && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium shrink-0">
                Padrão
              </span>
            )}
          </div>
          <p className="text-xs tx-muted line-clamp-2 leading-relaxed">{agent.description}</p>
        </div>

        {/* Tags */}
        {agent.tags && agent.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {agent.tags.slice(0, 3).map(tag => <ItemTag key={tag}>{tag}</ItemTag>)}
            {agent.tags.length > 3 && <span className="text-[10px] tx-faint">+{agent.tags.length - 3}</span>}
          </div>
        )}
      </div>
    </ItemCard>
  )
}
