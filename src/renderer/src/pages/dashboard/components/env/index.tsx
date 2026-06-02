import { useState, useEffect } from 'react'
import { Save, AlertCircle, FileText, Check } from 'lucide-react'
import { parseEnvContent, serializeEnvEntries, EnvEntry } from './utils'
import EnvTable from './EnvTable'

interface EnvPanelProps {
  projectPath: string
}

export default function EnvPanel({ projectPath }: EnvPanelProps) {
  const [envType, setEnvType] = useState<'backend' | 'frontend'>('backend')
  const [entries, setEntries] = useState<EnvEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const getEnvPath = () => {
    // Basic formatting for cross-platform paths
    const suffix = envType === 'backend' ? 'backend/.env' : 'frontend/.env'
    return projectPath.endsWith('/') || projectPath.endsWith('\\')
      ? `${projectPath}${suffix}`
      : `${projectPath}/${suffix}`
  }

  const loadEnv = async () => {
    if (!window.api?.fs) return
    setLoading(true)
    setSavedStatus('idle')
    setErrorMsg('')
    try {
      const path = getEnvPath()
      const content = await window.api.fs.readFile(path)
      const parsed = parseEnvContent(content || '')
      setEntries(parsed)
    } catch (err: any) {
      console.warn('Erro ao carregar .env:', err)
      // If it doesn't exist, we start with empty entries instead of failing
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEnv()
  }, [envType, projectPath])

  const handleSave = async () => {
    if (!window.api?.fs) return
    setSavedStatus('saving')
    try {
      const path = getEnvPath()
      const serialized = serializeEnvEntries(entries)
      await window.api.fs.writeFile(path, serialized)
      setSavedStatus('success')
      setTimeout(() => setSavedStatus('idle'), 3000)
    } catch (err: any) {
      console.error('Erro ao salvar .env:', err)
      setErrorMsg(err.message || 'Erro desconhecido ao salvar o arquivo.')
      setSavedStatus('error')
    }
  }

  return (
    <div className="flex flex-col h-full bg-[var(--surface-base)] border border-[var(--line)] rounded-2xl overflow-hidden shadow-xl animate-fade-in p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Variáveis de Ambiente (.env)
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Modifique e gerencie visualmente as variáveis de ambiente dos seus serviços.
          </p>
        </div>

        <div className="flex items-center bg-[var(--surface-overlay)] border border-[var(--line)] p-1 rounded-xl">
          <button
            onClick={() => setEnvType('backend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              envType === 'backend' ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-white'
            }`}
          >
            Backend
          </button>
          <button
            onClick={() => setEnvType('frontend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              envType === 'frontend' ? 'bg-blue-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:text-white'
            }`}
          >
            Frontend
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
            <p className="text-xs text-[var(--text-muted)]">Lendo arquivo de ambiente...</p>
          </div>
        ) : (
          <EnvTable entries={entries} onChange={setEntries} />
        )}
      </div>

      <div className="border-t border-[var(--line)] pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {savedStatus === 'success' && (
            <span className="flex items-center gap-1 text-emerald-400 text-xs font-semibold animate-fade-in bg-emerald-500/10 px-2.5 py-1 rounded-lg">
              <Check className="w-3.5 h-3.5" /> Salvo com sucesso!
            </span>
          )}
          {savedStatus === 'error' && (
            <span className="flex items-center gap-1 text-rose-400 text-xs font-semibold animate-fade-in bg-rose-500/10 px-2.5 py-1 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5" /> {errorMsg}
            </span>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={loading || savedStatus === 'saving'}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-lg select-none ${
            savedStatus === 'saving'
              ? 'bg-blue-700 cursor-not-allowed opacity-75'
              : 'bg-blue-600 hover:bg-blue-500 hover:shadow-blue-500/20'
          }`}
        >
          <Save className="w-4 h-4" />
          {savedStatus === 'saving' ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  )
}
