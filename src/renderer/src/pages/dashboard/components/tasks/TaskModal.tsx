import { useState, useEffect } from 'react'
import { PlusCircle, Pencil } from 'lucide-react'
import { Task } from './types'
import ModalShell, { ModalHeader, FieldLabel } from '../../../../components/layout/ModalShell'

interface TaskModalProps {
  task?: Task | null           // null = create mode
  defaultColumn?: string
  onSave: (title: string, description: string) => void
  onClose: () => void
}

export default function TaskModal({ task, defaultColumn, onSave, onClose }: TaskModalProps) {
  const [title, setTitle]             = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const isEdit = !!task

  useEffect(() => {
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
  }, [task])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) return
    onSave(title.trim(), description.trim())
    onClose()
  }

  const columnLabel: Record<string, string> = {
    ideas: 'Ideias', pending: 'Pendentes', executing: 'Executando', review: 'Revisão', archived: 'Arquivadas'
  }

  return (
    <ModalShell onClose={onClose} width="max-w-md">
      <ModalHeader
        icon={isEdit ? <Pencil className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
        title={isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}
        subtitle={!isEdit && defaultColumn ? `Coluna: ${columnLabel[defaultColumn] ?? defaultColumn}` : undefined}
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
        <div className="space-y-1.5">
          <FieldLabel>Título *</FieldLabel>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: Criar tela de login"
            className="input-field"
          />
        </div>

        <div className="space-y-1.5">
          <FieldLabel>Descrição *</FieldLabel>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Detalhe o que precisa ser feito, critérios de aceitação, etc."
            rows={5}
            className="input-field resize-none font-mono text-[12px] leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost px-4 py-2 text-xs"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={!title.trim() || !description.trim()}
            className="btn-primary px-5 py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isEdit ? 'Salvar alterações' : 'Criar tarefa'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
