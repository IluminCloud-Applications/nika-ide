import { useEffect } from 'react'
import { X } from 'lucide-react'
import EnvPanel from './env'

interface EnvDrawerProps {
  isOpen: boolean
  onClose: () => void
  projectPath: string
}

export default function EnvDrawer({ isOpen, onClose, projectPath }: EnvDrawerProps) {
  // Fecha com Escape
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  return (
    <div
      className={`absolute right-0 top-0 bottom-0 z-40 flex flex-col transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'w-0 opacity-0 overflow-hidden pointer-events-none'
      }`}
      style={{
        width: isOpen ? '480px' : '0',
        borderLeft: isOpen ? '1px solid var(--line)' : 'none',
        backgroundColor: 'var(--surface-sidebar)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        <div className="flex items-center gap-2">
          <i className="ri-lock-line text-xs text-blue-400" />
          <span className="text-[11px] font-semibold tx-secondary">Variáveis de Ambiente</span>
        </div>
        <button onClick={onClose} className="editor-icon-btn border-transparent" title="Fechar">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Env Panel (já tem tabs backend/frontend internamente) */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {isOpen && <EnvPanel projectPath={projectPath} />}
      </div>
    </div>
  )
}
