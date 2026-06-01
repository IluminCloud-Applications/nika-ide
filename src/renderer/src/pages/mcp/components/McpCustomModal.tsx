import { useState, useEffect } from 'react'
import { Plug2, Loader2 } from 'lucide-react'
import ModalShell, { ModalFooter, FieldLabel } from '../../../components/layout/ModalShell'

interface McpCustomModalProps {
  isOpen: boolean
  mcpToEdit?: { id: string; name: string; configText: string } | null
  onClose: () => void
  onConfirm: () => void
}

export default function McpCustomModal({ isOpen, mcpToEdit, onClose, onConfirm }: McpCustomModalProps) {
  const [mcpId, setMcpId] = useState('')
  const [mcpName, setMcpName] = useState('')
  const [configText, setConfigText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (mcpToEdit) {
        setMcpId(mcpToEdit.id)
        setMcpName(mcpToEdit.name)
        setConfigText(mcpToEdit.configText || '')
      } else {
        setMcpId('')
        setMcpName('')
        setConfigText('')
      }
      setError('')
    }
  }, [isOpen, mcpToEdit])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!configText.trim()) {
      setError('A configuração JSON do servidor MCP é obrigatória.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await window.api.mcp.saveCustomMcp({
        id: mcpId,
        name: mcpName,
        configText: configText.trim()
      })

      if (res && !res.success) {
        setError(res.error || 'Erro desconhecido ao salvar o MCP.')
      } else {
        onConfirm()
        onClose()
      }
    } catch (err: any) {
      setError(err?.message || 'Erro de conexão ou erro ao processar o JSON.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalShell onClose={onClose} width="max-w-lg" noCloseOnBackdrop={loading}>
      <div className="flex flex-col items-center px-8 pt-8 pb-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
          <Plug2 className="w-7 h-7 text-amber-400" />
        </div>
        <h2 className="text-base font-bold tx-primary">
          {mcpToEdit ? 'Editar Servidor MCP' : 'Adicionar Servidor MCP Customizado'}
        </h2>
        <p className="text-xs tx-muted mt-1.5 leading-relaxed max-w-sm">
          Adicione um servidor MCP via comando/args (npx/node) ou um servidor remoto (url/headers).
        </p>
      </div>

      <div className="px-6 mb-4 space-y-4">
        {/* ID + Nome */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <FieldLabel>ID / Chave *</FieldLabel>
            <input
              type="text"
              value={mcpId}
              onChange={e => setMcpId(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              placeholder="Ex: playwright"
              disabled={loading || !!mcpToEdit}
              className="input-field w-full text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>Nome para Exibição</FieldLabel>
            <input
              type="text"
              value={mcpName}
              onChange={e => setMcpName(e.target.value)}
              placeholder="Ex: Playwright Server"
              disabled={loading}
              className="input-field w-full text-xs"
            />
          </div>
        </div>

        {/* JSON Config */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <FieldLabel>Configuração JSON (Completo ou Parcial) *</FieldLabel>
          </div>
          <textarea
            value={configText}
            onChange={e => setConfigText(e.target.value)}
            disabled={loading}
            rows={8}
            placeholder={`{\n  "command": "npx",\n  "args": ["@playwright/mcp@latest"]\n}\n\n-- OU --\n\n{\n  "url": "https://mcp.context7.com/mcp",\n  "headers": {\n    "CONTEXT7_API_KEY": "YOUR_API_KEY"\n  }\n}`}
            className="input-field w-full font-mono text-[11px] leading-relaxed resize-none h-[180px] p-3"
          />
          <p className="text-[10px] tx-faint">
            Você pode colar o objeto do servidor direto, com a chave do servidor, ou com "mcpServers"/"servers". Ajustamos e formatamos para você ao salvar.
          </p>
        </div>

        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>

      <ModalFooter>
        <button onClick={onClose} disabled={loading} className="flex-1 btn-surface py-2 rounded-xl disabled:opacity-50 text-xs font-semibold">
          Cancelar
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-1 btn-primary flex items-center justify-center gap-2 py-2 rounded-xl disabled:opacity-40 text-xs font-semibold"
        >
          {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Salvando...</> : 'Salvar Servidor'}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
