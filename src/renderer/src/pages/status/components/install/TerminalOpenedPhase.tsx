import { Terminal, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

interface TerminalOpenedPhaseProps {
  toolLabel: string
  command: string
  onRecheck: () => Promise<void>
  onClose: () => void
}

export default function TerminalOpenedPhase({ toolLabel, command, onRecheck, onClose }: TerminalOpenedPhaseProps) {
  const [checking, setChecking] = useState(false)

  const handleRecheck = async () => {
    setChecking(true)
    await onRecheck()
    setChecking(false)
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Icon */}
      <div className="w-14 h-14 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
        <Terminal className="w-7 h-7 text-blue-400" />
      </div>

      {/* Description */}
      <div className="text-center">
        <p className="text-sm font-semibold tx-primary">Terminal aberto!</p>
        <p className="text-xs tx-muted mt-1 leading-relaxed max-w-sm">
          A instalação do <strong className="text-violet-400">{toolLabel}</strong> foi iniciada em um terminal externo.
          O comando pode precisar de permissões (senha de administrador).
        </p>
      </div>

      {/* Command preview */}
      {command && (
        <div className="w-full font-mono text-[11px] tx-faint bg-black/40 rounded-xl p-3 whitespace-pre-wrap border border-zinc-800/50 text-center">
          $ {command}
        </div>
      )}

      {/* Steps */}
      <div className="w-full flex flex-col gap-2 px-2">
        <div className="flex items-start gap-2.5 text-xs tx-muted">
          <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-[10px] font-bold tx-faint">1</span>
          <span>Complete a instalação no terminal que abriu</span>
        </div>
        <div className="flex items-start gap-2.5 text-xs tx-muted">
          <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-[10px] font-bold tx-faint">2</span>
          <span>Se pedir senha, digite a senha do seu sistema</span>
        </div>
        <div className="flex items-start gap-2.5 text-xs tx-muted">
          <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 text-[10px] font-bold tx-faint">3</span>
          <span>Após concluir, clique abaixo para verificar</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-2">
        <button onClick={onClose} className="btn-surface text-sm">Fechar</button>
        <button
          onClick={handleRecheck}
          disabled={checking}
          className="btn-primary text-sm flex items-center gap-1.5"
        >
          {checking ? (
            <><RefreshCw className="w-3 h-3 animate-spin" /> Verificando...</>
          ) : (
            <><CheckCircle2 className="w-3 h-3" /> Já instalei, verificar</>
          )}
        </button>
      </div>
    </div>
  )
}
