import { useState, useEffect } from 'react'
import { RefreshCw, ExternalLink, Globe, Home, Monitor, Smartphone, MousePointer2 } from 'lucide-react'

export type ViewportMode = 'desktop' | 'mobile'

interface PreviewBarProps {
  url: string
  onUrlChange: (url: string) => void
  onRefresh: () => void
  onHome: () => void
  onOpenExternal: (url: string) => void
  viewport: ViewportMode
  onViewportChange: (mode: ViewportMode) => void
  inspectorActive: boolean
  onToggleInspector: () => void
}

export default function PreviewBar({
  url, onUrlChange, onRefresh, onHome, onOpenExternal, viewport, onViewportChange,
  inspectorActive, onToggleInspector,
}: PreviewBarProps) {
  const [inputVal, setInputVal] = useState(url)

  useEffect(() => {
    setInputVal(url)
  }, [url])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onUrlChange(inputVal)
    }
  }

  return (
    <div className="editor-preview-bar">
      {/* Nav buttons */}
      <div className="flex items-center gap-0.5">
        <button onClick={onRefresh} className="btn-ghost p-1 rounded" title="Recarregar">
          <RefreshCw className="w-3 h-3" />
        </button>
        <button onClick={onHome} className="btn-ghost p-1 rounded" title="Ir para Home">
          <Home className="w-3 h-3" />
        </button>
      </div>

      {/* URL bar */}
      <div className="editor-url-bar">
        <Globe className="w-3 h-3 tx-faint flex-shrink-0" />
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          className="bg-transparent text-[11px] outline-none w-full font-mono"
          style={{ color: 'var(--tx-secondary)' }}
          spellCheck={false}
        />
        <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" title="Conectado" />
      </div>

      {/* Inspector toggle */}
      <button
        onClick={onToggleInspector}
        title={inspectorActive ? 'Desativar inspector (Esc)' : 'Inspecionar componente'}
        className={`p-1 rounded transition flex items-center gap-1 px-2 text-[10px] font-medium border ${
          inspectorActive
            ? 'bg-blue-500/15 border-blue-500/40 text-blue-400 shadow-sm shadow-blue-500/20'
            : 'editor-icon-btn'
        }`}
      >
        <MousePointer2 className="w-3 h-3" />
        {inspectorActive && <span>Inspecionar</span>}
      </button>

      {/* Viewport toggle */}
      <div className="flex items-center gap-0.5 rounded-md p-0.5" style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)' }}>
        <button
          onClick={() => onViewportChange('desktop')}
          title="Desktop"
          className={`p-1 rounded transition ${
            viewport === 'desktop' ? 'tx-primary' : 'tx-muted hover:tx-secondary'
          }`}
          style={viewport === 'desktop' ? { backgroundColor: 'var(--surface-raised)' } : {}}
        >
          <Monitor className="w-3 h-3" />
        </button>
        <button
          onClick={() => onViewportChange('mobile')}
          title="Mobile (390px)"
          className={`p-1 rounded transition ${
            viewport === 'mobile' ? 'tx-primary' : 'tx-muted hover:tx-secondary'
          }`}
          style={viewport === 'mobile' ? { backgroundColor: 'var(--surface-raised)' } : {}}
        >
          <Smartphone className="w-3 h-3" />
        </button>
      </div>

      {/* Open in external browser */}
      <button
        onClick={() => onOpenExternal(url)}
        className="btn-ghost p-1 rounded"
        title="Abrir no navegador"
      >
        <ExternalLink className="w-3 h-3" />
      </button>
    </div>
  )
}
