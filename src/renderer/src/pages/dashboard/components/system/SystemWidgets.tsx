import React from 'react'

export function SystemHeader({
  scope,
  onScopeChange,
  onRefresh,
  loading,
}: {
  scope: 'project' | 'all'
  onScopeChange: (s: 'project' | 'all') => void
  onRefresh: () => void
  loading: boolean
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
      style={{ borderBottom: '1px solid var(--line)' }}
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg"
          style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)' }}
        >
          {(['project', 'all'] as const).map(s => (
            <button
              key={s}
              onClick={() => onScopeChange(s)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all duration-150 ${
                scope === s ? 'shadow-sm' : ''
              }`}
              style={{
                backgroundColor: scope === s ? 'var(--surface-raised)' : 'transparent',
                color: scope === s ? 'var(--tx-primary)' : 'var(--tx-muted)',
              }}
            >
              {s === 'project' ? 'Este Projeto' : 'Todos os Projetos'}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-semibold
          transition-all duration-200 disabled:opacity-40"
        style={{
          backgroundColor: 'var(--surface-overlay)',
          border: '1px solid var(--line)',
          color: 'var(--tx-muted)',
        }}
      >
        <i className={`ri-refresh-line text-xs ${loading ? 'animate-spin' : ''}`} />
        Atualizar
      </button>
    </div>
  )
}

export function Section({
  title,
  icon,
  badge,
  children,
}: {
  title: string
  icon: string
  badge?: number
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <i className={`${icon} text-sm tx-muted`} />
        <h3 className="text-[11px] font-semibold tx-secondary uppercase tracking-wider">{title}</h3>
        {badge !== undefined && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold tx-muted"
            style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)' }}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

export function DockerOfflineState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16">
      <div className="p-4 rounded-2xl card">
        <i className="ri-shut-down-line text-3xl text-red-400" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-sm font-semibold tx-secondary">Docker não encontrado</h3>
        <p className="text-xs tx-muted max-w-xs leading-relaxed">
          O Docker Desktop precisa estar rodando para gerenciar os serviços do projeto.
          Abra o Docker Desktop e tente novamente.
        </p>
      </div>
    </div>
  )
}

export function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'var(--line)' }} />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
      </div>
      <p className="text-xs tx-muted font-medium">Carregando informações do Docker...</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16">
      <i className="ri-error-warning-line text-2xl text-red-400" />
      <p className="text-xs tx-muted text-center max-w-xs">{message}</p>
      <button
        onClick={onRetry}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold
          bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition"
      >
        <i className="ri-refresh-line" /> Tentar novamente
      </button>
    </div>
  )
}
