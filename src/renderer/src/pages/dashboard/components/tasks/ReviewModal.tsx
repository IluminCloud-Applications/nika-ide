import { useState } from 'react'
import { Eye } from 'lucide-react'
import { Task } from './types'
import ModalShell, { ModalHeader, FieldLabel } from '../../../../components/layout/ModalShell'

interface ReviewModalProps {
  task: Task
  onApprove: (task: Task) => void
  onReject: (task: Task, reason: string) => void
  onClose: () => void
}

export default function ReviewModal({ task, onApprove, onReject, onClose }: ReviewModalProps) {
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason]       = useState('')

  const handleApprove = () => {
    onApprove(task)
    onClose()
  }

  const handleReject = () => {
    if (!reason.trim()) return
    onReject(task, reason.trim())
    onClose()
  }

  return (
    <ModalShell onClose={onClose} width="max-w-md">
      <ModalHeader
        icon={<Eye className="w-4 h-4 text-accent" />}
        title="Revisar Tarefa"
        subtitle="Analise a implementação feita pela IA"
        onClose={onClose}
      />

      <div className="p-6 space-y-4">
        {/* Task info */}
        <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)' }}>
          <p className="text-xs font-semibold tx-secondary">{task.title}</p>
          {task.description && (
            <p className="text-[11px] tx-muted leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          )}
        </div>

        {/* AI Notes */}
        <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 p-4">
          <p className="text-[11px] font-semibold text-blue-400 mb-1.5 flex items-center gap-1.5">
            <i className="ri-robot-line" /> O que a IA implementou:
          </p>
          {task.ai_notes ? (
            <p className="text-[11px] text-blue-300 leading-relaxed whitespace-pre-wrap">
              {task.ai_notes}
            </p>
          ) : (
            <p className="text-[11px] text-blue-300/60 italic leading-relaxed">
              Nenhuma observação foi enviada pela IA para esta tarefa.
            </p>
          )}
        </div>

        {/* Rejection form */}
        {rejecting && (
          <div className="space-y-2.5 animate-fade-in pt-2">
            <FieldLabel>Motivo da rejeição *</FieldLabel>
            <textarea
              autoFocus
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Descreva o que não funcionou, o que precisa ser corrigido..."
              rows={4}
              className="input-field resize-none font-mono text-[11px] leading-relaxed"
              style={{ borderColor: 'rgba(239,68,68,0.3)' }}
            />
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setRejecting(false)}
                className="btn-surface flex-1 py-2 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleReject}
                disabled={!reason.trim()}
                className="flex-1 py-2 text-xs font-semibold bg-red-650 text-red-100 border border-red-500/30 hover:bg-red-600 transition disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center gap-1"
              >
                <i className="ri-close-circle-line" />
                Confirmar Rejeição
              </button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        {!rejecting && (
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setRejecting(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold
                bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 transition"
            >
              <i className="ri-thumb-down-line text-sm" />
              Rejeitar
            </button>
            <button
              onClick={handleApprove}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold
                bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 transition"
            >
              <i className="ri-thumb-up-line text-sm" />
              Aprovar
            </button>
          </div>
        )}
      </div>
    </ModalShell>
  )
}
