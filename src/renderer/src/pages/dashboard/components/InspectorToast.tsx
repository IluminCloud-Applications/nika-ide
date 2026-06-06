import { useState, useRef, useEffect } from 'react'
import { FileCode, X, Copy, Check, Send, Tag, Type, Layout, Smile } from 'lucide-react'

interface InspectorPanelProps {
  fileName:      string
  componentName: string | null
  tagName:       string | null
  visibleText:   string | null
  cssClasses:    string | null
  htmlContent:   string | null
  onDismiss:     () => void
  onChangeIcon?: () => void
}

function buildPrompt(userPrompt: string, ctx: Omit<InspectorPanelProps, 'onDismiss'>): string {
  const relativePath = ctx.fileName !== 'Desconhecido' ? ctx.fileName.split('/').slice(-4).join('/') : null
  const lines: string[] = []

  if (userPrompt.trim()) lines.push(userPrompt.trim(), '')

  lines.push('# Contexto do Elemento')
  lines.push('')

  if (ctx.componentName) lines.push(`**Componente React:** \`${ctx.componentName}\``)
  if (ctx.tagName)       lines.push(`**Elemento HTML:** \`<${ctx.tagName}>\``)
  if (ctx.visibleText)   lines.push(`**Texto visível:** "${ctx.visibleText}"`)
  if (ctx.cssClasses)    lines.push(`**Classes CSS:** \`${ctx.cssClasses}\``)

  if (ctx.htmlContent) {
    lines.push('')
    lines.push('**Código HTML:**')
    lines.push('```html')
    lines.push(ctx.htmlContent)
    lines.push('```')
  }

  if (relativePath) {
    lines.push('')
    lines.push(`**Arquivo:** \`${relativePath}\``)
    lines.push(`**Caminho completo:** ${ctx.fileName}`)
  }

  return lines.join('\n')
}

export default function InspectorPanel({
  fileName, componentName, tagName, visibleText, cssClasses, htmlContent, onDismiss, onChangeIcon
}: InspectorPanelProps) {
  const [prompt, setPrompt] = useState('')
  const [copied, setCopied] = useState(false)
  const textareaRef         = useRef<HTMLTextAreaElement>(null)

  const shortName = fileName !== 'Desconhecido' ? fileName.split('/').slice(-3).join('/') : 'Elemento do DOM'
  const hasPrompt = prompt.trim().length > 0

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  const handleCopy = async () => {
    const text = buildPrompt(prompt, { fileName, componentName, tagName, visibleText, cssClasses, htmlContent })
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onDismiss()
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleCopy()
  }

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up w-[500px] max-w-[92vw]">
      <div className="rounded-xl shadow-2xl shadow-blue-500/10 overflow-hidden" style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid rgba(59,130,246,0.3)' }}>

        {/* Header — arquivo + componente */}
        <div className="flex items-start gap-2.5 px-4 py-3" style={{ borderBottom: '1px solid var(--line)' }}>
          <div className="p-1.5 rounded-lg bg-blue-500/10 shrink-0 mt-0.5">
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[10px] tx-muted">{fileName !== 'Desconhecido' ? 'Componente detectado' : 'Elemento inspecionado'}</p>
            <p className="text-[11px] font-mono tx-secondary truncate">{shortName}</p>

            {/* Tags de contexto */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {componentName && (
                <span className="flex items-center gap-1 text-[10px] font-medium bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                  <Layout className="w-2.5 h-2.5" />
                  {componentName}
                </span>
              )}
              {tagName && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full tx-muted" style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)' }}>
                  <Tag className="w-2.5 h-2.5" />
                  {'<'}{tagName}{'>'}
                </span>
              )}
              {visibleText && (
                <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/20 max-w-[200px] truncate">
                  <Type className="w-2.5 h-2.5 shrink-0" />
                  "{visibleText.slice(0, 40)}{visibleText.length > 40 ? '…' : ''}"
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="btn-ghost p-1 rounded-md shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Prompt input */}
        <div className="px-4 py-3 space-y-2">
          <label className="text-[10px] tx-muted font-medium">
            O que você quer modificar?
          </label>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              componentName
                ? `Ex: Mude a cor do ${tagName || 'elemento'} em ${componentName} para azul, altere o texto...`
                : `Ex: Mude a cor para azul, altere o texto, ajuste o padding...`
            }
            rows={3}
            className="w-full rounded-lg px-3 py-2 text-sm outline-none font-sans transition resize-none leading-relaxed"
            style={{ backgroundColor: 'var(--surface-base)', border: '1px solid var(--line)', color: 'var(--tx-primary)' }}
          />
        </div>

        {/* Preview do que será copiado */}
        {hasPrompt && (
          <div className="mx-4 mb-3 p-2.5 rounded-lg" style={{ backgroundColor: 'var(--surface-base)', border: '1px solid var(--line)' }}>
            <p className="text-[9px] tx-faint mb-1.5 uppercase tracking-wider">Preview do prompt</p>
            <pre className="text-[10px] tx-muted leading-relaxed whitespace-pre-wrap break-all font-mono max-h-20 overflow-y-auto">
              {buildPrompt(prompt, { fileName, componentName, tagName, visibleText, cssClasses, htmlContent })}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-4 pb-3">
          <p className="text-[10px] tx-faint">Ctrl+Enter para copiar · Esc para fechar</p>
          <div className="flex items-center gap-2">
            {onChangeIcon &&
              (tagName?.toLowerCase() === 'i' ||
                (cssClasses && cssClasses.split(/\s+/).some((c) => c.startsWith('ri-')))) && (
                <button
                  onClick={onChangeIcon}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition text-amber-400 bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20"
                >
                  <Smile className="w-3 h-3 text-amber-400" />
                  Alterar Ícone
                </button>
              )}
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition ${
                copied
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                  : hasPrompt
                    ? 'bg-blue-600 hover:bg-blue-500 text-white'
                    : 'editor-icon-btn'
              }`}
            >
              {copied
                ? <><Check className="w-3 h-3" /> Copiado!</>
                : hasPrompt
                  ? <><Send className="w-3 h-3" /> Copiar prompt</>
                  : <><Copy className="w-3 h-3" /> Copiar contexto</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
