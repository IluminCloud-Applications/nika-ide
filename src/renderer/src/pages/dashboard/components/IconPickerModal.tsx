import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { X, Search, Smile } from 'lucide-react'
import iconNames from './remixicon-names.json'

interface IconPickerModalProps {
  currentIconClass: string | null
  onSelectIcon: (iconName: string) => void
  onDismiss: () => void
}

const PAGE_SIZE = 48
const INITIAL_SIZE = 96
const SCROLL_THRESHOLD = 150
const THROTTLE_MS = 150

export default function IconPickerModal({
  currentIconClass,
  onSelectIcon,
  onDismiss
}: IconPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [variantFilter, setVariantFilter] = useState<'line' | 'fill'>('line')
  const [visibleLimit, setVisibleLimit] = useState(INITIAL_SIZE)
  const inputRef = useRef<HTMLInputElement>(null)
  const isThrottled = useRef(false)
  const filteredCountRef = useRef(0)

  const activeIconName = useMemo(() => {
    if (!currentIconClass) return ''
    return currentIconClass.replace(/^ri-/, '')
  }, [currentIconClass])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Reseta paginação ao trocar filtro ou busca
  useEffect(() => {
    setVisibleLimit(INITIAL_SIZE)
  }, [searchQuery, variantFilter])

  const filteredIcons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const result = iconNames.filter((name) => {
      const isLine = name.endsWith('-line')
      const isFill = name.endsWith('-fill')
      const isUnique = !isLine && !isFill

      if (variantFilter === 'line' && !isLine && !isUnique) return false
      if (variantFilter === 'fill' && !isFill && !isUnique) return false
      if (query) return name.toLowerCase().includes(query)
      return true
    })
    filteredCountRef.current = result.length
    return result
  }, [searchQuery, variantFilter])

  const displayedIcons = useMemo(() => {
    return filteredIcons.slice(0, visibleLimit)
  }, [filteredIcons, visibleLimit])

  // useCallback para não recriar a função a cada render
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (isThrottled.current) return

    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    if (scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD) {
      if (visibleLimit < filteredCountRef.current) {
        isThrottled.current = true
        setVisibleLimit((prev) => Math.min(prev + PAGE_SIZE, filteredCountRef.current))
        setTimeout(() => {
          isThrottled.current = false
        }, THROTTLE_MS)
      }
    }
  }, [visibleLimit])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onDismiss() }}
    >
      <div
        className="w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col animate-slide-up"
        style={{
          backgroundColor: 'var(--surface-raised)',
          border: '1px solid var(--line)',
          height: '75vh',
          maxHeight: '600px'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Smile className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--tx-primary)]">
                Alterar Ícone
              </h3>
              <p className="text-[11px] tx-muted">
                {currentIconClass ? (
                  <span>
                    Substituir <code className="text-blue-400 px-1 bg-blue-500/10 rounded">{currentIconClass}</code>
                  </span>
                ) : (
                  'Selecione um ícone'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="btn-ghost p-1.5 rounded-lg text-zinc-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Tabs Toolbar */}
        <div className="px-6 pt-4 pb-3 flex-shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar ícones (ex: home, settings)..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg outline-none transition"
              style={{
                backgroundColor: 'var(--surface-base)',
                border: '1px solid var(--line)',
                color: 'var(--tx-primary)'
              }}
            />
          </div>

          <div className="flex gap-1.5 bg-black/15 p-1 rounded-lg border border-[var(--line)] shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setVariantFilter('line')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${
                variantFilter === 'line'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <i className="ri-checkbox-blank-line text-xs" /> Contorno
            </button>
            <button
              onClick={() => setVariantFilter('fill')}
              className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 ${
                variantFilter === 'fill'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <i className="ri-checkbox-blank-fill text-xs" /> Preenchido
            </button>
          </div>
        </div>

        {/* Icons Grid — contentVisibility no container, não nos itens */}
        <div
          className="px-4 pb-4 overflow-y-auto flex-1 scrollbar-thin"
          onScroll={handleScroll}
          style={{ willChange: 'scroll-position' }}
        >
          {displayedIcons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Smile className="w-10 h-10 text-zinc-600 mb-2.5" />
              <p className="text-sm text-zinc-400 font-medium">Nenhum ícone encontrado</p>
            </div>
          ) : (
            <>
              <div
                className="grid py-2"
                style={{
                  gridTemplateColumns: 'repeat(auto-fill, minmax(54px, 1fr))',
                  gap: '6px',
                  contentVisibility: 'auto',
                  containIntrinsicSize: `auto ${Math.ceil(displayedIcons.length / 10) * 60}px`
                }}
              >
                {displayedIcons.map((name) => {
                  const isActive = name === activeIconName
                  return (
                    <button
                      key={name}
                      onClick={() => onSelectIcon(`ri-${name}`)}
                      title={name}
                      className={`flex items-center justify-center rounded-lg aspect-square transition-colors ${
                        isActive
                          ? 'border border-blue-500 bg-blue-500/10 text-blue-400'
                          : 'border border-transparent hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                      }`}
                      style={{
                        backgroundColor: isActive ? undefined : 'var(--surface-base)'
                      }}
                    >
                      <i className={`ri-${name} text-2xl`} />
                    </button>
                  )
                })}
              </div>

              {filteredIcons.length > displayedIcons.length && (
                <div className="text-center py-3 text-[10px] text-zinc-500 font-medium">
                  {displayedIcons.length} de {filteredIcons.length} • role para carregar mais
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid var(--line)' }}
        >
          <span className="text-[10px] tx-faint">Remix Icon v4.9.1</span>
          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-[var(--tx-primary)] transition"
            style={{ backgroundColor: 'var(--surface-base)', border: '1px solid var(--line)' }}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
