import { useState, useEffect, useRef, useSyncExternalStore } from 'react'
import { Copy, Check, ArrowDownUp, Trash2 } from 'lucide-react'
import { devtoolsLogs, NetworkLog } from '../stores/devtoolsLogs'

function getCleanPath(urlStr: string): string {
  try {
    // Works for both full URLs and paths
    const url = new URL(urlStr, window.location.origin)
    return url.pathname + url.search
  } catch {
    return urlStr
  }
}

export default function NetworkLogsTab() {
  const logs = useSyncExternalStore(devtoolsLogs.subscribeNetwork, devtoolsLogs.getNetwork)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const formatPayload = (payload: string | null) => {
    if (!payload) return 'Nenhum'
    try {
      return JSON.stringify(JSON.parse(payload), null, 2)
    } catch {
      return payload
    }
  }

  const formatResponse = (response: string) => {
    if (!response) return 'Nenhuma'
    try {
      return JSON.stringify(JSON.parse(response), null, 2)
    } catch {
      return response.substring(0, 1000) // Truncate if extremely long HTML
    }
  }

  const handleCopyRequest = (log: NetworkLog, index: number) => {
    const endpoint = getCleanPath(log.url)
    
    const formatted = `[Requisição HTTP]
Endpoint: ${log.method} ${endpoint}
Status: ${log.status} ${log.statusText}
Duração: ${log.duration}ms

Payload Enviado:
\`\`\`json
${formatPayload(log.payload)}
\`\`\`

Resposta do Servidor:
\`\`\`json
${formatResponse(log.response)}
\`\`\``

    navigator.clipboard.writeText(formatted).then(() => {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    })
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Sub-toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800 bg-zinc-900/50">
        <span className="text-[9px] font-semibold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
          <ArrowDownUp className="w-3 h-3" /> Requisições de Rede ({logs.length})
        </span>

        <button
          onClick={() => devtoolsLogs.clearNetwork()}
          className="btn-ghost p-1 rounded hover:text-zinc-100"
          title="Limpar Rede"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Network log items */}
      <div className="flex-1 overflow-y-auto font-mono text-[11px] leading-relaxed divide-y divide-zinc-800">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-zinc-500 gap-1.5">
            <ArrowDownUp className="w-5 h-5 text-zinc-600" />
            <span className="text-[10px]">Aguardando requisições do preview...</span>
          </div>
        ) : (
          logs.map((log, i) => {
            const isError = log.status === 0 || log.status >= 400
            const cleanPath = getCleanPath(log.url)
            
            return (
              <div 
                key={i} 
                className={`group flex items-center gap-3 px-3 py-2 transition-colors hover:bg-zinc-800/20 ${
                  isError ? 'bg-red-950/5' : ''
                }`}
              >
                {/* Method tag */}
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase w-12 text-center shrink-0 ${
                  log.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  log.method === 'POST' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  'bg-zinc-700/20 text-zinc-300 border border-zinc-600/20'
                }`}>
                  {log.method}
                </span>

                {/* Status code */}
                <span className={`text-[10px] font-semibold w-10 shrink-0 ${
                  isError ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {log.status === 0 ? 'FAIL' : log.status}
                </span>

                {/* Path */}
                <span className="flex-1 text-zinc-300 truncate" title={log.url}>
                  {cleanPath}
                </span>

                {/* Duration */}
                <span className="text-zinc-500 text-[10px] shrink-0">
                  {log.duration}ms
                </span>

                {/* Copy button */}
                <button
                  onClick={() => handleCopyRequest(log, i)}
                  className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-750 text-[10px] text-zinc-300 hover:text-zinc-100 shrink-0 ml-2"
                  title="Copiar Endpoint, Payload e Response estruturado para a AI"
                >
                  {copiedIndex === i ? (
                    <><Check className="w-3 h-3 text-emerald-400" /> Copiado</>
                  ) : (
                    <><Copy className="w-3 h-3" /> Copiar AI</>
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
