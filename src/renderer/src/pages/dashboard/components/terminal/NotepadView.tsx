import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Copy, Send, Check, ChevronDown, Coins } from 'lucide-react'
import { Tab } from './TerminalTabs'
import { estimateTokens, formatNumber } from '@/utils/textStats'

interface NotepadViewProps {
  noteId: string
  projectPath: string
  terminalTabs: Tab[]
  onSendToTerminal: (terminalId: string, text: string) => void
  onSelectTab: (tabId: string) => void
}

function getStorageKey(projectPath: string, noteId: string) {
  return `note:${projectPath}:${noteId}`
}

export default function NotepadView({
  noteId, projectPath, terminalTabs, onSendToTerminal, onSelectTab
}: NotepadViewProps) {
  const [content, setContent] = useState('')
  const [copied, setCopied] = useState(false)
  const [showTerminalPicker, setShowTerminalPicker] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Calculate statistics (chars and tokens) dynamically
  const stats = useMemo(() => ({
    chars: content.length,
    tokens: estimateTokens(content)
  }), [content])

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(getStorageKey(projectPath, noteId))
    if (saved) setContent(saved)
  }, [noteId, projectPath])

  // Auto-save to localStorage on change (debounced)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback((value: string) => {
    setContent(value)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem(getStorageKey(projectPath, noteId), value)
    }, 300)
  }, [projectPath, noteId])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current) }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleSendToTerminal = (terminalId: string) => {
    if (content.trim()) {
      const targetTab = terminalTabs.find(t => t.terminalId === terminalId)
      if (targetTab) {
        onSelectTab(targetTab.id)
      }
      onSendToTerminal(terminalId, content)
      setShowTerminalPicker(false)
    }
  }

  const availableTerminals = terminalTabs.filter(t => t.type === 'terminal' && t.terminalId)

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Notepad editor */}
      <div className="flex-1 p-2 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={e => handleChange(e.target.value)}
          placeholder="Escreva suas anotações aqui... O conteúdo é salvo automaticamente."
          className="w-full h-full p-3 rounded-lg outline-none font-mono text-xs leading-relaxed resize-none overflow-y-auto transition-colors focus:ring-1 focus:ring-amber-500/20"
          style={{
            backgroundColor: 'var(--surface-base)',
            border: '1px solid var(--line)',
            color: 'var(--tx-primary)',
          }}
          spellCheck={false}
        />
      </div>

      {/* Actions bar */}
      <div className="px-2 pb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[10px] tx-faint font-medium">
          {stats.chars > 0 ? (
            <>
              <span>{formatNumber(stats.chars)} chars</span>
              <div className="divider-y h-2.5" />
              <div className="flex items-center gap-1" title="Tokens estimados (aprox. BPE)">
                <Coins className="w-3 h-3 text-blue-400/70" />
                <span className="text-blue-400/80">~{formatNumber(stats.tokens)} tokens</span>
              </div>
            </>
          ) : (
            <span>Vazio</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Copy button */}
          <button
            onClick={handleCopy}
            disabled={!content.trim()}
            className="btn-surface flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium disabled:opacity-40"
            title="Copiar texto"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copiado!' : 'Copiar'}
          </button>

          {/* Send to AI / Terminal */}
          <div className="relative">
            <button
              onClick={() => {
                if (availableTerminals.length === 1) {
                  handleSendToTerminal(availableTerminals[0].terminalId!)
                } else {
                  setShowTerminalPicker(!showTerminalPicker)
                }
              }}
              disabled={!content.trim() || availableTerminals.length === 0}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 text-[11px] font-semibold disabled:opacity-40 transition-all"
              title={availableTerminals.length === 0 ? 'Abra um terminal primeiro' : 'Enviar para IA'}
            >
              <Send className="w-3 h-3" />
              Enviar para IA
              {availableTerminals.length > 1 && <ChevronDown className="w-2.5 h-2.5" />}
            </button>

            {/* Terminal picker dropdown */}
            {showTerminalPicker && availableTerminals.length > 1 && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTerminalPicker(false)} />
                <div className="absolute bottom-full right-0 mb-1 w-44 editor-dropdown z-50 py-1 animate-fade-in">
                  <span className="px-3 py-1.5 text-[10px] tx-muted font-semibold uppercase tracking-wider block">
                    Selecionar terminal
                  </span>
                  {availableTerminals.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleSendToTerminal(t.terminalId!)}
                      className="editor-dropdown-item"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      {t.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
