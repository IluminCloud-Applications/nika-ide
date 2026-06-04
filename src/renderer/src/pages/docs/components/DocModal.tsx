import { useState, useEffect } from 'react'
import { BookOpen, Loader2, Save } from 'lucide-react'
import { DocEntry } from '../types'
import ModalShell, { ModalHeader, ModalFooter, FieldLabel } from '../../../components/layout/ModalShell'

interface DocModalProps {
  isOpen: boolean
  doc: DocEntry | null
  onClose: () => void
  onConfirm: (doc: DocEntry) => Promise<void>
}

export default function DocModal({ isOpen, doc, onClose, onConfirm }: DocModalProps) {
  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent]         = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(doc?.name ?? '')
      setDescription(doc?.description ?? '')
      setContent(doc?.content ?? '')
      setError('')
    }
  }, [isOpen, doc])

  if (!isOpen) return null

  const handleConfirm = async () => {
    if (!name.trim())    { setError('O nome da documentação é obrigatório.'); return }
    if (!content.trim()) { setError('O conteúdo é obrigatório.'); return }
    setLoading(true); setError('')

    const toSlug = (n: string) =>
      n.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    const payload: DocEntry = {
      slug:        doc?.slug || toSlug(name),
      name:        name.trim(),
      description: description.trim(),
      content:     content.trim(),
    }

    try { await onConfirm(payload); onClose() }
    catch (err: any) { setError(err?.message || 'Erro ao salvar a documentação.') }
    finally { setLoading(false) }
  }

  return (
    <ModalShell onClose={onClose} width="max-w-3xl" noCloseOnBackdrop={loading}>
      <ModalHeader
        icon={<BookOpen className="w-4 h-4 text-sky-400" />}
        title={doc ? 'Editar Documentação' : 'Nova Documentação'}
        subtitle="Salve documentações de APIs e libs para uso da IA"
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {error && (
          <p className="text-xs text-red-400 font-medium px-3 py-2 rounded-lg border border-red-500/20 bg-red-500/5">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <FieldLabel>Nome *</FieldLabel>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Ex: LangChain, Brevo, AssemblyAI"
              disabled={loading} autoFocus className="input-field" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Descrição</FieldLabel>
            <input value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Ex: SDK Python para síntese de voz"
              disabled={loading} className="input-field" />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <FieldLabel>Conteúdo da Documentação *</FieldLabel>
            <span className="text-[10px] tx-faint">Markdown, código e exemplos aceitos</span>
          </div>
          <textarea
            value={content} onChange={e => setContent(e.target.value)}
            placeholder={`# LangChain\n\n## Instalação\n\`\`\`bash\npip install langchain\n\`\`\`\n\n## Exemplo de uso\n...`}
            disabled={loading} rows={14}
            className="input-field font-mono text-xs resize-none"
          />
        </div>
      </div>

      <ModalFooter>
        <button onClick={onClose} disabled={loading} className="btn-ghost px-4 py-2">Cancelar</button>
        <button onClick={handleConfirm} disabled={loading}
          className="btn-primary flex items-center gap-2 px-5 py-2 disabled:opacity-40">
          {loading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</>
            : <><Save className="w-3.5 h-3.5" /> Salvar</>}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
