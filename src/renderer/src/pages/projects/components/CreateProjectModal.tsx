import React, { useState, useEffect } from 'react'
import { FolderPlus, Loader2, ImagePlus, X } from 'lucide-react'
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

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (details: { name: string; description: string; color: string; path: string; imagePath?: string }) => Promise<void>
  creating: boolean
  workspacePath: string
}

export default function CreateProjectModal({ isOpen, onClose, onCreate, creating, workspacePath }: CreateProjectModalProps) {
  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor]             = useState('#3b82f6')
  const [projectPath, setProjectPath] = useState('')
  const [imagePath, setImagePath]     = useState<string | undefined>()
  const [imgSrc, setImgSrc]           = useState<string | null>(null)

  const hasWorkspace = !!workspacePath

  useEffect(() => {
    if (!imagePath) { setImgSrc(null); return }
    window.api.fs.readImage(imagePath).then(src => setImgSrc(src)).catch(() => setImgSrc(null))
  }, [imagePath])

  useEffect(() => {
    if (hasWorkspace) {
      const slug = slugify(name)
      setProjectPath(name && slug ? `${workspacePath}/${slug}` : '')
    }
  }, [name, workspacePath, hasWorkspace])

  const handleSelectImage = async () => {
    try {
      const selected = await window.api.projects.selectImage()
      if (selected) setImagePath(selected)
    } catch (err) { console.error('Erro ao selecionar imagem:', err) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !projectPath) return
    await onCreate({ name, description, color, path: projectPath, imagePath })
    setName(''); setDescription(''); setColor('#3b82f6')
    setProjectPath(''); setImagePath(undefined); setImgSrc(null)
  }

  if (!isOpen) return null

  return (
    <ModalShell onClose={onClose} accentColor={color}>
      <ModalHeader
        icon={<FolderPlus className="w-4 h-4 text-blue-400" />}
        title="Novo Projeto"
        subtitle="Configure seu novo projeto"
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
        {/* Image + Name */}
        <div className="flex items-start gap-4">
          <button
            type="button"
            onClick={handleSelectImage}
            title="Selecionar ícone (opcional)"
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
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold" style={{ backgroundColor: color + '22', color }}>
                  {name.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <ImagePlus className="w-4 h-4 text-white" />
                </div>
              </>
            )}
          </button>

          <div className="flex-1 space-y-1.5">
            <FieldLabel>Nome do Projeto *</FieldLabel>
            <input
              required autoFocus
              placeholder="Ex: Minha Loja Virtual"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input-field"
            />
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
          <textarea
            placeholder="Uma breve descrição sobre o projeto"
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
              <button key={col.value} type="button" onClick={() => setColor(col.value)} title={col.label}
                className={`w-7 h-7 rounded-full border-2 transition-all duration-150 flex items-center justify-center ${color === col.value ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105 opacity-70 hover:opacity-100'}`}
                style={{ backgroundColor: col.value }}
              >
                {color === col.value && <span className="w-2 h-2 rounded-full bg-white/80" />}
              </button>
            ))}
            <div className="relative w-7 h-7 rounded-full overflow-hidden border cursor-pointer hover:scale-105 transition" style={{ borderColor: 'var(--line)' }}>
              <input type="color" value={color} onChange={e => setColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer scale-150" />
              <div className="w-full h-full" style={{ backgroundColor: color }} />
            </div>
            <span className="text-[11px] font-mono tx-faint">{color.toUpperCase()}</span>
          </div>
        </div>
      </form>

      <ModalFooter>
        <button type="button" onClick={onClose} className="btn-ghost px-4 py-2">Cancelar</button>
        <button
          onClick={handleSubmit as any}
          disabled={creating || !projectPath || !name}
          className="btn-primary flex items-center gap-2 px-5 py-2 disabled:opacity-40"
        >
          {creating ? <><Loader2 className="w-4 h-4 animate-spin" /> Criando...</> : 'Confirmar e Criar'}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
