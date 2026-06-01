import { CheckCircle2, XCircle, ExternalLink } from 'lucide-react'

interface ResultPhaseProps {
  success: boolean
  output?: string
  outputRef?: React.RefObject<HTMLDivElement | null>
  onRetry?: () => void
  onOpenSite?: () => void
  onClose: () => void
  toolLabel: string
}

export default function ResultPhase({
  success, output, outputRef, onRetry, onOpenSite, onClose, toolLabel
}: ResultPhaseProps) {
  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-4">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-7 h-7 text-emerald-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-emerald-400">{toolLabel} instalado com sucesso!</p>
          <p className="text-xs tx-faint mt-1">A verificação será atualizada automaticamente.</p>
        </div>
        <button onClick={onClose} className="btn-primary mt-2">Fechar</button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
        <XCircle className="w-7 h-7 text-red-400" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-red-400">Falha ao instalar {toolLabel}</p>
        <p className="text-xs tx-faint mt-1">Tente instalar manualmente ou use outro método.</p>
      </div>
      {output && (
        <div
          ref={outputRef}
          className="w-full font-mono text-[11px] tx-faint bg-black/40 rounded-xl p-3 max-h-32 overflow-y-auto whitespace-pre-wrap border border-red-500/10"
        >
          {output}
        </div>
      )}
      <div className="flex items-center gap-2 mt-2">
        {onRetry && <button onClick={onRetry} className="btn-surface text-sm">Tentar novamente</button>}
        {onOpenSite && (
          <button onClick={onOpenSite} className="btn-primary text-sm flex items-center gap-1.5">
            <ExternalLink className="w-3 h-3" /> Abrir site oficial
          </button>
        )}
      </div>
    </div>
  )
}
