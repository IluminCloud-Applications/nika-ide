import { ReactNode } from 'react'
import { Search, Plus } from 'lucide-react'

/** Cabeçalho padrão de páginas com título, subtítulo e ação opcional */
export function PageHeader({
  title, subtitle, action, badge
}: {
  title: string
  subtitle?: ReactNode
  action?: { label: string; onClick: () => void; icon?: ReactNode }
  badge?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tx-primary">{title}</h1>
        {subtitle && <p className="tx-muted text-sm mt-1">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {badge}
        {action && (
          <button
            onClick={action.onClick}
            className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm"
          >
            {action.icon ?? <Plus className="w-4 h-4" />}
            {action.label}
          </button>
        )}
      </div>
    </div>
  )
}

/** Barra de busca + filtros de categoria — theme-aware */
export function FilterBar({
  search,
  onSearch,
  placeholder = 'Buscar...',
  filters,
  activeFilter,
  onFilter,
}: {
  search: string
  onSearch: (v: string) => void
  placeholder?: string
  filters: { key: string; label: string }[]
  activeFilter: string
  onFilter: (key: string) => void
}) {
  return (
    <div className="flex items-center gap-3 mb-6 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 tx-faint pointer-events-none" />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder={placeholder}
          className="input-field w-full pl-8 pr-3 py-2"
        />
      </div>

      {/* Filters */}
      {filters.length > 0 && (
        <div
          className="flex items-center gap-1 rounded-lg p-1 flex-wrap"
          style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)' }}
        >
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => onFilter(f.key)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-150 ${
                activeFilter === f.key
                  ? 'tx-primary font-semibold'
                  : 'tx-muted hover:tx-secondary'
              }`}
              style={activeFilter === f.key
                ? { backgroundColor: 'var(--surface-raised)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }
                : undefined
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Tag mono pequena — theme-aware */
export function ItemTag({ children }: { children: ReactNode }) {
  return (
    <span
      className="text-[10px] font-mono px-1.5 py-0.5 rounded"
      style={{
        color: 'var(--tx-muted)',
        backgroundColor: 'var(--surface-overlay)',
        border: '1px solid var(--line-subtle)',
      }}
    >
      {children}
    </span>
  )
}

/** Toggle switch theme-aware */
export function Toggle({
  enabled, onToggle, syncing
}: { enabled: boolean; onToggle: () => void; syncing?: boolean }) {
  return (
    <button
      onClick={onToggle}
      disabled={syncing}
      title={syncing ? 'Sincronizando...' : undefined}
      className={`shrink-0 w-10 h-6 rounded-full border transition-all duration-200 relative ${syncing ? 'opacity-60 cursor-wait' : ''}`}
      style={{
        backgroundColor: enabled ? '#3b82f6' : 'var(--surface-overlay)',
        borderColor: enabled ? '#2563eb' : 'var(--line)',
      }}
    >
      <span
        className="absolute top-1/2 -translate-y-1/2 w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ left: enabled ? 'calc(100% - 21px)' : '3px' }}
      />
    </button>
  )
}

/** Card base theme-aware — substitui bg-gradient-to-br hardcoded */
export function ItemCard({
  children,
  enabled,
  accentColor,
  className = '',
  overflowVisible = false,
}: {
  children: ReactNode
  enabled?: boolean
  accentColor?: string
  className?: string
  overflowVisible?: boolean
}) {
  return (
    <div
      className={`relative rounded-xl transition-all duration-200 group cursor-default ${
        overflowVisible ? '' : 'overflow-hidden'
      } ${className}`}
      style={{
        backgroundColor: 'var(--surface-raised)',
        border: `1px solid ${enabled === false ? 'var(--line-subtle)' : 'var(--line)'}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accentColor ? accentColor + '60' : 'rgba(59,130,246,0.4)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = enabled === false ? 'var(--line-subtle)' : 'var(--line)' }}
    >
      {children}
      {/* Bottom accent bar */}
      <div
        className="h-0.5 w-full transition-opacity duration-300 rounded-b-xl"
        style={{
          background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
          opacity: enabled !== false ? 1 : 0,
        }}
      />
    </div>
  )
}

/** Ícone de item com fundo colorido */
export function ItemIcon({
  icon: Icon,
  color,
  bg,
}: { icon: React.ElementType; color: string; bg: string }) {
  return (
    <div className="p-2.5 rounded-xl border shrink-0" style={{ backgroundColor: bg + '22', borderColor: bg + '40' }}>
      <Icon className={`w-5 h-5 ${color}`} />
    </div>
  )
}

/** Estado vazio padronizado */
export function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-2 rounded-2xl border border-dashed"
      style={{ borderColor: 'var(--line)' }}
    >
      <Icon className="w-8 h-8 tx-faint animate-pulse" />
      <p className="text-sm tx-muted">{message}</p>
    </div>
  )
}
