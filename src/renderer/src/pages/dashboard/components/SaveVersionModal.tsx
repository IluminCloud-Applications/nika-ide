import React, { useState, useEffect } from 'react'

interface SaveVersionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (message: string) => Promise<void>
  saving: boolean
  projectPath: string
}

export default function SaveVersionModal({
  isOpen,
  onClose,
  onSave,
  saving,
  projectPath,
}: SaveVersionModalProps) {
  const [message, setMessage]               = useState('')
  const [nextVersion, setNextVersion]       = useState<string | null>(null)
  const [currentVersion, setCurrentVersion] = useState<string | null>(null)
  const [loadingVersion, setLoadingVersion] = useState(false)
  // Tracks whether the auto-fill button was used and the field wasn't manually edited after
  const [willBumpVersion, setWillBumpVersion] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setMessage('')
    setWillBumpVersion(false)
    setLoadingVersion(true)
    window.api.projects.getNextVersion(projectPath)
      .then(({ current, next }) => {
        setCurrentVersion(current)
        setNextVersion(next)
      })
      .catch(() => setNextVersion(null))
      .finally(() => setLoadingVersion(false))
  }, [isOpen, projectPath])

  const handleAutoFill = () => {
    if (!nextVersion) return
    setMessage(`v${nextVersion}`)
    setWillBumpVersion(true)
  }

  const handleMessageChange = (value: string) => {
    setMessage(value)
    // If user edits manually after auto-fill, cancel the automatic bump
    setWillBumpVersion(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    // Only bump package.json if the user explicitly clicked the auto-fill button
    if (willBumpVersion && nextVersion) {
      await window.api.projects.bumpVersion(projectPath, nextVersion)
    }

    await onSave(message)
    setMessage('')
    setWillBumpVersion(false)
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold flex items-center gap-2 tx-primary">
            <i className="ri-git-commit-line text-blue-500 text-lg" /> Salvar Nova Versão
          </h2>
          <button type="button" onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {/* Version hint banner */}
        {(currentVersion || loadingVersion) && (
          <div
            className="flex items-center justify-between rounded-lg px-3 py-2 text-xs"
            style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--line)' }}
          >
            <span className="tx-muted flex items-center gap-1.5">
              <i className="ri-price-tag-3-line" />
              {loadingVersion ? (
                <span className="animate-pulse">Detectando versão...</span>
              ) : (
                <span>
                  Versão atual:{' '}
                  <span className="font-mono tx-primary font-semibold">v{currentVersion}</span>
                </span>
              )}
            </span>

            {!loadingVersion && nextVersion && (
              <button
                type="button"
                onClick={handleAutoFill}
                title={`Preencher automaticamente com v${nextVersion} e atualizar o package.json`}
                className="flex items-center gap-1 font-semibold transition-opacity"
                style={{ color: 'var(--accent)' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.75')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <i className="ri-magic-line text-sm" />
                Usar v{nextVersion}
              </button>
            )}
          </div>
        )}

        {/* Message input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold tx-muted">Nome ou Descrição da Versão</label>
          <input
            type="text"
            required
            value={message}
            onChange={(e) => handleMessageChange(e.target.value)}
            placeholder="Ex: correção de layout, v0.0.2, refactor..."
            className="w-full rounded-lg px-3 py-2 text-sm outline-none transition-colors"
            style={{
              backgroundColor: 'var(--surface-base)',
              border: `1px solid ${willBumpVersion ? 'var(--accent)' : 'var(--line)'}`,
              color: 'var(--tx-primary)',
            }}
            autoFocus
          />
          {/* Contextual hint below input */}
          <p className="text-xs tx-muted leading-relaxed">
            {willBumpVersion && nextVersion
              ? `✦ O package.json será atualizado para v${nextVersion} automaticamente.`
              : 'Apenas o commit git será salvo. O package.json não será alterado.'}
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="btn-surface px-4 py-2 text-xs font-semibold">
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
