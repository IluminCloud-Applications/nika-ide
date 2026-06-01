import { Loader2, CheckCircle2, RefreshCw, Sparkles } from 'lucide-react'

interface StatusHeaderProps {
  hasMissing: boolean
  globalLoading: boolean
  aiInstalling: boolean
  aiDone: boolean
  onInstallWithAI: () => void
  onRunAllChecks: () => void
}

export default function StatusHeader({
  hasMissing, globalLoading, aiInstalling, aiDone,
  onInstallWithAI, onRunAllChecks
}: StatusHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tx-primary">Status do Sistema</h1>
        <p className="tx-muted text-sm mt-1">Verifique se todas as ferramentas estão instaladas e prontas.</p>
      </div>
      <div className="flex items-center gap-2">
        {hasMissing && (
          <button
            onClick={onInstallWithAI}
            disabled={aiInstalling || globalLoading}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow
              ${aiDone
                ? 'bg-emerald-600 text-white'
                : 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white shadow-violet-500/20'
              }
              disabled:opacity-60 disabled:cursor-wait
            `}
          >
            {aiInstalling ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Abrindo terminal...</>
            ) : aiDone ? (
              <><CheckCircle2 className="w-4 h-4" /> Terminal aberto!</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Instalar com IA</>
            )}
          </button>
        )}
        <button
          onClick={onRunAllChecks}
          disabled={globalLoading}
          className="btn-surface flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${globalLoading ? 'animate-spin' : ''}`} />
          Verificar tudo
        </button>
      </div>
    </div>
  )
}
