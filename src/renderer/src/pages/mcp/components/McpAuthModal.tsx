import { useState, useEffect } from 'react'
import { Key, Eye, EyeOff, Loader2 } from 'lucide-react'
import ModalShell, { ModalFooter, FieldLabel } from '../../../components/layout/ModalShell'

interface McpAuthModalProps {
  isOpen: boolean
  mcpName: string
  mcpId: string
  initialKey?: string
  onClose: () => void
  onConfirm: (apiKey: string) => Promise<void>
}

export default function McpAuthModal({ isOpen, mcpName, initialKey = '', onClose, onConfirm }: McpAuthModalProps) {
  const [apiKey, setApiKey]   = useState(initialKey)
  const [showKey, setShowKey] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (isOpen) { setApiKey(initialKey); setError('') }
  }, [isOpen, initialKey])

  if (!isOpen) return null

  const handleConfirm = async () => {
    if (!apiKey.trim()) { setError('A chave de autenticação é obrigatória.'); return }
    setLoading(true); setError('')
    try { await onConfirm(apiKey.trim()); onClose() }
    catch (err: any) { setError(err?.message || 'Erro ao salvar a chave.') }
    finally { setLoading(false) }
  }

  return (
    <ModalShell onClose={onClose} width="max-w-md" noCloseOnBackdrop={loading}>
      {/* Centered icon + heading */}
      <div className="flex flex-col items-center px-8 pt-8 pb-5 text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <Key className="w-7 h-7 text-blue-400" />
        </div>
        <h2 className="text-base font-bold tx-primary">Autenticação MCP</h2>
        <p className="text-sm tx-muted mt-1.5 leading-relaxed">
          O servidor <span className="tx-primary font-semibold">{mcpName}</span> necessita de uma chave/token de acesso.
        </p>
      </div>

      {/* Input */}
      <div className="px-6 mb-4 space-y-1.5">
        <FieldLabel>API Key / Token *</FieldLabel>
        <div className="relative">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey} onChange={e => setApiKey(e.target.value)}
            placeholder="Ex: sk-proj-..." disabled={loading}
            autoFocus className="input-field pr-10 w-full"
          />
          <button type="button" onClick={() => setShowKey(!showKey)} disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 tx-muted hover:tx-primary transition">
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>

      {/* Info */}
      <div className="mx-6 mb-6 rounded-xl px-3.5 py-3"
        style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)' }}>
        <p className="text-xs tx-muted leading-relaxed">
          Esta chave será salva localmente e configurada nos arquivos{' '}
          <code className="tx-secondary font-mono text-[10px]">.claude/settings.json</code> e{' '}
          <code className="tx-secondary font-mono text-[10px]">.agents/mcp_config.json</code> para que o agente tenha acesso às ferramentas.
        </p>
      </div>

      <ModalFooter>
        <button onClick={onClose} disabled={loading} className="flex-1 btn-surface py-2.5 rounded-xl disabled:opacity-50">
          Cancelar
        </button>
        <button onClick={handleConfirm} disabled={loading}
          className="flex-1 btn-primary flex items-center justify-center gap-2 py-2.5 rounded-xl disabled:opacity-40">
          {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</> : 'Confirmar'}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
