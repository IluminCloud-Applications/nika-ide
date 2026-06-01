import { Loader2, Zap, ExternalLink, Terminal } from 'lucide-react'

interface InstallInfo {
  canAutoInstall: boolean
  command?: string | null
  url: string
  platform: string
  platformLabel: string
  interactive: boolean
}

interface ChoosePhaseProps {
  info: InstallInfo | null
  onAutoInstall: () => void
  onOpenSite: () => void
}

export default function ChoosePhase({ info, onAutoInstall, onOpenSite }: ChoosePhaseProps) {
  if (!info) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin tx-faint" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm tx-muted mb-1">Escolha como deseja instalar:</p>

      {/* Auto-install option */}
      {info.canAutoInstall && (
        <button
          onClick={onAutoInstall}
          className="group flex items-start gap-4 p-4 rounded-xl border border-violet-500/20 bg-violet-500/5 hover:bg-violet-500/10 hover:border-violet-500/30 transition-all text-left"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0 mt-0.5 shadow-lg shadow-violet-500/20">
            {info.interactive ? <Terminal className="w-4 h-4 text-white" /> : <Zap className="w-4 h-4 text-white" />}
          </div>
          <div>
            <span className="text-sm font-semibold tx-primary flex items-center gap-2">
              {info.interactive ? 'Instalar via terminal' : 'Instalar automaticamente'}
              <span className="badge text-[10px] text-emerald-400 bg-emerald-500/10 border-emerald-500/20">Recomendado</span>
            </span>
            <p className="text-xs tx-faint mt-1 leading-relaxed">
              {info.interactive
                ? `Abre um terminal com o comando de instalação. Pode pedir senha de administrador.`
                : `Instala com 1 clique usando o gerenciador de pacotes do seu sistema (${info.platformLabel}).`
              }
            </p>
            {info.command && (
              <p className="text-[11px] tx-faint mt-2 font-mono bg-black/20 px-2 py-1 rounded-md truncate max-w-[380px]">
                $ {info.command}
              </p>
            )}
          </div>
        </button>
      )}

      {/* Open website option */}
      <button
        onClick={onOpenSite}
        className="group flex items-start gap-4 p-4 rounded-xl border border-zinc-700/50 hover:border-zinc-600/50 bg-zinc-800/30 hover:bg-zinc-800/50 transition-all text-left"
      >
        <div className="w-9 h-9 rounded-lg bg-zinc-700/50 flex items-center justify-center shrink-0 mt-0.5">
          <ExternalLink className="w-4 h-4 tx-muted" />
        </div>
        <div>
          <span className="text-sm font-semibold tx-primary">Abrir site oficial</span>
          <p className="text-xs tx-faint mt-1 leading-relaxed">
            Abre o site oficial para baixar e instalar manualmente.
          </p>
          <p className="text-[11px] text-blue-400/60 mt-1.5 truncate max-w-[380px]">
            {info.url}
          </p>
        </div>
      </button>

      {/* Terminal prompt hint */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900/50 border border-zinc-800/50 mt-1">
        <Terminal className="w-3.5 h-3.5 tx-faint shrink-0" />
        <p className="text-[11px] tx-faint">
          Ou use o botão <strong className="text-violet-400">Instalar com IA</strong> no topo da página para instalar todas de uma vez via Antigravity CLI.
        </p>
      </div>
    </div>
  )
}
