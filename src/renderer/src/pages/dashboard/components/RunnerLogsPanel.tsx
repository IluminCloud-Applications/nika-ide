import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronDown, ChevronUp, Trash2, Circle, Copy, Check, X, AlertTriangle } from 'lucide-react'
import ConsoleLogsTab from './ConsoleLogsTab'
import NetworkLogsTab from './NetworkLogsTab'

interface LogEntry {
  ts: number
  label: string
  data: string
}

type LabelFilter = 'all' | 'frontend' | 'backend'

interface RunnerLogsPanelProps {
  isRunning: boolean
  projectPath: string
}

const LABEL_COLORS: Record<string, string> = {
  frontend: 'text-blue-400',
  backend:  'text-emerald-400',
  install:  'text-amber-400',
}

// Patterns that indicate a real error (not just the word "error" in passing)
const ERROR_PATTERNS = [
  /\berror\b/i,
  /\bfailed\b/i,
  /\bfailure\b/i,
  /traceback \(most recent call last\)/i,
  /syntaxerror/i,
  /typeerror/i,
  /referenceerror/i,
  /importerror/i,
  /modulenotfounderror/i,
  /cannot find module/i,
  /module not found/i,
  /failed to compile/i,
  /build failed/i,
  /compilation failed/i,
  /\[error\]/i,
  /npm err!/i,
  /exited with code [^0]/i,
]

// Lines to ignore even if they match patterns above
const ERROR_IGNORE = [
  /eslint/i,
  /warning/i,
  /deprecated/i,
  /^info /i,
  /downloading/i,
  /installing/i,
]

function isErrorLine(line: string): boolean {
  const trimmed = line.trim()
  if (!trimmed) return false
  if (ERROR_IGNORE.some(r => r.test(trimmed))) return false
  return ERROR_PATTERNS.some(r => r.test(trimmed))
}

interface ErrorToast {
  id: number
  label: string
  lines: string[]
  copiedPrompt: boolean
}

export default function RunnerLogsPanel({ isRunning, projectPath }: RunnerLogsPanelProps) {
  const [logs, setLogs]             = useState<LogEntry[]>([])
  const [collapsed, setCollapsed]   = useState(false)
  const [filter, setFilter]         = useState<LabelFilter>('all')
  const [copied, setCopied]         = useState(false)
  const [errorToast, setErrorToast] = useState<ErrorToast | null>(null)
  const [activeTab, setActiveTab]   = useState<'terminal' | 'console' | 'network'>('terminal')
  const bottomRef                   = useRef<HTMLDivElement>(null)
  const errorBatchRef               = useRef<{ label: string; lines: string[] } | null>(null)
  const errorTimerRef               = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastIdRef                  = useRef(0)

  const [portConflict, setPortConflict] = useState<number | null>(null)
  const [isResolving, setIsResolving] = useState(false)
  const [resolveMessage, setResolveMessage] = useState<string | null>(null)

  const flushErrorBatch = useCallback(() => {
    if (!errorBatchRef.current) return
    const { label, lines } = errorBatchRef.current
    errorBatchRef.current = null
    toastIdRef.current += 1
    setErrorToast({ id: toastIdRef.current, label, lines, copiedPrompt: false })
  }, [])

  const scheduleErrorFlush = useCallback((label: string, line: string) => {
    if (!errorBatchRef.current) {
      errorBatchRef.current = { label, lines: [line] }
    } else {
      if (errorBatchRef.current.lines.length < 30) {
        errorBatchRef.current.lines.push(line)
      }
    }
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    errorTimerRef.current = setTimeout(flushErrorBatch, 1500)
  }, [flushErrorBatch])

  const handleResolveConflict = async () => {
    if (!portConflict) return
    setIsResolving(true)
    setResolveMessage(null)
    try {
      const res = await window.api.runner.resolvePortConflict(portConflict)
      if (res.success) {
        setResolveMessage(res.message)
        setPortConflict(null)
        // Restart runner
        await window.api.runner.stop(projectPath)
        await window.api.runner.start(projectPath)
      } else {
        setResolveMessage(res.message)
      }
    } catch (err: any) {
      setResolveMessage(`Erro: ${err.message}`)
    } finally {
      setIsResolving(false)
    }
  }

  useEffect(() => {
    const cleanLog = window.api.runner.onLog(({ label, data }) => {
      setLogs(prev => [...prev, { ts: Date.now(), label, data }])
      // Only detect errors for frontend/backend (not install noise)
      if (label === 'frontend' || label === 'backend') {
        for (const line of data.split('\n')) {
          if (isErrorLine(line)) {
            scheduleErrorFlush(label, line.trim())
          }

          // Detect generic and docker port binding conflicts
          const match1 = line.match(/Bind for [0-9.]+:(\d+) failed/i)
          const match2 = line.match(/listen tcp [0-9.]+:(\d+): bind/i)
          const match3 = line.match(/port (\d+) is already allocated/i)
          const port = match1 ? parseInt(match1[1], 10) : (match2 ? parseInt(match2[1], 10) : (match3 ? parseInt(match3[1], 10) : null))
          if (port) {
            setPortConflict(port)
          }
        }
      }
    })
    const cleanExit = window.api.runner.onExit(({ label, code }) => {
      setLogs(prev => [...prev, { ts: Date.now(), label, data: `[DONE] ${label} saiu com código ${code}\n` }])
      if (code !== 0 && (label === 'frontend' || label === 'backend')) {
        scheduleErrorFlush(label, `Process exited with code ${code}`)
      }
    })
    return () => { cleanLog(); cleanExit() }
  }, [scheduleErrorFlush, projectPath])

  // Auto-scroll
  useEffect(() => {
    if (!collapsed) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs, collapsed])

  // Reset logs and error state when stopped
  useEffect(() => {
    if (!isRunning) {
      setLogs([])
      setErrorToast(null)
      setPortConflict(null)
      setResolveMessage(null)
      setIsResolving(false)
      errorBatchRef.current = null
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current)
    }
  }, [isRunning])

  const handleCopyErrorPrompt = (toast: ErrorToast) => {
    const errorText = toast.lines.join('\n')
    const prompt = `Fix these errors:\n\n\`\`\`\n${errorText}\n\`\`\``
    navigator.clipboard.writeText(prompt).then(() => {
      setErrorToast(prev => prev?.id === toast.id ? { ...prev, copiedPrompt: true } : prev)
      setTimeout(() => setErrorToast(prev => prev?.id === toast.id ? { ...prev, copiedPrompt: false } : prev), 2000)
    })
  }

  const filtered = filter === 'all' ? logs : logs.filter(l => l.label === filter)
  const hasLogs  = logs.length > 0

  const handleCopy = () => {
    const text = filtered
      .map(e => `[${e.label}] ${e.data}`)
      .join('')
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (!isRunning && !hasLogs) return null

  return (
    <>
      {/* Error toast — floats above the logs panel */}
      {errorToast && (
        <div className="px-3 py-2.5 flex items-start gap-3 flex-shrink-0 animate-slide-up"
          style={{ borderTop: '1px solid rgba(239,68,68,0.3)', backgroundColor: 'rgba(127,29,29,0.15)' }}>
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">
                Erro detectado · {errorToast.label}
              </span>
            </div>
            <p className="text-[10px] tx-muted font-mono truncate leading-relaxed">
              {errorToast.lines[0]}
              {errorToast.lines.length > 1 && <span className="tx-faint"> +{errorToast.lines.length - 1} linha(s)</span>}
            </p>
          </div>
          <button
            onClick={() => handleCopyErrorPrompt(errorToast)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-semibold transition flex-shrink-0 ${
              errorToast.copiedPrompt
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
            }`}
            title="Copiar prompt para corrigir o erro"
          >
            {errorToast.copiedPrompt
              ? <><Check className="w-3 h-3" /> Copiado!</>
              : <><Copy className="w-3 h-3" /> Copiar Prompt</>
            }
          </button>
          <button
            onClick={() => setErrorToast(null)}
            className="btn-ghost p-0.5 rounded flex-shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

    <div className={`editor-logs-panel transition-all duration-200 ${collapsed ? 'h-9' : 'h-52'}`}>
      {/* Toolbar */}
      <div className="editor-logs-header flex items-center justify-between border-b border-zinc-800" onClick={() => setCollapsed(c => !c)}>
        {/* Tab Buttons */}
        <div className="flex items-center gap-1 select-none" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => { setActiveTab('terminal'); setCollapsed(false) }}
            className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'terminal' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Terminal
          </button>
          <button
            onClick={() => { setActiveTab('console'); setCollapsed(false) }}
            className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'console' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Console
          </button>
          <button
            onClick={() => { setActiveTab('network'); setCollapsed(false) }}
            className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-widest border-b-2 transition-all ${
              activeTab === 'network' ? 'border-blue-500 text-blue-400 font-bold' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Network
          </button>
        </div>

        {/* Label filter for Terminal Tab */}
        {activeTab === 'terminal' && (
          <div className="flex items-center gap-1 ml-2" onClick={e => e.stopPropagation()}>
            {(['all', 'frontend', 'backend'] as LabelFilter[]).map(f => (
              <button
                key={f}
                onClick={(e) => { e.stopPropagation(); setFilter(f) }}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition ${
                  filter === f ? 'tx-primary' : 'tx-muted hover:tx-secondary'
                }`}
                style={filter === f ? { backgroundColor: 'var(--surface-base)' } : {}}
              >
                {f !== 'all' && (
                  <Circle className={`w-1.5 h-1.5 fill-current ${
                    f === 'frontend' ? 'text-blue-400' : 'text-emerald-400'
                  }`} />
                )}
                {f === 'all' ? 'Todos' : f}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
          {activeTab === 'terminal' && hasLogs && (
            <button
              onClick={(e) => { e.stopPropagation(); handleCopy() }}
              className="btn-ghost flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
              title="Copiar logs"
            >
              {copied
                ? <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Copiado!</span></>
                : <><Copy className="w-3 h-3" />Copiar</>
              }
            </button>
          )}

          {activeTab === 'terminal' && (
            <button
              onClick={(e) => { e.stopPropagation(); setLogs([]) }}
              className="btn-ghost p-1 rounded"
              title="Limpar logs"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); setCollapsed(c => !c) }}
            className="btn-ghost p-1 rounded"
            title={collapsed ? 'Expandir' : 'Recolher'}
          >
            {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Log content */}
      {!collapsed && (
        <div className="flex-1 flex flex-col min-h-0 bg-zinc-950/60 overflow-hidden">
          {activeTab === 'terminal' && portConflict && (
            <div className="p-3 mx-3 my-2 bg-red-950/20 border border-red-500/30 rounded-md flex flex-col gap-2 animate-slide-up select-none">
              <div className="flex items-center gap-2 text-red-400 font-semibold text-[11px] uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
                <span>Porta {portConflict} Ocupada</span>
              </div>
              <p className="text-[10px] text-zinc-300 leading-relaxed">
                A porta {portConflict} já está alocada por outro processo ou container. Se for outro container Docker ativo, podemos tentar pará-lo para liberar a porta e tentar reiniciar o projeto automaticamente.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResolveConflict}
                  disabled={isResolving}
                  className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 disabled:opacity-50 text-[10px] text-white font-bold transition flex items-center gap-1.5"
                >
                  {isResolving ? 'Resolvendo...' : 'Parar Container Conflitante'}
                </button>
                <button
                  onClick={() => setPortConflict(null)}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-[10px] text-zinc-300 font-semibold transition"
                >
                  Dispensar
                </button>
              </div>
              {resolveMessage && (
                <div className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{resolveMessage}</div>
              )}
            </div>
          )}
          {activeTab === 'terminal' && (
            <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed">
              {filtered.length === 0 ? (
                <span className="tx-faint">Aguardando logs...</span>
              ) : (
                filtered.map((entry, i) => (
                  <div key={i} className="flex gap-2 min-w-0">
                    <span className={`shrink-0 font-semibold ${LABEL_COLORS[entry.label] ?? 'tx-muted'}`}>
                      [{entry.label}]
                    </span>
                    <span className="tx-secondary whitespace-pre-wrap break-all">{entry.data}</span>
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>
          )}

          {activeTab === 'console' && <ConsoleLogsTab />}
          {activeTab === 'network' && <NetworkLogsTab />}
        </div>
      )}
    </div>
    </>
  )
}
