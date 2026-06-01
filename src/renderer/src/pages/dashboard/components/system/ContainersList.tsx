import { useState } from 'react'
import { DockerContainer } from './types'

interface ContainersListProps {
  containers: DockerContainer[]
  onStop: (id: string) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

export default function ContainersList({ containers, onStop, onRemove }: ContainersListProps) {
  const [actionId, setActionId] = useState<string | null>(null)

  if (containers.length === 0) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center gap-2 text-center">
        <i className="ri-inbox-line text-2xl tx-faint" />
        <p className="text-xs tx-muted">Nenhum container encontrado</p>
      </div>
    )
  }

  const handleAction = async (id: string, action: 'stop' | 'remove') => {
    setActionId(id)
    try {
      if (action === 'stop') await onStop(id)
      else await onRemove(id)
    } finally {
      setActionId(null)
    }
  }

  const stateColor = (state: string) => {
    if (state === 'running') return '#10b981'
    if (state === 'exited') return '#71717a'
    if (state === 'paused') return '#f59e0b'
    return '#ef4444'
  }

  const stateLabel = (state: string) => {
    const labels: Record<string, string> = {
      running: 'Rodando',
      exited: 'Parado',
      paused: 'Pausado',
      restarting: 'Reiniciando',
      created: 'Criado',
      dead: 'Morto',
    }
    return labels[state] || state
  }

  return (
    <div className="space-y-1.5">
      {containers.map(c => (
        <div
          key={c.id}
          className="card p-3 flex items-center gap-3 hover:border-blue-500/20 transition-all duration-200"
        >
          {/* Status indicator */}
          <div className="relative flex-shrink-0">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: stateColor(c.state) }}
            />
            {c.state === 'running' && (
              <div
                className="absolute inset-0 w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: stateColor(c.state), opacity: 0.4 }}
              />
            )}
          </div>

          {/* Container info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tx-primary truncate">{c.name}</span>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold"
                style={{
                  color: stateColor(c.state),
                  backgroundColor: `${stateColor(c.state)}15`,
                  border: `1px solid ${stateColor(c.state)}30`,
                }}
              >
                {stateLabel(c.state)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] tx-faint truncate max-w-[180px]">
                <i className="ri-image-line mr-0.5" />{c.image}
              </span>
              {c.ports && (
                <span className="text-[10px] tx-muted truncate max-w-[120px]">
                  <i className="ri-global-line mr-0.5" />{c.ports}
                </span>
              )}
            </div>
          </div>

          {/* ID */}
          <span className="text-[9px] font-mono tx-faint flex-shrink-0 hidden sm:block">
            {c.id.slice(0, 12)}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {c.state === 'running' && (
              <button
                onClick={() => handleAction(c.id, 'stop')}
                disabled={actionId === c.id}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold
                  bg-amber-500/10 border border-amber-500/20 text-amber-400
                  hover:bg-amber-500/20 disabled:opacity-40 transition"
                title="Parar container"
              >
                {actionId === c.id ? (
                  <i className="ri-loader-4-line animate-spin text-xs" />
                ) : (
                  <i className="ri-stop-circle-line text-xs" />
                )}
                Parar
              </button>
            )}
            <button
              onClick={() => handleAction(c.id, 'remove')}
              disabled={actionId === c.id}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold
                bg-red-500/10 border border-red-500/20 text-red-400
                hover:bg-red-500/20 disabled:opacity-40 transition"
              title="Remover container"
            >
              {actionId === c.id ? (
                <i className="ri-loader-4-line animate-spin text-xs" />
              ) : (
                <i className="ri-delete-bin-line text-xs" />
              )}
              Remover
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
