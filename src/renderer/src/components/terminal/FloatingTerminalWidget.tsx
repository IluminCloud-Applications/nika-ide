import { Terminal } from 'lucide-react'
import { useTerminalContext } from '../../context/TerminalContext'

export default function FloatingTerminalWidget() {
  const { activeSessions, drawerVisible, setDrawerVisible } = useTerminalContext()

  // Se não há sessões ativas globais ou se a drawer de terminal já estiver aberta, oculta o widget
  if (activeSessions.length === 0 || drawerVisible) return null

  return (
    <button
      onClick={() => setDrawerVisible(true)}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-[999] flex items-center justify-center py-4 px-2 rounded-l-xl border-l border-y bg-[var(--surface-overlay)] text-emerald-400 hover:text-emerald-300 shadow-xl transition-all duration-200 hover:bg-[var(--surface-raised)] hover:pl-3 cursor-pointer pointer-events-auto"
      style={{ borderColor: 'var(--line)' }}
      title="Abrir Painel de Terminais"
    >
      <div className="relative flex items-center justify-center">
        <Terminal className="w-4 h-4" />
        {activeSessions.some((s) => s.connected) && (
          <span className="absolute -top-1.5 -right-1 flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
        )}
      </div>
    </button>
  )
}
