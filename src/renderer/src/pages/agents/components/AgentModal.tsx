import { useState, useEffect } from 'react'
import { Bot, Loader2, Save } from 'lucide-react'
import { Agent } from '../types'
import ModalShell, { ModalHeader, ModalFooter, FieldLabel } from '../../../components/layout/ModalShell'

interface AgentModalProps {
  isOpen: boolean
  agent: Agent | null
  onClose: () => void
  onConfirm: (agent: Agent) => Promise<void>
}

export default function AgentModal({ isOpen, agent, onClose, onConfirm }: AgentModalProps) {
  const [name, setName]                           = useState('')
  const [description, setDescription]             = useState('')
  const [systemInstructions, setSystemInstructions] = useState('')
  const [tagsStr, setTagsStr]                     = useState('')
  const [loading, setLoading]                     = useState(false)
  const [error, setError]                         = useState('')

  useEffect(() => {
    if (isOpen) {
      setName(agent?.name ?? ''); setDescription(agent?.description ?? '')
      setSystemInstructions(agent?.systemInstructions ?? ''); setTagsStr(agent?.tags?.join(', ') ?? '')
      setError('')
    }
  }, [isOpen, agent])

  if (!isOpen) return null

  const handleConfirm = async () => {
    if (!name.trim())               { setError('O nome do agente é obrigatório.'); return }
    if (!systemInstructions.trim()) { setError('As instruções do sistema são obrigatórias.'); return }
    setLoading(true); setError('')
    const payload: Agent = {
      id: agent?.id || `custom-${Date.now()}`,
      name: name.trim(), description: description.trim(),
      systemInstructions: systemInstructions.trim(),
      tags: tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(Boolean) : [],
      isDefault: false,
    }
    try { await onConfirm(payload); onClose() }
    catch (err: any) { setError(err?.message || 'Erro ao salvar o agente.') }
    finally { setLoading(false) }
  }

  return (
    <ModalShell onClose={onClose} width="max-w-2xl" noCloseOnBackdrop={loading}>
      <ModalHeader
        icon={<Bot className="w-4 h-4 text-violet-400" />}
        title={agent ? 'Editar Agente' : 'Criar Novo Agente'}
        subtitle="System Instructions guiam a IA no desenvolvimento"
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
              placeholder="Ex: Designer Backend" disabled={loading}
              autoFocus className="input-field" />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Tags <span className="normal-case font-normal tx-faint">(separadas por vírgula)</span></FieldLabel>
            <input value={tagsStr} onChange={e => setTagsStr(e.target.value)}
              placeholder="Ex: python, db, fastapi" disabled={loading} className="input-field" />
          </div>
        </div>

        <div className="space-y-1.5">
          <FieldLabel>Descrição</FieldLabel>
          <input value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Ex: Focado em otimizações de APIs e PostgreSQL..."
            disabled={loading} className="input-field" />
        </div>

        <div className="space-y-1.5">
          <FieldLabel>System Instructions *</FieldLabel>
          <textarea
            value={systemInstructions} onChange={e => setSystemInstructions(e.target.value)}
            placeholder="Digite aqui as instruções que guiarão a IA no desenvolvimento..."
            disabled={loading} rows={10}
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
            : <><Save className="w-3.5 h-3.5" /> Salvar Agente</>}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
