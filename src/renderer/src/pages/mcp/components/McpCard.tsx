import { Lock, Unlock, Pencil, Trash2 } from 'lucide-react'
import { McpServer, CATEGORY_META } from '../types'
import { ItemCard, ItemIcon, ItemTag, Toggle } from '../../../components/ui/PageWidgets'

interface McpCardProps {
  mcp: McpServer
  onToggle: () => void
  onDelete?: () => void
  onEdit?: () => void
  syncing?: boolean
}

export default function McpCard({ mcp, onToggle, onDelete, onEdit, syncing }: McpCardProps) {
  const catMeta = CATEGORY_META[mcp.category]
  const CatIcon = catMeta.icon

  return (
    <ItemCard enabled={mcp.enabled}>
      <div className="p-5">
        {/* Icon + Actions + Toggle */}
        <div className="flex items-start justify-between mb-4">
          <ItemIcon icon={CatIcon} color={catMeta.color} bg={catMeta.bg} />
          <div className="flex items-center gap-1.5">
            {mcp.isCustom && (
              <>
                <button
                  type="button"
                  onClick={onEdit}
                  title="Editar configuração"
                  className="p-1.5 rounded-lg border border-transparent hover:border-white/10 bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center transition-colors tx-muted hover:tx-primary"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={onDelete}
                  title="Excluir servidor"
                  className="p-1.5 rounded-lg border border-transparent hover:border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-xs flex items-center justify-center transition-colors text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            {mcp.requiresAuth && (
              <div
                title={mcp.apiKey ? 'Autenticado' : 'Requer API Key'}
                className={`p-1.5 rounded-lg border text-xs flex items-center justify-center transition-colors ${
                  mcp.apiKey
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                }`}
              >
                {mcp.apiKey ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
              </div>
            )}
            <Toggle enabled={mcp.enabled} onToggle={onToggle} syncing={syncing} />
          </div>
        </div>

        {/* Name + Tagline */}
        <div className="mb-2">
          <h3 className="text-sm font-bold tx-primary leading-tight">{mcp.name}</h3>
          <p className="text-xs tx-muted mt-0.5">{mcp.tagline}</p>
        </div>

        {/* Description */}
        <p className="text-xs tx-muted leading-relaxed line-clamp-2">{mcp.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {mcp.tags.slice(0, 3).map(tag => <ItemTag key={tag}>{tag}</ItemTag>)}
          {mcp.tags.length > 3 && <span className="text-[10px] tx-faint">+{mcp.tags.length - 3}</span>}
        </div>
      </div>
    </ItemCard>
  )
}
