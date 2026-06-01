import { useState } from 'react'
import { RefreshCw, ExternalLink, Play, Globe, ArrowLeft, ArrowRight } from 'lucide-react'

interface PreviewPanelProps {
  isRunning: boolean
  previewUrl: string
  onUrlChange: (url: string) => void
}

export default function PreviewPanel({ isRunning, previewUrl, onUrlChange }: PreviewPanelProps) {
  const [urlInput, setUrlInput] = useState(previewUrl)
  const [key, setKey] = useState(0)

  const handleRefresh = () => setKey(k => k + 1)

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault()
    onUrlChange(urlInput)
    setKey(k => k + 1)
  }

  if (!isRunning) {
    return (
      <div className="editor-idle-state text-center">
        <div className="p-6 rounded-3xl card shadow-2xl">
          <Play className="w-16 h-16 tx-faint" />
        </div>
        <div className="max-w-md space-y-3">
          <h3 className="text-xl font-bold tx-secondary">Projeto Ocioso</h3>
          <p className="tx-muted text-sm leading-relaxed">
            Clique em <strong className="text-blue-400">Iniciar Projeto</strong> para rodar
            o frontend React e o backend Python via Docker. A visualização
            em tempo real aparecerá aqui automaticamente.
          </p>
        </div>
        <div className="flex items-center gap-6 text-xs tx-faint mt-4">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> Frontend: localhost:5177
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" /> Backend: localhost:8742
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full" style={{ backgroundColor: 'var(--surface-base)' }}>
      {/* URL Bar */}
      <div className="h-10 px-3 flex items-center gap-2 text-xs tx-muted" style={{ borderBottom: '1px solid var(--line)', backgroundColor: 'var(--surface-raised)' }}>
        <div className="flex items-center gap-1">
          <button className="btn-ghost p-1 rounded" disabled>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button className="btn-ghost p-1 rounded" disabled>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={handleRefresh} className="btn-ghost p-1 rounded">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleNavigate} className="flex-1 flex">
          <div className="flex-1 flex items-center rounded-md px-3 py-1 gap-2" style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)' }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              className="flex-1 bg-transparent text-xs outline-none font-mono tx-secondary"
            />
          </div>
        </form>

        <a
          href={previewUrl}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost p-1 rounded"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Iframe */}
      <iframe
        key={key}
        src={previewUrl}
        className="flex-1 w-full bg-white"
        title="App Live Preview"
      />
    </div>
  )
}
