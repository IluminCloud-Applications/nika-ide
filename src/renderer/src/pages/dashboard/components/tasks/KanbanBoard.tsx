import { useState, useCallback, useEffect, useRef } from 'react'
import { Task, TaskColumn, COLUMNS, ColumnMeta } from './types'
import KanbanColumn from './KanbanColumn'
import TaskModal from './TaskModal'
import ReviewModal from './ReviewModal'
import ModalShell from '../../../../components/layout/ModalShell'

interface KanbanBoardProps {
  projectPath: string
}

export default function KanbanBoard({ projectPath }: KanbanBoardProps) {
  const [tasks, setTasks]           = useState<Task[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  // Modal states
  const [createColumn, setCreateColumn] = useState<ColumnMeta | null>(null)
  const [editTask, setEditTask]         = useState<Task | null>(null)
  const [reviewTask, setReviewTask]     = useState<Task | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Task | null>(null)

  const loadTasks = useCallback(async () => {
    if (!window.api?.tasks) return
    try {
      setError(null)
      const all = await window.api.tasks.list(projectPath)
      setTasks(all)
    } catch (e: any) {
      setError(e.message ?? 'Erro ao carregar tarefas')
    } finally {
      setLoading(false)
    }
  }, [projectPath])

  useEffect(() => { loadTasks() }, [loadTasks])

  // Silent 5s polling — pauses while any modal is open
  const modalOpen = !!(createColumn || editTask || reviewTask || deleteConfirm)
  const modalOpenRef = useRef(modalOpen)
  useEffect(() => { modalOpenRef.current = modalOpen }, [modalOpen])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!modalOpenRef.current) loadTasks()
    }, 5000)
    return () => clearInterval(interval)
  }, [loadTasks])

  const tasksFor = (col: TaskColumn) =>
    tasks.filter(t => t.column === col).sort((a, b) => a.id - b.id)

  const handleCreate = async (title: string, description: string) => {
    if (!createColumn) return
    try {
      await window.api.tasks.create(projectPath, title, description, createColumn.id)
      await loadTasks()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleEdit = async (title: string, description: string) => {
    if (!editTask) return
    try {
      await window.api.tasks.update(projectPath, editTask.id, title, description)
      await loadTasks()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleMove = async (task: Task, direction: 'left' | 'right') => {
    const colIndex = COLUMNS.findIndex(c => c.id === task.column)
    const next     = direction === 'left' ? COLUMNS[colIndex - 1] : COLUMNS[colIndex + 1]
    if (!next) return
    // Prevent moving to review manually (only AI does this via MCP)
    if (next.id === 'review' && task.column !== 'executing') return
    // Prevent moving to executing manually (only AI does this)
    if (next.id === 'executing') return
    try {
      await window.api.tasks.move(projectPath, task.id, next.id)
      await loadTasks()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleDelete = async (task: Task) => {
    try {
      await window.api.tasks.delete(projectPath, task.id)
      setDeleteConfirm(null)
      await loadTasks()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleApprove = async (task: Task) => {
    try {
      await window.api.tasks.approve(projectPath, task.id)
      await loadTasks()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleReject = async (task: Task, reason: string) => {
    try {
      await window.api.tasks.reject(projectPath, task.id, reason)
      await loadTasks()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleDrop = async (taskId: number, toColumn: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (!task || task.column === toColumn) return
    try {
      await window.api.tasks.move(projectPath, taskId, toColumn as any)
      await loadTasks()
    } catch (e: any) {
      setError(e.message)
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
          <p className="text-xs tx-faint">Carregando tarefas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: 'var(--surface-base)' }}>
      {/* Board header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="flex items-center gap-2">
          <i className="ri-kanban-view tx-muted text-sm" />
          <span className="text-xs font-semibold tx-secondary">Kanban do Projeto</span>
          <span className="text-[10px] tx-faint">— {tasks.length} tarefa{tasks.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] tx-faint">
          <i className="ri-robot-line text-amber-500/60" />
          <span>IA acessa <strong className="text-orange-400">Pendentes</strong> e move para <strong className="text-orange-400">Executando</strong> via MCP <code className="tx-faint font-mono">tarefas</code></span>
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 text-xs text-red-400 flex items-center gap-2">
          <i className="ri-error-warning-line" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto">
            <i className="ri-close-line" />
          </button>
        </div>
      )}

      {/* Columns grid */}
      <div className="flex-1 grid grid-cols-5 gap-3 p-4 overflow-hidden min-h-0">
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            meta={col}
            tasks={tasksFor(col.id)}
            onAddTask={setCreateColumn}
            onEditTask={setEditTask}
            onDeleteTask={setDeleteConfirm}
            onReviewTask={setReviewTask}
            onMoveTask={handleMove}
            onDropTask={handleDrop}
            onCardClick={(task) => {
              if (task.column === 'review') setReviewTask(task)
            }}
          />
        ))}
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <ModalShell onClose={() => setDeleteConfirm(null)} width="max-w-sm">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-1">
              <i className="ri-delete-bin-line text-red-450 text-base" />
              <h3 className="text-sm font-bold tx-primary">Excluir tarefa?</h3>
            </div>
            <p className="text-xs tx-muted leading-relaxed">
              A tarefa <strong className="tx-secondary">"{deleteConfirm.title}"</strong> será removida permanentemente.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-surface flex-1 py-2 rounded-lg text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold bg-red-650 text-red-100 border border-red-500/30 hover:bg-red-600 transition"
              >
                Excluir
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {/* Create Modal */}
      {createColumn && (
        <TaskModal
          defaultColumn={createColumn.id}
          onSave={handleCreate}
          onClose={() => setCreateColumn(null)}
        />
      )}

      {/* Edit Modal */}
      {editTask && (
        <TaskModal
          task={editTask}
          onSave={handleEdit}
          onClose={() => setEditTask(null)}
        />
      )}

      {/* Review Modal */}
      {reviewTask && (
        <ReviewModal
          task={reviewTask}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setReviewTask(null)}
        />
      )}
    </div>
  )
}
