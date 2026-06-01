import { useState } from 'react'
import { Archive, AlertTriangle, Loader2 } from 'lucide-react'
import { Project } from '../../../App'
import ModalShell from '../../../components/layout/ModalShell'

interface ArchiveProjectModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onArchive: () => Promise<void>
}

export default function ArchiveProjectModal({ project, isOpen, onClose, onArchive }: ArchiveProjectModalProps) {
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setLoading(true)
    try { await onArchive(); onClose() }
    finally { setLoading(false) }
  }

  const destino = `${project.path.split('/').slice(0, -1).join('/')}/.trash/${project.path.split('/').pop()}`

  return (
    <ModalShell onClose={onClose} width="max-w-md" noCloseOnBackdrop={loading}>
      {/* Icon + header centered */}
      <div className="flex flex-col items-center px-8 pt-8 pb-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
          <Archive className="w-7 h-7 text-amber-400" />
        </div>
        <h2 className="text-base font-bold tx-primary">Arquivar projeto?</h2>
        <p className="text-sm tx-muted mt-2 leading-relaxed">
          O projeto <span className="tx-secondary font-medium">"{project.name}"</span> será movido para{' '}
          <code className="text-[11px] px-1.5 py-0.5 rounded font-mono"
            style={{ backgroundColor: 'var(--surface-overlay)', color: 'var(--tx-secondary)' }}>
            .trash
          </code>{' '}
          na pasta workspace.
        </p>
      </div>

      {/* Info box */}
      <div className="mx-6 mb-5 flex items-start gap-2.5 rounded-xl px-3.5 py-3 bg-amber-500/5 border border-amber-500/15">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-400/80 leading-relaxed">
          O projeto pode ser recuperado movendo a pasta de volta do{' '}
          <code className="font-mono text-amber-400/90">.trash</code>. Nenhum arquivo é apagado permanentemente.
        </p>
      </div>

      {/* Path preview */}
      <div className="mx-6 mb-6 space-y-1.5">
        <p className="text-[10px] tx-faint uppercase tracking-wider font-semibold">Destino</p>
        <p className="text-[11px] font-mono tx-muted rounded-lg px-3 py-2 truncate"
          style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)' }}
        >
          {destino}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 px-6 pb-6">
        <button onClick={onClose} disabled={loading}
          className="flex-1 btn-surface py-2.5 rounded-xl disabled:opacity-50"
        >
          Cancelar
        </button>
        <button onClick={handleConfirm} disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-amber-900 bg-amber-400 hover:bg-amber-300 transition shadow-lg shadow-amber-500/20 disabled:opacity-70"
        >
          {loading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Arquivando...</>
            : <><Archive className="w-3.5 h-3.5" /> Arquivar</>}
        </button>
      </div>
    </ModalShell>
  )
}
