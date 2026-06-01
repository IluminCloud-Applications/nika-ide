import { useState, useEffect } from 'react'
import { X, Copy, Check, Sparkles, Terminal, AlertCircle } from 'lucide-react'

interface InstallWithAIModalProps {
  isOpen: boolean
  onClose: () => void
  missingToolIds: string[]
  checks: Record<string, { version: string | null; installed: boolean; loading: boolean }>
  onInstallStarted: () => void
}

export default function InstallWithAIModal({
  isOpen, onClose, missingToolIds, checks, onInstallStarted
}: InstallWithAIModalProps) {
  const [promptText, setPromptText] = useState('')
  const [copied, setCopied] = useState(false)
  const [launchingId, setLaunchingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    window.api.system.getInstallPrompt(missingToolIds)
      .then(setPromptText)
      .catch(err => console.error('Erro ao gerar prompt:', err))
  }, [isOpen, missingToolIds])

  if (!isOpen) return null

  const handleCopy = () => {
    if (!promptText) return
    navigator.clipboard.writeText(promptText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLaunchCli = async (cliId: string) => {
    setLaunchingId(cliId)
    try {
      await window.api.system.installWithAI(missingToolIds, cliId)
      onInstallStarted()
      onClose()
    } catch (e) {
      console.error('Falha ao abrir terminal com CLI:', e)
    } finally {
      setLaunchingId(null)
    }
  }

  const clis = [
    { id: 'claude', label: 'Claude CLI', name: 'Claude Code' },
    { id: 'agy', label: 'Antigravity CLI', name: 'Antigravity CLI' },
    { id: 'codex', label: 'Codex CLI', name: 'Codex CLI' }
  ]

  const installedClis = clis.filter(cli => checks[cli.id]?.installed)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative glass-panel rounded-2xl p-6 w-full max-w-xl mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b pb-3" style={{ borderColor: 'var(--line-subtle)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold tx-primary">Instalação Assistida por IA</h2>
              <p className="text-[11px] tx-muted mt-0.5">Use uma CLI local ou copie o prompt para o seu chat de IA favorito.</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-sm">
          {/* Prompt Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold tx-muted uppercase tracking-wider">Prompt Gerado</span>
              <button
                onClick={handleCopy}
                disabled={!promptText}
                className="btn-ghost flex items-center gap-1.5 text-xs py-1 px-2.5 rounded-md hover:bg-white/5 transition"
              >
                {copied ? (
                  <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copiado!</>
                ) : (
                  <><Copy className="w-3.5 h-3.5" /> Copiar Prompt</>
                )}
              </button>
            </div>
            <div className="relative rounded-lg overflow-hidden border bg-black/40 text-xs text-left" style={{ borderColor: 'var(--line-subtle)' }}>
              <pre className="p-3.5 text-zinc-300 font-mono whitespace-pre-wrap select-all leading-relaxed max-h-[180px] overflow-y-auto">
                {promptText || 'Gerando prompt de instalação...'}
              </pre>
            </div>
          </div>

          {/* AI CLI Launcher Options */}
          <div className="space-y-2 border-t pt-4" style={{ borderColor: 'var(--line-subtle)' }}>
            <span className="text-xs font-semibold tx-muted uppercase tracking-wider block">Instalar com CLI Local</span>
            
            {installedClis.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {installedClis.map(cli => (
                  <button
                    key={cli.id}
                    onClick={() => handleLaunchCli(cli.id)}
                    disabled={launchingId !== null}
                    className="flex flex-col items-center justify-center p-3 rounded-lg border bg-surface/50 hover:bg-surface/80 border-zinc-800 hover:border-violet-500/30 transition text-center group"
                  >
                    <Terminal className="w-5 h-5 text-violet-400 group-hover:scale-110 transition duration-200 mb-1.5" />
                    <span className="text-xs font-medium tx-primary block">{cli.name}</span>
                    <span className="text-[10px] tx-muted mt-0.5">Executar comando</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800 text-xs tx-muted">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium tx-primary">Nenhuma CLI de IA local encontrada no sistema.</p>
                  <p className="mt-1">
                    Copie o prompt acima e cole no seu modelo de IA de preferência (ChatGPT, Claude Web ou Gemini). Alternativamente, você pode instalar o Claude CLI ou o Antigravity CLI abaixo nas opções da tela de Status.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
