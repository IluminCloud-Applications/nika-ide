import { useState, useEffect } from 'react'
import { X, Save, RefreshCw, FileCode } from 'lucide-react'
import FileStatsBar from './editor/FileStatsBar'

interface FileEditorModalProps {
  filePath: string
  onClose: () => void
}

export default function FileEditorModal({ filePath, onClose }: FileEditorModalProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fileBasename = filePath.split(/[/\\]/).pop() || ''

  useEffect(() => {
    loadFile()
  }, [filePath])

  const loadFile = async () => {
    setLoading(true)
    try {
      const data = await window.api.fs.readFile(filePath)
      setContent(data)
    } catch (err) {
      alert('Erro ao carregar o arquivo: ' + (err as Error).message)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await window.api.fs.writeFile(filePath, content)
      alert('Arquivo salvo com sucesso!')
    } catch (err) {
      alert('Erro ao salvar o arquivo: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-4xl h-[80vh] glass-panel rounded-2xl shadow-glass flex flex-col overflow-hidden animate-slide-up" style={{ willChange: 'transform' }}>
        {/* Header */}
        <div className="h-14 px-6 flex items-center justify-between" style={{ borderBottom: '1px solid var(--line)', backgroundColor: 'var(--surface-overlay)' }}>
          <div className="flex items-center gap-2 tx-secondary">
            <FileCode className="w-5 h-5 text-blue-400" />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{fileBasename}</span>
              <span className="text-[10px] tx-muted truncate max-w-lg">{filePath}</span>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 p-6 overflow-hidden relative" style={{ backgroundColor: 'var(--surface-base)' }}>
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full h-full p-4 rounded-xl outline-none font-mono text-xs leading-relaxed resize-none overflow-y-auto focus:ring-1 focus:ring-blue-500"
              style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)', color: 'var(--tx-primary)' }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="h-14 px-6 flex items-center justify-between" style={{ borderTop: '1px solid var(--line)', backgroundColor: 'var(--surface-overlay)' }}>
          {!loading && <FileStatsBar content={content} />}
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="btn-surface px-4 py-2 text-xs font-semibold"
            >
              Fechar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loading}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-semibold shadow transition"
            >
              <Save className="w-4 h-4" /> {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
