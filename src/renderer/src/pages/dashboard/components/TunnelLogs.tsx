import { RefreshCw } from 'lucide-react'

interface TunnelLogsProps {
  logs: string
  onRefresh: () => void
}

export default function TunnelLogs({ logs, onRefresh }: TunnelLogsProps) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--line-subtle)' }}>
      <div
        className="flex items-center justify-between px-3 py-2"
        style={{ backgroundColor: 'var(--surface-overlay)', borderBottom: '1px solid var(--line-subtle)' }}
      >
        <span className="text-[10px] font-mono tx-muted uppercase tracking-wider">cloudflared logs</span>
        <button onClick={onRefresh} className="btn-ghost p-0.5" title="Atualizar logs">
          <RefreshCw className="w-3 h-3" />
        </button>
      </div>
      <pre
        className="text-[10px] font-mono tx-faint p-3 max-h-40 overflow-y-auto whitespace-pre-wrap leading-relaxed"
        style={{ backgroundColor: 'var(--surface-base)' }}
      >
        {logs || 'Sem logs disponíveis.'}
      </pre>
    </div>
  )
}
