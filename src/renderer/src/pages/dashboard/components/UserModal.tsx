import { useState } from 'react'
import { User, KeyRound, Sparkles, RefreshCw, CheckCircle2, XCircle } from 'lucide-react'

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  projectPath: string
  isRunning: boolean
  onAutologin: () => void
}

export default function UserModal({ isOpen, onClose, projectPath, isRunning, onAutologin }: UserModalProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  if (!isOpen) return null

  const handleCreateUser = async () => {
    setLoading(true)
    setResult(null)

    try {
      const res = await window.api.runner.runUserScript(projectPath)
      setResult({
        success: res.success,
        message: res.success
          ? 'Usuário criado e pronto para uso.'
          : 'Não foi possível criar o usuário no banco de dados.'
      })
    } catch {
      setResult({
        success: false,
        message: 'Não foi possível criar o usuário no banco de dados.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm glass-panel p-6 rounded-2xl shadow-glass flex flex-col space-y-4 animate-slide-up"
        style={{ willChange: 'transform' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--line-subtle)' }}>
          <h2 className="text-sm font-bold flex items-center gap-2 tx-primary">
            <User className="w-4 h-4 text-accent" /> Usuário Padrão & Autologin
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost p-1.5 rounded-lg"
          >
            <i className="ri-close-line text-lg" />
          </button>
        </div>

        {/* Credentials */}
        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--surface-overlay)' }}>
          <div
            className="flex items-center justify-between px-3.5 py-2.5 text-xs"
            style={{ borderBottom: '1px solid var(--line-subtle)' }}
          >
            <span className="tx-muted font-medium">E-mail</span>
            <span className="font-semibold tx-primary font-mono select-all">nika@test.com</span>
          </div>
          <div className="flex items-center justify-between px-3.5 py-2.5 text-xs">
            <span className="tx-muted font-medium">Senha</span>
            <span className="font-semibold tx-primary font-mono select-all">nika123</span>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div
            className="p-3 rounded-lg flex gap-2 items-start text-[11px]"
            style={
              result.success
                ? { backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#34d399' }
                : { backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }
            }
          >
            {result.success
              ? <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              : <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
            <p>{result.message}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={handleCreateUser}
            disabled={loading || !isRunning}
            className="btn-surface w-full justify-center py-2 text-xs disabled:opacity-40"
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <KeyRound className="w-3.5 h-3.5" />
            )}
            {loading ? 'Criando no banco…' : 'Criar / Restaurar Usuário'}
          </button>

          <button
            onClick={() => {
              onAutologin()
              onClose()
            }}
            disabled={!isRunning}
            className="btn-primary w-full justify-center py-2 text-xs disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Preencher e Entrar
          </button>
        </div>
      </div>
    </div>
  )
}

