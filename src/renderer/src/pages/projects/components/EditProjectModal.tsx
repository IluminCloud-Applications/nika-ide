import React, { useState, useEffect } from 'react'
import { Loader2, ImagePlus, X, Check, Pencil } from 'lucide-react'
import { Project } from '../../../App'
import ModalShell, { ModalHeader, ModalFooter, FieldLabel } from '../../../components/layout/ModalShell'

const COLORS = [
  { value: '#3b82f6', label: 'Azul' },
  { value: '#8b5cf6', label: 'Roxo' },
  { value: '#ec4899', label: 'Rosa' },
  { value: '#10b981', label: 'Esmeralda' },
  { value: '#f59e0b', label: 'Âmbar' },
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#06b6d4', label: 'Ciano' },
]

interface EditProjectModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onSave: (updates: Partial<Project>) => Promise<void>
  saving: boolean
}

export default function EditProjectModal({ project, isOpen, onClose, onSave, saving }: EditProjectModalProps) {
  const [name, setName]               = useState(project.name)
  const [description, setDescription] = useState(project.description)
  const [color, setColor]             = useState(project.color)
  const [imagePath, setImagePath]     = useState<string | undefined>(project.imagePath)
  const [imgSrc, setImgSrc]           = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) { setName(project.name); setDescription(project.description); setColor(project.color); setImagePath(project.imagePath) }
  }, [isOpen, project])

  useEffect(() => {
    if (!imagePath) { setImgSrc(null); return }
    window.api.fs.readImage(imagePath).then(src => setImgSrc(src)).catch(() => setImgSrc(null))
  }, [imagePath])

  const handleSelectImage = async () => {
    const selected = await window.api.projects.selectImage()
    if (selected) setImagePath(selected)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await onSave({ name: name.trim(), description, color, imagePath })
  }

  if (!isOpen) return null

  return (
    <ModalShell onClose={onClose} accentColor={color}>
      <ModalHeader
        icon={<Pencil className="w-4 h-4 tx-muted" />}
        title="Editar Projeto"
        subtitle={project.name}
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
        {/* Avatar + Name */}
        <div className="flex items-start gap-4">
          <button type="button" onClick={handleSelectImage} title="Alterar imagem"
            className="shrink-0 w-[72px] h-[72px] rounded-xl border-2 border-dashed transition flex flex-col items-center justify-center overflow-hidden group relative"
            style={{ borderColor: 'var(--line)', backgroundColor: 'var(--surface-overlay)' }}
          >
            {imgSrc ? (
              <>
                <img src={imgSrc} alt="icon" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <ImagePlus className="w-4 h-4 text-white" />
                </div>
              </>
            ) : (
              <>
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: color + '22', color }}>
                  {name.trim().charAt(0).toUpperCase() || '?'}
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <ImagePlus className="w-4 h-4 text-white" />
                </div>
              </>
            )}
          </button>

          <div className="flex-1 space-y-1.5">
            <FieldLabel>Nome *</FieldLabel>
            <input required value={name} onChange={e => setName(e.target.value)}
              className="input-field font-medium" placeholder="Nome do projeto" />
            {imagePath && (
              <button type="button" onClick={() => setImagePath(undefined)}
                className="text-[10px] tx-faint hover:text-red-400 transition flex items-center gap-1"
              >
                <X className="w-2.5 h-2.5" /> Remover imagem
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <FieldLabel>Descrição <span className="normal-case font-normal tx-faint">(opcional)</span></FieldLabel>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Uma breve descrição do projeto" rows={3}
            className="input-field resize-none leading-relaxed"
          />
        </div>

        {/* Color */}
        <div className="space-y-2">
          <FieldLabel>Cor de destaque</FieldLabel>
          <div className="flex items-center gap-2.5 flex-wrap">
            {COLORS.map(col => (
              <button key={col.value} type="button" onClick={() => setColor(col.value)} title={col.label}
                className={`w-7 h-7 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${color === col.value ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105 opacity-70 hover:opacity-100'}`}
                style={{ backgroundColor: col.value }}
              >
                {color === col.value && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </button>
            ))}
            <div className="relative w-7 h-7 rounded-full overflow-hidden border cursor-pointer hover:scale-105 transition" style={{ borderColor: 'var(--line)' }}>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer scale-150 w-full h-full" />
              <div className="w-full h-full" style={{ backgroundColor: color }} />
            </div>
            <span className="text-[11px] font-mono tx-faint">{color.toUpperCase()}</span>
          </div>
        </div>

        {/* Path (read-only) */}
        <div className="space-y-1.5">
          <FieldLabel>Caminho</FieldLabel>
          <div className="input-field font-mono text-xs tx-muted truncate select-text cursor-default">
            {project.path}
          </div>
          <p className="text-[10px] tx-faint">O caminho não pode ser alterado após a criação.</p>
        </div>
      </form>

      <ModalFooter>
        <button type="button" onClick={onClose} className="btn-ghost px-4 py-2">Cancelar</button>
        <button
          onClick={handleSubmit as any}
          disabled={saving || !name.trim()}
          className="btn flex items-center gap-2 px-5 py-2 text-white font-semibold rounded-lg disabled:opacity-40 transition"
          style={{ backgroundColor: color }}
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Check className="w-4 h-4" /> Salvar alterações</>}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
