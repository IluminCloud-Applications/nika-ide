import { CheckCircle2, XCircle, Loader2, Download, RefreshCw, AlertTriangle, Terminal } from 'lucide-react'

export interface ToolStatus {
  id: string
  name: string
  label: string
  version: string | null
  installed: boolean
  description: string
  installUrl: string
  category: 'core' | 'runtime' | 'ai' | 'tunnel'
  required: boolean
}

interface ToolCardProps {
  tool: ToolStatus
  loading: boolean
  installing: boolean
  onInstallClick: (tool: ToolStatus) => void
  onRecheck: (id: string) => void
}

function VersionBadge({ version }: { version: string }) {
  const short = version.replace(/^(git version |node |npm |Docker version |Python |claude |gemini )/i, '').split('\n')[0].slice(0, 30)
  return (
    <span className="badge font-mono text-[11px]"
      style={{ borderColor: 'var(--line)', color: 'var(--tx-muted)', backgroundColor: 'var(--surface-overlay)' }}
    >
      {short}
    </span>
  )
}

export default function ToolCard({ tool, loading, installing, onInstallClick, onRecheck }: ToolCardProps) {
  const categoryColors = {
    core:    'text-blue-400 bg-blue-500/10 border-blue-500/20',
    runtime: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    ai:      'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    tunnel:  'text-orange-400 bg-orange-500/10 border-orange-500/20',
  }
  const categoryLabels = { core: 'Core', runtime: 'Runtime', ai: 'AI CLI', tunnel: 'Tunnel' }

  return (
    <div className={`
      glass-panel rounded-xl p-4 flex items-start gap-4 transition-all duration-200
      ${!tool.installed && tool.required ? 'border-red-500/20' : ''}
      ${installing ? 'ring-1 ring-violet-500/30 bg-violet-500/[0.02]' : ''}
    `}>
      {/* Status Icon */}
      <div className="mt-0.5 shrink-0">
        {loading ? (
          <Loader2 className="w-5 h-5 tx-faint animate-spin" />
        ) : installing ? (
          <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
        ) : tool.installed ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <XCircle className={`w-5 h-5 ${tool.required ? 'text-red-400' : 'text-amber-400'}`} />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold tx-primary flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 tx-faint" />
            {tool.label}
          </span>
          <span className={`badge ${categoryColors[tool.category]}`}>
            {categoryLabels[tool.category]}
          </span>
          {tool.required && !tool.installed && (
            <span className="badge text-red-400 bg-red-500/10 border-red-500/20 flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5" /> Obrigatório
            </span>
          )}
          {installing && (
            <span className="badge text-violet-400 bg-violet-500/10 border-violet-500/20">
              Instalando...
            </span>
          )}
        </div>
        <p className="text-xs tx-muted mt-1 leading-relaxed">{tool.description}</p>
        {tool.installed && tool.version && (
          <div className="mt-2">
            <VersionBadge version={tool.version} />
          </div>
        )}
        {!tool.installed && !installing && (
          <p className="text-xs tx-faint mt-1.5 font-mono">
            $ {tool.id === 'python' ? 'python3' : tool.id} --version{' '}
            <span className="text-red-500/70">→ não encontrado</span>
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onRecheck(tool.id)}
          disabled={loading || installing}
          className="btn-ghost p-1.5 rounded-lg"
          title="Verificar novamente"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
        {!tool.installed && !installing && (
          <button
            onClick={() => onInstallClick(tool)}
            className="btn-primary flex items-center gap-1.5"
          >
            <Download className="w-3 h-3" /> Instalar
          </button>
        )}
      </div>
    </div>
  )
}
