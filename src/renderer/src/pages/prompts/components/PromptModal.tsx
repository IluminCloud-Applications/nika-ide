import { useState, useEffect } from 'react'
import { Sparkles, Loader2, Save } from 'lucide-react'
import { PromptTemplate } from '../types'
import ModalShell, { ModalHeader, ModalFooter, FieldLabel } from '../../../components/layout/ModalShell'

interface PromptModalProps {
  isOpen: boolean
  prompt: PromptTemplate | null
  onClose: () => void
  onConfirm: (prompt: PromptTemplate) => Promise<void>
}

export default function PromptModal({ isOpen, prompt, onClose, onConfirm }: PromptModalProps) {
  const [name, setName]               = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent]         = useState('')
  const [tagsStr, setTagsStr]         = useState('')
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(prompt?.name ?? ''); setDescription(prompt?.description ?? '')
      setContent(prompt?.content ?? ''); setTagsStr(prompt?.tags?.join(', ') ?? '')
      setError('')
    }
  }, [isOpen, prompt])

  if (!isOpen) return null

  const handleConfirm = async () => {
    if (!name.trim())    { setError('O nome do prompt é obrigatório.'); return }
    if (!content.trim()) { setError('O conteúdo do prompt é obrigatório.'); return }
    setLoading(true); setError('')
    const payload: PromptTemplate = {
      id: prompt?.id || `custom-${Date.now()}`,
      name: name.trim(), description: description.trim(), content: content.trim(),
      tags: tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [],
      isDefault: false,
    }
    try { await onConfirm(payload); onClose() }
    catch (err: any) { setError(err?.message || 'Erro ao salvar o prompt.') }
    finally { setLoading(false) }
  }

  return (
    <ModalShell onClose={onClose} width="max-w-2xl" noCloseOnBackdrop={loading}>
      <ModalHeader
        icon={<Sparkles className="w-4 h-4 text-violet-400" />}
        title={prompt ? 'Editar Prompt' : 'Criar Novo Prompt'}
        subtitle="Prompts com {{Variáveis}} criam campos dinâmicos"
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
              placeholder="Ex: Refatorar para Clean Code"
              disabled={loading} autoFocus className="input-field" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Tags <span className="normal-case font-normal tx-faint">(separadas por vírgula)</span></FieldLabel>
            <input value={tagsStr} onChange={e => setTagsStr(e.target.value)}
              placeholder="Ex: refactor, logic, clean"
              disabled={loading} className="input-field" />
          </div>
        </div>

        <div className="space-y-1.5">
          <FieldLabel>Descrição</FieldLabel>
          <input value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Melhora a legibilidade do código-fonte..."
            disabled={loading} className="input-field" />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <FieldLabel>Template do Prompt *</FieldLabel>
            <span className="text-[10px] tx-faint font-mono">
              Use <span className="text-blue-400">{`{{Variável}}`}</span> para campos dinâmicos
            </span>
          </div>
          <textarea
            value={content} onChange={e => setContent(e.target.value)}
            placeholder={`Ex: Olá, meu nome é {{Nome}}, ajude-me com o arquivo {{Arquivo}}.`}
            disabled={loading} rows={8}
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
            : <><Save className="w-3.5 h-3.5" /> Salvar Prompt</>}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
