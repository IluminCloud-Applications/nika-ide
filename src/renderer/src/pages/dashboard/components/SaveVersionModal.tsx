import React, { useState } from 'react'

interface SaveVersionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (message: string) => Promise<void>
  saving: boolean
}

export default function SaveVersionModal({ isOpen, onClose, onSave, saving }: SaveVersionModalProps) {
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return
    await onSave(message)
    setMessage('')
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-md glass-panel p-6 rounded-2xl shadow-glass flex flex-col space-y-4 animate-slide-up"
        style={{ willChange: 'transform' }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2 tx-primary">
            <i className="ri-git-commit-line text-blue-500 text-lg" /> Salvar Nova Versão
          </h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn-ghost p-1.5 rounded-lg"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold tx-muted">Nome ou Descrição da Versão</label>
          <input
            type="text"
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ex: versão 01 - correção de layout"
            className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
            style={{ backgroundColor: 'var(--surface-base)', border: '1px solid var(--line)', color: 'var(--tx-primary)' }}
            autoFocus
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="btn-surface px-4 py-2 text-xs font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving || !message.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold shadow-lg hover:shadow-blue-500/25 transition"
          >
            {saving ? (
              <i className="ri-loader-4-line text-sm animate-spin" />
            ) : (
              <i className="ri-git-commit-line text-sm" />
            )}
            {saving ? 'Salvando...' : 'Salvar Versão'}
          </button>
        </div>
      </form>
    </div>
  )
}
