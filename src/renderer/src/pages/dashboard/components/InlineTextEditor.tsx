import { useState, useRef, useEffect } from 'react'
import { Pencil, Check, X, AlertCircle } from 'lucide-react'

interface InlineTextEditorProps {
  fileName: string
  lineNumber: number          // dica de linha do _debugSource (pode ser imprecisa)
  originalText: string        // texto exato a substituir — busca é feita por texto
  onSaved: () => void
  onDismiss: () => void
}

/**
 * Busca o texto no arquivo inteiro, usando lineNumber apenas como desempate
 * quando o texto aparece em múltiplos lugares.
 *
 * Motivo: _debugSource.lineNumber pode ser impreciso (referencia o código
 * transformado pelo Babel, não necessariamente o source original).
 * O texto exato (originalText) é sempre confiável para localizar a linha real.
 *
 * Retorna o índice 0-based da linha encontrada, ou -1.
 */
function findLineWithText(lines: string[], targetText: string, hintLine: number): number {
  const matches: number[] = []

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(targetText)) matches.push(i)
  }

  if (matches.length === 0) return -1
  if (matches.length === 1) return matches[0]

  // Múltiplas ocorrências: escolhe a mais próxima do hintLine (0-based)
  const center = Math.max(0, hintLine - 1)
  return matches.reduce((best, idx) =>
    Math.abs(idx - center) < Math.abs(best - center) ? idx : best
  )
}

export default function InlineTextEditor({
  fileName, lineNumber, originalText, onSaved, onDismiss
}: InlineTextEditorProps) {
  const [value, setValue]   = useState(originalText)
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [realLine, setRealLine] = useState<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.select()
  }, [])

  // Resolve a linha real assim que o editor abre (para exibir no header)
  useEffect(() => {
    window.api.fs.readFile(fileName)
      .then((content: string) => {
        const lines = content.split('\n')
        const idx = findLineWithText(lines, originalText, lineNumber)
        setRealLine(idx === -1 ? lineNumber : idx + 1)
      })
      .catch(() => setRealLine(lineNumber))
  }, [fileName, originalText, lineNumber])

  const handleSave = async () => {
    if (!value.trim() || value === originalText) { onDismiss(); return }
    setSaving(true)
    setError(null)
    try {
      const content: string = await window.api.fs.readFile(fileName)
      const lines = content.split('\n')

      const foundIdx = findLineWithText(lines, originalText, lineNumber)

      if (foundIdx === -1) {
        throw new Error(
          `Texto "${originalText}" não encontrado no arquivo.\n` +
          `Tente editar o arquivo diretamente.`
        )
      }

      // Substitui SOMENTE a primeira ocorrência do texto na linha encontrada
      lines[foundIdx] = lines[foundIdx].replace(originalText, value)
      await window.api.fs.writeFile(fileName, lines.join('\n'))
      onSaved()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') onDismiss()
  }

  const shortName = fileName.split('/').slice(-3).join('/')
  const displayLine = realLine ?? lineNumber

  return (
    <div className="absolute bottom-14 left-1/2 -translate-x-1/2 z-50 animate-slide-up w-[500px] max-w-[90vw]">
      <div className="rounded-xl shadow-2xl shadow-amber-500/10 overflow-hidden" style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid rgba(245,158,11,0.3)' }}>
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--line)' }}>
          <div className="p-1 rounded-md bg-amber-500/10 shrink-0">
            <Pencil className="w-3 h-3 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] tx-muted">Editar texto em</p>
            <p className="text-[11px] font-mono tx-secondary truncate">
              {shortName}<span className="text-amber-400">:{displayLine}</span>
            </p>
          </div>
          <button onClick={onDismiss} className="btn-ghost p-1 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 py-3 space-y-2.5">
          {/* Original text preview */}
          <div className="flex items-start gap-2 rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--surface-base)' }}>
            <span className="text-[10px] tx-faint mt-0.5 shrink-0">Atual:</span>
            <span className="text-[11px] font-mono tx-muted break-all">{originalText}</span>
          </div>

          {/* New text input */}
          <input
            ref={inputRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Novo texto..."
            className="w-full rounded-lg px-3 py-2 text-sm outline-none font-sans transition"
            style={{ backgroundColor: 'var(--surface-base)', border: '1px solid var(--line)', color: 'var(--tx-primary)' }}
          />

          {error && (
            <div className="flex items-start gap-1.5 text-[11px] text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
              <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
              <span className="break-words">{error}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 pb-3">
          <p className="text-[10px] tx-faint">Enter para aplicar · Esc para cancelar</p>
          <div className="flex items-center gap-2">
            <button
              onClick={onDismiss}
              className="btn-ghost px-3 py-1.5 rounded-lg text-[11px] font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !value.trim() || value === originalText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/80 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-900 text-[11px] font-semibold transition"
            >
              {saving
                ? <span className="w-3 h-3 border-2 border-zinc-900/40 border-t-zinc-900 rounded-full animate-spin" />
                : <Check className="w-3 h-3" />
              }
              {saving ? 'Salvando...' : 'Aplicar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
