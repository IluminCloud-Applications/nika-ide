import { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import { Copy, Check, AlertTriangle, AlertCircle, Info, Terminal, Trash2 } from 'lucide-react'
import { devtoolsLogs, ConsoleLog } from '../stores/devtoolsLogs'

export default function ConsoleLogsTab() {
  const logs = useSyncExternalStore(devtoolsLogs.subscribeConsole, devtoolsLogs.getConsole)
  const [filter, setFilter] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleCopySingle = (log: ConsoleLog, index: number) => {
    const formatted = `[Console ${log.level.toUpperCase()}]
Message: ${log.data}
Time: ${new Date(log.ts).toLocaleTimeString()}`
    
    navigator.clipboard.writeText(formatted).then(() => {
      setCopiedId(index)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  const handleCopyAll = () => {
    const text = logs
      .map(l => `[${l.level.toUpperCase()}] ${l.data}`)
      .join('\n')
    navigator.clipboard.writeText(text)
  }

  const filteredLogs = filter === 'all' 
    ? logs 
    : logs.filter(l => filter === 'errors' ? l.level === 'error' : l.level !== 'error')

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilter('all')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
              filter === 'all' ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Todos ({logs.length})
          </button>
          <button
            onClick={() => setFilter('errors')}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition ${
              filter === 'errors' ? 'bg-red-950/40 text-red-400 border border-red-900/30' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Erros ({logs.filter(l => l.level === 'error').length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {logs.length > 0 && (
            <button
              onClick={handleCopyAll}
              className="btn-ghost flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
              title="Copiar todos os logs"
            >
              <Copy className="w-3 h-3" />
              <span>Copiar Todos</span>
            </button>
          )}
          <button
            onClick={() => devtoolsLogs.clearConsole()}
            className="btn-ghost p-1 rounded hover:text-zinc-100"
            title="Limpar Console"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Log lines */}
      <div className="flex-1 overflow-y-auto px-3 py-2 font-mono text-[11px] leading-relaxed space-y-1">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-zinc-500 gap-1.5">
            <Terminal className="w-5 h-5 text-zinc-600" />
            <span className="text-[10px]">Nenhum log de console recebido.</span>
          </div>
        ) : (
          filteredLogs.map((log, i) => {
            const isError = log.level === 'error'
            const isWarn = log.level === 'warn'
            
            return (
              <div 
                key={i} 
                className={`group flex items-start gap-2 p-1 rounded transition-colors ${
                  isError ? 'bg-red-950/10 text-red-300 hover:bg-red-950/20' : 
                  isWarn ? 'bg-amber-950/10 text-amber-300 hover:bg-amber-950/20' : 
                  'text-zinc-300 hover:bg-zinc-800/30'
                }`}
              >
                {isError ? (
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                ) : isWarn ? (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                )}
                
                <span className="flex-1 whitespace-pre-wrap break-all">{log.data}</span>

                <button
                  onClick={() => handleCopySingle(log, i)}
                  className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-zinc-800 rounded shrink-0 self-center"
                  title="Copiar log estruturado para a AI"
                >
                  {copiedId === i ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-zinc-400" />
                  )}
                </button>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
