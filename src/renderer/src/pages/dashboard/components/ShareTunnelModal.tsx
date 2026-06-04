import { useState, useEffect, useRef } from 'react'
import {
  Share2, Copy, Check, Loader2, Globe, StopCircle,
  AlertCircle, Terminal, Info
} from 'lucide-react'
import TunnelLogs from './TunnelLogs'

interface TunnelState {
  running: boolean
  url: string | null
  containerId: string | null
  error: string | null
}

interface ShareTunnelModalProps {
  isOpen: boolean
  onClose: () => void
  localPort?: number
  projectPath?: string
}

const DEFAULT_PORT = 5177

export default function ShareTunnelModal({ isOpen, onClose, localPort = DEFAULT_PORT, projectPath }: ShareTunnelModalProps) {
  const [state, setState]       = useState<TunnelState>({ running: false, url: null, containerId: null, error: null })
  const [loading, setLoading]   = useState(false)
  const [copied, setCopied]     = useState(false)
  const [logs, setLogs]         = useState<string>('')
  const [showLogs, setShowLogs] = useState(false)
  const [polling, setPolling]   = useState(false)
  const pollRef                 = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!isOpen) return
    window.api.tunnel.status().then(setState)

    const unsub = window.api.tunnel.onState(setState)
    return () => {
      unsub()
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [isOpen])

  // Poll status while running but URL not yet available
  useEffect(() => {
    if (state.running && !state.url && !state.error) {
      setPolling(true)
      pollRef.current = setInterval(async () => {
        const s = await window.api.tunnel.status()
        setState(s)
        if (s.url || s.error) {
          clearInterval(pollRef.current!)
          setPolling(false)
        }
      }, 2000)
    } else {
      setPolling(false)
      if (pollRef.current) clearInterval(pollRef.current)
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [state.running, state.url, state.error])

  const handleStart = async () => {
    setLoading(true)
    setState(prev => ({ ...prev, error: null, url: null }))
    const res = await window.api.tunnel.start(localPort, projectPath)
    if (!res.success) {
      setState(prev => ({ ...prev, error: res.error, running: false }))
    }
    setLoading(false)
  }

  const handleStop = async () => {
    setLoading(true)
    await window.api.tunnel.stop()
    setState({ running: false, url: null, containerId: null, error: null })
    setLoading(false)
  }

  const handleCopy = () => {
    if (!state.url) return
    navigator.clipboard.writeText(state.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShowLogs = async () => {
    const res = await window.api.tunnel.getLogs()
    setLogs(res.logs || '')
    setShowLogs(!showLogs)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-glass flex flex-col space-y-4 animate-slide-up"
        style={{ willChange: 'transform' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--line-subtle)' }}>
          <h2 className="text-sm font-bold flex items-center gap-2 tx-primary">
            <Share2 className="w-4 h-4 text-accent" /> Compartilhar Projeto
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {/* Info banner */}
        <div className="flex gap-2 items-start p-3 rounded-xl text-[11px]"
          style={{ backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)', color: 'var(--tx-secondary)' }}>
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-indigo-400" />
          <p>Gera um link público temporário via <strong className="tx-primary">Cloudflare Tunnel</strong> usando Docker.
            Qualquer pessoa com o link pode acessar o seu projeto rodando localmente na porta <code className="font-mono">{localPort}</code>.</p>
        </div>

        {/* Status display */}
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--surface-overlay)' }}>
          {/* Port row */}
          <div className="flex items-center justify-between px-3.5 py-2.5 text-xs"
            style={{ borderBottom: '1px solid var(--line-subtle)' }}>
            <span className="tx-muted font-medium">Porta local</span>
            <span className="font-mono font-semibold tx-primary">{localPort}</span>
          </div>

          {/* Status row */}
          <div className="flex items-center justify-between px-3.5 py-2.5 text-xs"
            style={{ borderBottom: state.url ? '1px solid var(--line-subtle)' : undefined }}>
            <span className="tx-muted font-medium">Status</span>
            <span className="flex items-center gap-1.5 font-semibold">
              {state.running && !state.url && !state.error && (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                  <span className="text-amber-400">Aguardando URL…</span>
                </>
              )}
              {state.running && state.url && (
                <>
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Ativo</span>
                </>
              )}
              {!state.running && !loading && (
                <span className="tx-faint">Inativo</span>
              )}
              {loading && (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
                  <span className="text-blue-400">Processando…</span>
                </>
              )}
            </span>
          </div>

          {/* URL row */}
          {state.url && (
            <div className="flex items-center justify-between px-3.5 py-2.5 text-xs gap-2">
              <span className="tx-muted font-medium flex-shrink-0">Link público</span>
              <div className="flex items-center gap-1.5 min-w-0">
                <a
                  href="#"
                  onClick={e => { e.preventDefault(); window.api.system.openUrl(state.url!) }}
                  className="font-mono text-indigo-400 hover:text-indigo-300 truncate transition-colors"
                  title={state.url}
                >
                  {state.url.replace('https://', '')}
                </a>
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 p-1 rounded hover:bg-white/5 transition"
                  title="Copiar link"
                >
                  {copied
                    ? <Check className="w-3.5 h-3.5 text-emerald-400" />
                    : <Copy className="w-3.5 h-3.5 tx-faint" />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {state.error && (
          <div className="p-3 rounded-lg flex gap-2 items-start text-[11px]"
            style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>{state.error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          {!state.running ? (
            <button
              onClick={handleStart}
              disabled={loading}
              className="btn-primary w-full justify-center py-2 text-xs disabled:opacity-40"
            >
              {loading
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Globe className="w-3.5 h-3.5" />}
              {loading ? 'Iniciando tunnel…' : 'Gerar Link Público'}
            </button>
          ) : (
            <button
              onClick={handleStop}
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-semibold transition-all disabled:opacity-40"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <StopCircle className="w-3.5 h-3.5" />}
              {loading ? 'Parando…' : 'Parar Tunnel'}
            </button>
          )}

          {state.running && state.url && (
            <button
              onClick={handleCopy}
              className="btn-surface w-full justify-center py-2 text-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Link'}
            </button>
          )}

          <button
            onClick={handleShowLogs}
            className="btn-ghost w-full justify-center py-1.5 text-[11px] tx-faint gap-1.5"
          >
            <Terminal className="w-3 h-3" />
            {showLogs ? 'Ocultar Logs' : 'Ver Logs do Tunnel'}
          </button>
        </div>

        {/* Logs panel */}
        {showLogs && (
          <TunnelLogs logs={logs} onRefresh={handleShowLogs} />
        )}
      </div>
    </div>
  )
}
