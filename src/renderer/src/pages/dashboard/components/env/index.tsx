import { useState, useEffect } from 'react'
import { parseEnvContent, serializeEnvEntries, EnvEntry } from './utils'
import EnvTable from './EnvTable'

interface EnvPanelProps {
  projectPath: string
}

export default function EnvPanel({ projectPath }: EnvPanelProps) {
  const [envType, setEnvType] = useState<'backend' | 'frontend'>('backend')
  const [entries, setEntries]           = useState<EnvEntry[]>([])
  const [savedEntries, setSavedEntries] = useState<EnvEntry[]>([])
  const [loading, setLoading]           = useState(false)
  const [statusMsg, setStatusMsg]       = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const isDirty = JSON.stringify(entries) !== JSON.stringify(savedEntries)

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMsg({ text, type })
    setTimeout(() => setStatusMsg(null), 3000)
  }

  const getEnvPath = () => {
    const suffix = envType === 'backend' ? 'backend/.env' : 'frontend/.env'
    return projectPath.endsWith('/') || projectPath.endsWith('\\')
      ? `${projectPath}${suffix}`
      : `${projectPath}/${suffix}`
  }

  const loadEnv = async () => {
    if (!window.api?.fs) return
    setLoading(true)
    try {
      const path = getEnvPath()
      const content = await window.api.fs.readFile(path)
      const parsed = parseEnvContent(content || '')
      setEntries(parsed)
      setSavedEntries(parsed)
    } catch {
      setEntries([])
      setSavedEntries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadEnv() }, [envType, projectPath])

  const handleSave = async () => {
    if (!window.api?.fs) return
    try {
      const path = getEnvPath()
      await window.api.fs.writeFile(path, serializeEnvEntries(entries))
      setSavedEntries([...entries])
      showStatus('Variáveis salvas com sucesso', 'success')
    } catch (err: any) {
      showStatus(err.message || 'Erro ao salvar', 'error')
    }
  }

  const handleRevert = () => {
    setEntries([...savedEntries])
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
      {/* Header — mesma linha do SystemHeader */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        {/* Segmented control: Backend / Frontend */}
        <div
          className="flex items-center gap-0.5 p-0.5 rounded-lg"
          style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)' }}
        >
          {(['backend', 'frontend'] as const).map(t => (
            <button
              key={t}
              onClick={() => setEnvType(t)}
              className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all duration-150 ${
                envType === t ? 'shadow-sm' : ''
              }`}
              style={{
                backgroundColor: envType === t ? 'var(--surface-raised)' : 'transparent',
                color: envType === t ? 'var(--tx-primary)' : 'var(--tx-muted)',
              }}
            >
              {t === 'backend' ? 'Backend' : 'Frontend'}
            </button>
          ))}
        </div>

        {/* Reload */}
        <button
          onClick={loadEnv}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-semibold
            transition-all duration-200 disabled:opacity-40"
          style={{
            backgroundColor: 'var(--surface-overlay)',
            border: '1px solid var(--line)',
            color: 'var(--tx-muted)',
          }}
        >
          <i className={`ri-refresh-line text-xs ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </button>
      </div>

      {/* Conteúdo scrollável */}
      <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: 'thin' }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2" style={{ borderColor: 'var(--line)' }} />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
            </div>
            <p className="text-xs tx-muted font-medium">Lendo arquivo de variáveis...</p>
          </div>
        ) : (
          <EnvTable entries={entries} onChange={setEntries} />
        )}
      </div>

      {/* Barra de salvar/reverter — só aparece quando há mudanças */}
      {isDirty && (
        <div
          className="flex items-center justify-between px-4 py-2 flex-shrink-0 animate-slide-up"
          style={{ borderTop: '1px solid var(--line)', backgroundColor: 'var(--surface-overlay)' }}
        >
          <span className="text-[11px] tx-muted">Alterações não salvas</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRevert}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all"
              style={{
                backgroundColor: 'var(--surface-raised)',
                border: '1px solid var(--line)',
                color: 'var(--tx-muted)',
              }}
            >
              <i className="ri-arrow-go-back-line text-xs" />
              Reverter
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold
                bg-blue-600 hover:bg-blue-500 text-white transition-all"
            >
              <i className="ri-save-line text-xs" />
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Toast de status */}
      {statusMsg && (
        <div
          className="absolute bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border card backdrop-blur-md shadow-2xl animate-slide-up"
          style={{
            borderColor: statusMsg.type === 'success' ? '#10b98150' : '#ef444450',
            color: statusMsg.type === 'success' ? '#10b981' : '#ef4444',
          }}
        >
          <i className={statusMsg.type === 'success' ? 'ri-checkbox-circle-fill text-lg' : 'ri-error-warning-fill text-lg'} />
          <span className="text-xs font-semibold tx-primary">{statusMsg.text}</span>
        </div>
      )}
    </div>
  )
}
