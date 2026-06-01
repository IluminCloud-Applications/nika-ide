import { useState } from 'react'

interface SystemActionsProps {
  onResetProject: () => Promise<void>
  onCleanupAll: () => Promise<void>
  onSmartPrune: () => Promise<void>
  hasContainers: boolean
  hasVolumes: boolean
}

export default function SystemActions({
  onResetProject,
  onCleanupAll,
  onSmartPrune,
  hasContainers,
  hasVolumes,
}: SystemActionsProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<string | null>(null)

  const handleAction = async (action: string, handler: () => Promise<void>, needsConfirm: boolean) => {
    if (needsConfirm && confirmAction !== action) {
      setConfirmAction(action)
      return
    }
    setActiveAction(action)
    setConfirmAction(null)
    try {
      await handler()
    } finally {
      setActiveAction(null)
    }
  }

  const actions = [
    {
      id: 'smart-prune',
      icon: 'ri-sparkling-line',
      title: 'Limpeza Inteligente',
      description: 'Remove apenas recursos órfãos: imagens sem uso, redes desconectadas e cache de build. Não afeta containers (rodando ou parados) nem seus dados.',
      color: '#60a5fa',
      confirmText: '',
      handler: onSmartPrune,
      disabled: false,
      needsConfirm: false,
    },
    {
      id: 'reset',
      icon: 'ri-refresh-line',
      title: 'Resetar Tudo',
      description: 'Remove containers e apaga todos os dados. As imagens são mantidas para o próximo build ser rápido.',
      color: '#f59e0b',
      confirmText: 'Containers serão parados e todos os dados apagados. Confirmar?',
      handler: onResetProject,
      disabled: !hasContainers && !hasVolumes,
      needsConfirm: true,
    },
    {
      id: 'cleanup',
      icon: 'ri-delete-bin-7-line',
      title: 'Limpeza Completa',
      description: 'Remove tudo: containers, dados, imagens e cache de build. O próximo start vai reconstruir do zero.',
      color: '#ef4444',
      confirmText: 'Tudo será removido (containers, dados, imagens, cache). Confirmar?',
      handler: onCleanupAll,
      disabled: !hasContainers && !hasVolumes,
      needsConfirm: true,
    },
  ]

  return (
    <div className="space-y-2">
      {actions.map(action => (
        <div
          key={action.id}
          className="card p-3 transition-all duration-200 hover:border-blue-500/20"
        >
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{
                backgroundColor: `${action.color}15`,
                border: `1px solid ${action.color}30`,
              }}
            >
              <i className={`${action.icon} text-base`} style={{ color: action.color }} />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold tx-primary">{action.title}</h4>
              <p className="text-[10px] tx-muted mt-0.5 leading-relaxed">{action.description}</p>

              {confirmAction === action.id && (
                <div className="mt-2 p-2 rounded-lg animate-fade-in"
                  style={{ backgroundColor: `${action.color}08`, border: `1px solid ${action.color}20` }}
                >
                  <p className="text-[10px] font-semibold" style={{ color: action.color }}>
                    <i className="ri-error-warning-line mr-1" />
                    {action.confirmText}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => handleAction(action.id, action.handler, action.needsConfirm)}
              disabled={action.disabled || activeAction === action.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-semibold
                transition-all duration-200 flex-shrink-0
                disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: confirmAction === action.id ? `${action.color}20` : `${action.color}10`,
                border: `1px solid ${action.color}${confirmAction === action.id ? '50' : '25'}`,
                color: action.color,
              }}
            >
              {activeAction === action.id ? (
                <>
                  <i className="ri-loader-4-line animate-spin text-xs" />
                  Processando...
                </>
              ) : confirmAction === action.id ? (
                <>
                  <i className="ri-check-line text-xs" />
                  Confirmar
                </>
              ) : (
                <>
                  <i className={`${action.icon} text-xs`} />
                  Executar
                </>
              )}
            </button>
          </div>

          {confirmAction === action.id && (
            <button
              onClick={() => setConfirmAction(null)}
              className="text-[10px] tx-muted hover:tx-secondary mt-1 ml-12 transition"
            >
              Cancelar
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
