import { useState } from 'react'
import { Task, ColumnMeta, COLUMNS } from './types'
import TaskCard from './TaskCard'

interface KanbanColumnProps {
  meta: ColumnMeta
  tasks: Task[]
  onAddTask: (column: ColumnMeta) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onReviewTask: (task: Task) => void
  onMoveTask: (task: Task, direction: 'left' | 'right') => void
  onDropTask: (taskId: number, toColumn: string) => void
  onCardClick?: (task: Task) => void
}

export default function KanbanColumn({
  meta, tasks, onAddTask, onEditTask, onDeleteTask, onReviewTask, onMoveTask, onDropTask, onCardClick
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const colIndex = COLUMNS.findIndex(c => c.id === meta.id)
  const isFirst  = colIndex === 0
  const isLast   = colIndex === COLUMNS.length - 1

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const taskId     = Number(e.dataTransfer.getData('taskId'))
    const fromColumn = e.dataTransfer.getData('fromColumn')
    if (!taskId || fromColumn === meta.id) return
    onDropTask(taskId, meta.id)
  }

  return (
    <div className="flex flex-col min-w-0 h-full">
      {/* Column header */}
      <div className={`flex items-center justify-between px-3 h-[38px] mb-3
        rounded-xl bg-gradient-to-b ${meta.bg} border ${meta.border}`}
      >
        <div className="flex items-center gap-2">
          <i className={`${meta.icon} ${meta.color} text-sm`} />
          <span className={`text-xs font-bold ${meta.color}`}>{meta.label}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold tx-muted"
            style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)' }}
          >
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* AI access badge */}
          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md border
            ${meta.aiAccess
              ? 'text-amber-400 border-amber-500/25 bg-amber-500/10'
              : 'tx-faint border-transparent'
            }`}
          >
            {meta.aiAccess ? <><i className="ri-robot-line" /> IA</> : <i className="ri-lock-line" />}
          </span>

          {/* Add task button */}
          {meta.canCreate && (
            <button
              onClick={() => onAddTask(meta)}
              className={`p-1 rounded-lg transition btn-ghost hover:${meta.color}`}
              title={`Adicionar tarefa em ${meta.label}`}
            >
              <i className="ri-add-line text-sm" />
            </button>
          )}
        </div>
      </div>

      {/* Tasks list container with border/background to ensure same visual height */}
      <div
        className={`flex-1 flex flex-col p-2 space-y-2 overflow-y-auto min-h-0 rounded-xl transition-all border border-dashed
          ${isDragOver ? 'ring-2 ring-inset ring-blue-500/40 bg-blue-500/5' : ''}
        `}
        style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.01)', 
          borderColor: 'var(--line-subtle)' 
        }}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        {tasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-8 gap-2">
            <i className={`${meta.icon} text-2xl ${meta.color} opacity-20`} />
            <p className="text-[10px] tx-faint text-center">
            {meta.id === 'ideas'     && 'Registre suas ideias aqui'}
              {meta.id === 'pending'   && 'Nenhuma tarefa pendente'}
              {meta.id === 'executing' && 'Nenhuma tarefa em execução'}
              {meta.id === 'review'   && 'Nenhuma tarefa para revisar'}
              {meta.id === 'archived' && 'Nenhuma tarefa arquivada'}
            </p>
            {meta.canCreate && (
              <button
                onClick={() => onAddTask(meta)}
                className={`text-[10px] font-semibold ${meta.color} opacity-50 hover:opacity-100 transition`}
              >
                + Adicionar
              </button>
            )}
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              column={meta}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onReview={onReviewTask}
              onMove={onMoveTask}
              onCardClick={onCardClick}
              isFirst={isFirst}
              isLast={isLast}
            />
          ))
        )}
      </div>
    </div>
  )
}
