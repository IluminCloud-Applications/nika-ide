import { Loader2 } from 'lucide-react'

interface InstallingPhaseProps {
  output: string
  outputRef: React.RefObject<HTMLDivElement | null>
  toolLabel: string
}

export default function InstallingPhase({ output, outputRef, toolLabel }: InstallingPhaseProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
        <span className="text-sm font-medium tx-primary">Instalando {toolLabel}...</span>
      </div>
      <div
        ref={outputRef}
        className="font-mono text-[11px] tx-faint bg-black/40 rounded-xl p-3 max-h-48 overflow-y-auto whitespace-pre-wrap border border-zinc-800/50"
      >
        {output || 'Aguardando saída do comando...'}
      </div>
      <p className="text-[11px] tx-faint text-center">
        Isso pode levar alguns minutos. Não feche esta janela.
      </p>
    </div>
  )
}
