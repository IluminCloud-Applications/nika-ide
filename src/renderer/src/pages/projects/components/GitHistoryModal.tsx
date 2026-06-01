import { useState, useEffect } from 'react'
import { GitBranch, Clock, RotateCcw, Eye, Loader2, Tag, AlertTriangle } from 'lucide-react'
import { Project } from '../../../App'
import ModalShell, { ModalHeader } from '../../../components/layout/ModalShell'

interface GitCommit {
  hash: string
  shortHash: string
  message: string
  date: string
  isPublished?: boolean
}

interface GitHistoryModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onRollback: (hash: string) => Promise<void>
  onStatusChange: () => void
  onPreview?: (hash: string) => void
  activePreviewHash?: string | null
}

function CommitRow({ commit, onRollback, onPreview, rolling, showPreview, isPreviewActive }: {
  commit: GitCommit
  onRollback: (hash: string) => void
  onPreview: (hash: string) => void
  rolling: string | null
  showPreview: boolean
  isPreviewActive?: boolean
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl transition group"
      style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line-subtle)' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--line)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--line-subtle)')}
    >
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <span className="font-mono text-[11px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md shrink-0 border border-blue-500/20">
          {commit.shortHash}
        </span>
        <span className="text-sm tx-secondary truncate">{commit.message}</span>
        {commit.isPublished && (
          <span className="shrink-0 flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <Tag className="w-2.5 h-2.5" /> publicado
          </span>
        )}
      </div>

      <span className="text-[11px] tx-faint shrink-0 tabular-nums">{commit.date}</span>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
        {showPreview && (
          <button onClick={() => onPreview(commit.hash)}
            className={`p-1.5 rounded-lg transition ${
              isPreviewActive 
                ? 'text-blue-400 bg-blue-500/20 opacity-100' 
                : 'tx-muted hover:text-blue-400 hover:bg-blue-500/10 opacity-0 group-hover:opacity-100'
            }`}
            title={isPreviewActive ? "Fechar Comparação" : "Ver arquivos"}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
        <button onClick={() => onRollback(commit.hash)} disabled={rolling === commit.hash}
          className="p-1.5 rounded-lg tx-muted hover:text-amber-400 hover:bg-amber-500/10 transition disabled:opacity-50" title="Reverter"
        >
          {rolling === commit.hash
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <RotateCcw className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  )
}

export default function GitHistoryModal({ project, isOpen, onClose, onRollback, onStatusChange, onPreview, activePreviewHash }: GitHistoryModalProps) {
  const [commits, setCommits] = useState<GitCommit[]>([])
  const [loading, setLoading] = useState(false)
  const [rolling, setRolling] = useState<string | null>(null)
  const [error, setError]     = useState('')


  const loadHistory = async () => {
    setLoading(true); setError('')
    try {
      const result = await window.api.projects.gitLog(project.path)
      setCommits(result.map((c: GitCommit) => ({ ...c, isPublished: c.hash === project.publishedHash })))

    } catch (e: any) {
      setError(e.message || 'Erro ao carregar histórico Git.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen && project?.path) {
      loadHistory()
    }
  }, [isOpen, project?.path])

  const handleRollback = async (hash: string) => {
    if (!confirm(`Reverter para o commit ${hash.slice(0, 7)}? Alterações não salvas serão perdidas.`)) return
    setRolling(hash)
    try {
      await onRollback(hash)

      onStatusChange()
      await loadHistory()
    } catch (e: any) {
      alert('Erro no rollback: ' + e.message)
    } finally {
      setRolling(null)
    }
  }

  if (!isOpen) return null

  return (
    <ModalShell onClose={onClose} width="max-w-2xl" className="max-h-[82vh]">
      <ModalHeader
        icon={<GitBranch className="w-4 h-4 text-blue-400" />}
        title="Histórico Git"
        subtitle={project.name}
        onClose={onClose}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-500/60" />
            <p className="text-sm tx-muted text-center max-w-xs">{error}</p>
            <button onClick={loadHistory} className="text-xs text-blue-400 hover:text-blue-300 transition">Tentar novamente</button>
          </div>
        ) : commits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Clock className="w-8 h-8 tx-faint" />
            <p className="text-sm tx-muted">Nenhum commit encontrado no repositório.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {commits.map(c => (
              <CommitRow
                key={c.hash}
                commit={c}
                onRollback={handleRollback}
                onPreview={onPreview || (() => {})}
                rolling={rolling}
                showPreview={!!onPreview}
                isPreviewActive={activePreviewHash === c.hash}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0"
        style={{ borderTop: '1px solid var(--line-subtle)' }}
      >
        <p className="text-[11px] tx-faint flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3 text-amber-500/60" />
          Rollback reverte permanentemente o código para a versão selecionada.
        </p>
        <button onClick={loadHistory} className="text-[11px] tx-muted hover:tx-primary transition flex items-center gap-1.5">
          <RotateCcw className="w-3 h-3" /> Atualizar
        </button>
      </div>
    </ModalShell>
  )
}
