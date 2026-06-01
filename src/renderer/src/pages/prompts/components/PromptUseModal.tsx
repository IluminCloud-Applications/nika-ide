import { useState, useEffect } from 'react'
import { Play, Copy, Check, Sparkles } from 'lucide-react'
import { PromptTemplate } from '../types'
import { extractVariables, compilePrompt } from '../utils/promptParser'
import ModalShell, { ModalHeader, ModalFooter, FieldLabel } from '../../../components/layout/ModalShell'

interface PromptUseModalProps {
  isOpen: boolean
  prompt: PromptTemplate | null
  onClose: () => void
}

export default function PromptUseModal({ isOpen, prompt, onClose }: PromptUseModalProps) {
  const [variables, setVariables] = useState<string[]>([])
  const [values, setValues]       = useState<Record<string, string>>({})
  const [compiled, setCompiled]   = useState('')
  const [copied, setCopied]       = useState(false)

  useEffect(() => {
    if (isOpen && prompt) {
      const vars = extractVariables(prompt.content)
      setVariables(vars)
      const init: Record<string, string> = {}
      vars.forEach(v => { init[v] = '' })
      setValues(init)
      setCompiled(prompt.content)
      setCopied(false)
    }
  }, [isOpen, prompt])

  useEffect(() => {
    if (prompt) setCompiled(compilePrompt(prompt.content, values))
  }, [values, prompt])

  if (!isOpen || !prompt) return null

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(compiled); setCopied(true); setTimeout(() => setCopied(false), 2000) }
    catch (err) { console.error('Falha ao copiar:', err) }
  }

  return (
    <ModalShell onClose={onClose} width="max-w-2xl">
      <ModalHeader
        icon={<Play className="w-4 h-4 text-blue-400" />}
        title={`Usar: ${prompt.name}`}
        subtitle={prompt.description || 'Preencha as variáveis e copie o resultado'}
        onClose={onClose}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5 min-h-0">
        {/* Variables */}
        {variables.length > 0 ? (
          <div className="space-y-3 rounded-xl p-4" style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider tx-muted flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-violet-400" /> Variáveis do Prompt
            </p>
            <div className="grid grid-cols-1 gap-3">
              {variables.map(variable => (
                <div key={variable} className="space-y-1">
                  <FieldLabel>{variable}</FieldLabel>
                  <input
                    value={values[variable] || ''}
                    onChange={e => setValues(prev => ({ ...prev, [variable]: e.target.value }))}
                    placeholder={`Valor para {{${variable}}}`}
                    className="input-field"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-xs tx-muted italic px-4 py-3 rounded-lg"
            style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line-subtle)' }}>
            Este prompt não possui variáveis — será copiado integralmente.
          </div>
        )}

        {/* Preview */}
        <div className="space-y-1.5">
          <FieldLabel>Resultado Compilado</FieldLabel>
          <textarea
            readOnly value={compiled}
            rows={8}
            className="input-field font-mono text-xs resize-none cursor-text select-text"
            style={{ backgroundColor: 'var(--surface-base)' }}
            onClick={e => (e.target as HTMLTextAreaElement).select()}
          />
        </div>
      </div>

      <ModalFooter>
        <button onClick={onClose} className="btn-ghost px-4 py-2">Fechar</button>
        <button onClick={handleCopy}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white transition shadow-lg ${
            copied ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/20'
          }`}
        >
          {copied ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Prompt</>}
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
