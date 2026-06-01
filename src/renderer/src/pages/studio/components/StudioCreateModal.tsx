import React, { useState, useEffect } from 'react'
import { FolderPlus, Loader2 } from 'lucide-react'
import ModalShell, { ModalHeader, ModalFooter, FieldLabel } from '../../../components/layout/ModalShell'

function slugify(text: string) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

const COLORS = [
  { value: '#3b82f6', label: 'Azul' },
  { value: '#8b5cf6', label: 'Roxo' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#10b981', label: 'Esmeralda' },
  { value: '#f59e0b', label: 'Âmbar' },
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#06b6d4', label: 'Ciano' },
]

interface StudioCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (details: { name: string; description: string; color: string; path: string }) => Promise<void>
  creating: boolean
  workspacePath: string
}

export default function StudioCreateModal({ isOpen, onClose, onCreate, creating, workspacePath }: StudioCreateModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('#3b82f6')
  const [projectPath, setProjectPath] = useState('')

  const hasWorkspace = !!workspacePath

  useEffect(() => {
    if (hasWorkspace) {
      const slug = slugify(name)
      // Adiciona sufixo -studio para organizar as pastas
      setProjectPath(name && slug ? `${workspacePath}/${slug}-studio` : '')
    }
  }, [name, workspacePath, hasWorkspace])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !projectPath) return
    await onCreate({ name, description, color, path: projectPath })
    setName('')
    setDescription('')
    setColor('#3b82f6')
    setProjectPath('')
  }

  if (!isOpen) return null

  return (
    <ModalShell onClose={onClose} accentColor={color}>
      <ModalHeader
        icon={<FolderPlus className="w-4 h-4 text-blue-400" />}
        title="Criar Estúdio de Design"
        subtitle="Configure um novo estúdio para prototipação e IA de Design"
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
        {/* Name */}
        <div className="space-y-1.5">
          <FieldLabel>Nome do Estúdio *</FieldLabel>
          <input
            required
            autoFocus
            placeholder="Ex: Tema Moderno Nika"
            value={name}
            onChange={e => setName(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <FieldLabel>Descrição / Objetivo do Design</FieldLabel>
          <textarea
            placeholder="Ex: Um design dark-mode com cantos super arredondados e tons de roxo neon."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="input-field resize-none"
          />
        </div>


        {/* Color */}
        <div className="space-y-2">
          <FieldLabel>Cor de Destaque</FieldLabel>
          <div className="flex items-center gap-2.5 flex-wrap">
            {COLORS.map(col => (
              <button
                key={col.value}
                type="button"
                onClick={() => setColor(col.value)}
                title={col.label}
                className={`w-7 h-7 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${
                  color === col.value ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105 opacity-70 hover:opacity-100'
                }`}
                style={{ backgroundColor: col.value }}
              >
                {color === col.value && <span className="w-2 h-2 rounded-full bg-white/80" />}
              </button>
            ))}
            <div
              className="relative w-7 h-7 rounded-full overflow-hidden border cursor-pointer hover:scale-105 transition"
              style={{ borderColor: 'var(--line)' }}
            >
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer scale-150"
              />
              <div className="w-full h-full" style={{ backgroundColor: color }} />
            </div>
            <span className="text-[11px] font-mono tx-faint">{color.toUpperCase()}</span>
          </div>
        </div>
      </form>

      <ModalFooter>
        <button type="button" onClick={onClose} className="btn-ghost px-4 py-2">
          Cancelar
        </button>
        <button
          onClick={handleSubmit as any}
          disabled={creating || !projectPath || !name}
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold disabled:opacity-40 flex items-center gap-2"
        >
          {creating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Criando...
            </>
          ) : (
            'Confirmar e Criar'
          )}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
