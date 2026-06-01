import { useState } from 'react'
import { Task, ColumnMeta } from './types'

interface TaskCardProps {
  task: Task
  column: ColumnMeta
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
  onReview: (task: Task) => void
  onMove: (task: Task, direction: 'left' | 'right') => void
  onCardClick?: (task: Task) => void
  isFirst: boolean
  isLast: boolean
}

export default function TaskCard({
  task, column, onEdit, onDelete, onReview, onMove, onCardClick, isFirst, isLast
}: TaskCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [dragging, setDragging]  = useState(false)

  const hasRejection = !!task.rejection_reason
  const hasAiNotes   = !!task.ai_notes
  const isExecuting  = column.id === 'executing'
  const isReview     = column.id === 'review'
  const date = new Date(task.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

  const handleCardClick = () => {
    if (onCardClick) onCardClick(task)
    else setExpanded(e => !e)
  }

  return (
    <div
      draggable
      onDragStart={e => {
        setDragging(true)
        e.dataTransfer.setData('taskId', String(task.id))
        e.dataTransfer.setData('fromColumn', task.column)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onDragEnd={() => setDragging(false)}
      className={`group relative rounded-xl border
        transition-all duration-200
        ${column.border}
        ${hasRejection ? 'border-l-2 border-l-red-500' : ''}
        ${isExecuting ? 'border-l-2 border-l-orange-400' : ''}
        ${dragging ? 'opacity-40 scale-95' : ''}
        ${isReview ? 'cursor-pointer' : ''}
      `}
      style={{ backgroundColor: 'var(--surface-overlay)', cursor: isReview ? 'pointer' : 'grab' }}
      onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-raised)'}
      onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-overlay)'}
      onClick={isReview ? handleCardClick : undefined}
    >
      {/* Executing pulse indicator */}
      {isExecuting && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
          </span>
        </div>
      )}

      {/* Header */}
      <div className="p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={() => !isReview && setExpanded(e => !e)}
            className="flex-1 text-left"
          >
            <p className="text-xs font-semibold tx-secondary leading-snug line-clamp-2 group-hover:tx-primary transition">
              {task.title}
            </p>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
            {column.id !== 'review' && column.id !== 'archived' && column.id !== 'executing' && (
              <button
                onClick={() => onEdit(task)}
                className="btn-ghost p-1 rounded"
                title="Editar"
              >
                <i className="ri-pencil-line text-[11px]" />
              </button>
            )}
            {isReview && (
              <button
                onClick={e => { e.stopPropagation(); onReview(task) }}
                className="flex items-center justify-center p-1 rounded hover:bg-blue-500/20 tx-muted hover:text-blue-400 transition"
                title="Revisar"
                style={{ lineHeight: 1 }}
              >
                <i className="ri-eye-line leading-none text-[11px]" />
              </button>
            )}
            <button
              onClick={e => { e.stopPropagation(); onDelete(task) }}
              className="btn-ghost p-1 rounded hover:bg-red-500/20 hover:text-red-400"
              title="Excluir"
            >
              <i className="ri-delete-bin-line text-[11px]" />
            </button>
          </div>
        </div>

        {/* Rejection badge */}
        {hasRejection && (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-red-400 font-medium">
            <i className="ri-error-warning-line" />
            <span className="truncate">Rejeitada</span>
          </div>
        )}

        {/* Executing badge */}
        {isExecuting && (
          <div className="mt-1.5 flex items-center gap-1 text-[10px] text-orange-400 font-medium">
            <i className="ri-robot-line" />
            <span>IA trabalhando...</span>
          </div>
        )}
      </div>

      {/* Expanded body (non-review cards) */}
      {expanded && !isReview && (
        <div className="px-3 pb-3 space-y-2 animate-fade-in">
          {task.description && (
            <p className="text-[11px] tx-muted leading-relaxed whitespace-pre-wrap">
              {task.description}
            </p>
          )}
          {hasRejection && (
            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-2">
              <p className="text-[10px] text-red-400 font-semibold mb-0.5">Motivo da rejeição:</p>
              <p className="text-[10px] text-red-300 leading-relaxed">{task.rejection_reason}</p>
            </div>
          )}
          {hasAiNotes && (
            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-2">
              <p className="text-[10px] text-blue-400 font-semibold mb-0.5 flex items-center gap-1">
                <i className="ri-robot-line" /> Notas da IA:
              </p>
              <p className="text-[10px] text-blue-300 leading-relaxed">{task.ai_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Review CTA (always visible for review column) */}
      {isReview && (
        <div className="px-3 pb-3">
          <div
            className="flex items-center gap-1.5 text-[10px] text-blue-400 font-medium mt-1
              hover:text-blue-300 transition"
            onClick={handleCardClick}
          >
            <i className="ri-eye-line leading-none" />
            <span>Clique para revisar</span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-3 pb-2.5 flex items-center justify-between gap-1">
        <span className="text-[10px] tx-faint font-mono">#{task.id} · {date}</span>

        {/* Move arrows */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition">
          {!isFirst && !isExecuting && (
            <button
              onClick={e => { e.stopPropagation(); onMove(task, 'left') }}
              className="btn-ghost p-0.5 rounded"
              title="Mover para coluna anterior"
            >
              <i className="ri-arrow-left-s-line text-xs" />
            </button>
          )}
          {!isLast && !isExecuting && (
            <button
              onClick={e => { e.stopPropagation(); onMove(task, 'right') }}
              className="btn-ghost p-0.5 rounded"
              title="Mover para próxima coluna"
            >
              <i className="ri-arrow-right-s-line text-xs" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
