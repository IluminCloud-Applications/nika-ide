import { Loader2, XCircle, ShieldCheck } from 'lucide-react'
import { ToolStatus } from './ToolCard'

type CheckState = Record<string, { version: string | null; installed: boolean; loading: boolean }>

interface StatusBannerProps {
  globalLoading: boolean
  allReady: boolean
  totalInstalled: number
  totalTools: number
  totalMissing: ToolStatus[]
  requiredMissing: ToolStatus[]
  checks: CheckState
  tools: ToolStatus[]
}

export default function StatusBanner({
  globalLoading, allReady, totalInstalled, totalTools,
  totalMissing, requiredMissing, checks, tools
}: StatusBannerProps) {
  return (
    <div className={`
      flex items-center gap-4 p-4 rounded-xl border mb-8 transition-all
      ${globalLoading
        ? 'bg-zinc-900/30 border-zinc-800/60'
        : allReady
          ? 'bg-emerald-500/5 border-emerald-500/20'
          : requiredMissing.length > 0
            ? 'bg-red-500/5 border-red-500/20'
            : 'bg-amber-500/5 border-amber-500/20'
      }
    `}>
      <div className="shrink-0">
        {globalLoading
          ? <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
          : allReady
            ? <ShieldCheck className="w-6 h-6 text-emerald-400" />
            : <XCircle className={`w-6 h-6 ${requiredMissing.length > 0 ? 'text-red-400' : 'text-amber-400'}`} />
        }
      </div>
      <div className="flex-1">
        {globalLoading ? (
          <p className="text-sm text-zinc-400 font-medium">Verificando ferramentas instaladas...</p>
        ) : allReady ? (
          <>
            <p className="text-sm font-semibold text-emerald-400">Tudo pronto para usar!</p>
            <p className="text-xs text-zinc-500 mt-0.5">{totalInstalled} de {totalTools} ferramentas encontradas.</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-zinc-200">
              {totalMissing.length} {totalMissing.length === 1 ? 'ferramenta faltando' : 'ferramentas faltando'}
              {requiredMissing.length > 0 && (
                <span className="text-red-400 ml-1">
                  ({requiredMissing.length} obrigatória{requiredMissing.length > 1 ? 's' : ''})
                </span>
              )}
            </p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Clique em <strong className="text-violet-400">Instalar</strong> em cada ferramenta para ver as opções de instalação.
            </p>
          </>
        )}
      </div>
      {/* Mini dots */}
      <div className="flex items-center gap-1.5 shrink-0">
        {tools.map(t => (
          <div
            key={t.id}
            title={t.label}
            className={`w-2 h-2 rounded-full transition-colors ${
              checks[t.id]?.loading ? 'bg-zinc-700 animate-pulse' :
              t.installed ? 'bg-emerald-400' :
              t.required  ? 'bg-red-400'     : 'bg-amber-400/60'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
