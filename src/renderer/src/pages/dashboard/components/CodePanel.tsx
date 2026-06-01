import { useState, useEffect, useMemo, useRef } from 'react'
import { RefreshCw, FileCode, Save, FolderOpen, Hash, Type, Coins, Eye, Edit3 } from 'lucide-react'
import { estimateTokens, countLines, countChars, formatNumber } from '@/utils/textStats'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { getLanguageFromFilename } from '@/utils/languageMap'

interface CodePanelProps {
  filePath: string | null
  onSelectFile: () => void
}

export default function CodePanel({ filePath, onSelectFile }: CodePanelProps) {
  const [content, setContent]   = useState('')
  const [loading, setLoading]   = useState(false)
  const [saving, setSaving]     = useState(false)
  const [dirty, setDirty]       = useState(false)
  const [viewMode, setViewMode] = useState<'highlight' | 'edit'>('highlight')
  const scrollRef = useRef<HTMLDivElement>(null)

  const fileBasename = filePath?.split(/[/\\]/).pop() ?? null
  const language     = fileBasename ? getLanguageFromFilename(fileBasename) : 'text'

  const stats = useMemo(() => ({
    lines:  countLines(content),
    chars:  countChars(content),
    tokens: estimateTokens(content),
  }), [content])

  useEffect(() => {
    if (!filePath) { setContent(''); setDirty(false); return }
    setLoading(true)
    setViewMode('highlight')
    window.api.fs.readFile(filePath)
      .then((data: string) => { setContent(data); setDirty(false) })
      .catch(() => setContent(''))
      .finally(() => setLoading(false))
  }, [filePath])

  const handleChange = (val: string) => { setContent(val); setDirty(true) }

  const handleSave = async () => {
    if (!filePath || !dirty) return
    setSaving(true)
    try {
      await window.api.fs.writeFile(filePath, content)
      setDirty(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (!filePath) {
    return (
      <div className="editor-idle-state text-center">
        <div className="p-5 rounded-2xl card">
          <FileCode className="w-10 h-10 tx-faint" />
        </div>
        <div>
          <h3 className="text-base font-semibold tx-secondary mb-1.5">Nenhum arquivo aberto</h3>
          <p className="tx-muted text-xs max-w-xs leading-relaxed">
            Selecione um arquivo no explorador para editar seu código aqui.
          </p>
        </div>
        <button
          onClick={onSelectFile}
          className="btn-surface flex items-center gap-2 px-4 py-2"
        >
          <FolderOpen className="w-3.5 h-3.5" />
          Selecionar arquivo
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ backgroundColor: 'var(--surface-base)' }}>
      {/* Header */}
      <div className="editor-panel-header h-9">
        <div className="flex items-center gap-1.5">
          <FileCode className="w-3.5 h-3.5 text-blue-400/80" />
          <span className="text-[11px] font-medium tx-secondary truncate max-w-[200px]">{fileBasename}</span>
          {dirty && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" title="Alterações não salvas" />}
          <span className="text-[10px] tx-muted font-mono px-1.5 py-0.5 rounded ml-1" style={{ backgroundColor: 'var(--surface-base)', border: '1px solid var(--line)' }}>
            {language}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center rounded-md p-0.5" style={{ backgroundColor: 'var(--surface-base)', border: '1px solid var(--line)' }}>
            <button
              onClick={() => setViewMode('highlight')}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition ${
                viewMode === 'highlight' ? 'tx-primary' : 'tx-muted hover:tx-secondary'
              }`}
              style={viewMode === 'highlight' ? { backgroundColor: 'var(--surface-raised)' } : {}}
              title="Visualizar com sintaxe"
            >
              <Eye className="w-3 h-3" />
              Visualizar
            </button>
            <button
              onClick={() => setViewMode('edit')}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] transition ${
                viewMode === 'edit' ? 'tx-primary' : 'tx-muted hover:tx-secondary'
              }`}
              style={viewMode === 'edit' ? { backgroundColor: 'var(--surface-raised)' } : {}}
              title="Editar arquivo"
            >
              <Edit3 className="w-3 h-3" />
              Editar
            </button>
          </div>
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600/80 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-default text-white text-[10px] font-semibold transition"
          >
            {saving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            {saving ? 'Salvando…' : 'Salvar'}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : viewMode === 'edit' ? (
          <textarea
            value={content}
            onChange={e => handleChange(e.target.value)}
            spellCheck={false}
            className="w-full h-full p-4 outline-none font-mono text-[12px] leading-relaxed resize-none"
            style={{ backgroundColor: 'var(--surface-base)', color: 'var(--tx-primary)', tabSize: 2 }}
          />
        ) : (
          <div ref={scrollRef} className="w-full h-full overflow-auto code-highlight-wrapper">
            <SyntaxHighlighter
              language={language}
              style={atomOneDark}
              showLineNumbers
              lineNumberStyle={{
                color: '#52525b',
                fontSize: '11px',
                minWidth: '2.5em',
                paddingRight: '1em',
                userSelect: 'none',
              }}
              customStyle={{
                background: '#07070a',
                margin: 0,
                padding: '16px 0',
                fontSize: '12px',
                lineHeight: '1.6',
                fontFamily: "'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
                minHeight: '100%',
              }}
              codeTagProps={{ style: { fontFamily: 'inherit' } }}
            >
              {content}
            </SyntaxHighlighter>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {!loading && (
        <div className="h-7 px-4 flex items-center gap-4 flex-shrink-0 text-[10px]" style={{ borderTop: '1px solid var(--line)', backgroundColor: 'var(--surface-overlay)' }}>
          <div className="flex items-center gap-1 tx-muted" title="Linhas">
            <Hash className="w-3 h-3 tx-faint" />
            <span>{formatNumber(stats.lines)} linhas</span>
          </div>
          <div className="divider-y h-3" />
          <div className="flex items-center gap-1 tx-muted" title="Caracteres">
            <Type className="w-3 h-3 tx-faint" />
            <span>{formatNumber(stats.chars)} chars</span>
          </div>
          <div className="divider-y h-3" />
          <div className="flex items-center gap-1 text-blue-400/70" title="Tokens estimados">
            <Coins className="w-3 h-3" />
            <span>~{formatNumber(stats.tokens)} tokens</span>
          </div>
        </div>
      )}
    </div>
  )
}
