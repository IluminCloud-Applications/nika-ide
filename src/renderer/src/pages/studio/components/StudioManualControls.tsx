import { useState, useEffect, useRef } from 'react'
import { RotateCcw, Palette, Ruler, Check } from 'lucide-react'

interface StudioManualControlsProps {
  rootVars: Record<string, string>
  darkVars: Record<string, string>
  isDark: boolean
  onSave: (variables: Record<string, string>, isDarkMode: boolean) => void
  onReset: () => void
}

// Converte HEX para string HSL formatada "H S% L%"
function hexToHsl(hex: string): string {
  hex = hex.replace(/^#/, '')
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

// Converte string HSL formatada "H S% L%" de volta para HEX
function hslToHex(hslStr: string): string {
  const parts = hslStr.trim().split(/\s+/)
  if (parts.length < 3) return '#ffffff'
  const h = parseInt(parts[0]) / 360
  const s = parseInt(parts[1].replace('%', '')) / 100
  const l = parseInt(parts[2].replace('%', '')) / 100

  let r, g, b
  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  const toHex = (c: number) => Math.round(c * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Lista declarativa dos tokens de cor editáveis no estúdio.
const COLOR_FIELDS: { key: string; label: string }[] = [
  { key: '--background', label: 'Fundo da Tela' },
  { key: '--foreground', label: 'Texto Principal' },
  { key: '--card', label: 'Fundo de Cards' },
  { key: '--card-foreground', label: 'Texto de Cards' },
  { key: '--primary', label: 'Cor Primária' },
  { key: '--primary-foreground', label: 'Texto Primário' },
  { key: '--secondary', label: 'Cor Secundária' },
  { key: '--secondary-foreground', label: 'Texto Secundário' },
  { key: '--accent', label: 'Destaque (Hover)' },
  { key: '--muted-foreground', label: 'Texto Suave' },
  { key: '--border', label: 'Cor de Bordas' },
  { key: '--ring', label: 'Foco (Ring)' },
  { key: '--scrollbar-thumb', label: 'Scrollbar (Miniatura)' },
  { key: '--scrollbar-track', label: 'Scrollbar (Trilho)' }
]

// IMPORTANTE: definido em escopo de módulo. Se ficasse dentro do componente,
// cada render recriaria o tipo e o React remontaria o <input type="color">,
// fechando o seletor nativo de cor no primeiro onChange.
function ColorInput({ label, val, onChange }: { label: string; val: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between p-1.5 rounded-lg bg-[var(--surface-overlay)] border border-[var(--line)]">
      <span className="text-xs font-medium tx-secondary">{label}</span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={val}
          onChange={e => onChange(e.target.value)}
          className="w-6 h-6 rounded cursor-pointer border-0 p-0 overflow-hidden bg-transparent"
        />
        <span className="text-[10px] font-mono tx-muted">{val.toUpperCase()}</span>
      </div>
    </div>
  )
}

export default function StudioManualControls({ rootVars, darkVars, isDark, onSave, onReset }: StudioManualControlsProps) {
  const currentVars = isDark ? darkVars : rootVars
  const [colors, setColors] = useState<Record<string, string>>({})
  const [radius, setRadius] = useState('0.5rem')
  const [spacing, setSpacing] = useState('1rem')
  const [scrollbarWidth, setScrollbarWidth] = useState('6px')
  const [savedFlash, setSavedFlash] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const flashTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Sincroniza os controles quando o CSS é (re)carregado do arquivo.
  useEffect(() => {
    const next: Record<string, string> = {}
    COLOR_FIELDS.forEach(f => {
      if (currentVars[f.key]) next[f.key] = hslToHex(currentVars[f.key])
    })
    setColors(next)
    if (currentVars['--radius']) setRadius(currentVars['--radius'])
    if (currentVars['--studio-spacing']) setSpacing(currentVars['--studio-spacing'])
    if (currentVars['--scrollbar-width']) setScrollbarWidth(currentVars['--scrollbar-width'])
  }, [currentVars, isDark])

  useEffect(() => () => {
    clearTimeout(saveTimer.current)
    clearTimeout(flashTimer.current)
  }, [])

  // Aplica e grava automaticamente (debounce), sem precisar de botão.
  const scheduleSave = (c: Record<string, string>, r: string, s: string, sw: string) => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const updated: Record<string, string> = {}
      COLOR_FIELDS.forEach(f => {
        if (c[f.key]) updated[f.key] = hexToHsl(c[f.key])
      })
      updated['--radius'] = r
      updated['--studio-spacing'] = s
      updated['--scrollbar-width'] = sw
      onSave(updated, isDark)
      setSavedFlash(true)
      clearTimeout(flashTimer.current)
      flashTimer.current = setTimeout(() => setSavedFlash(false), 1200)
    }, 250)
  }

  const setColor = (key: string, v: string) => {
    const next = { ...colors, [key]: v }
    setColors(next)
    scheduleSave(next, radius, spacing, scrollbarWidth)
  }

  const handleRadius = (v: string) => {
    setRadius(v)
    scheduleSave(colors, v, spacing, scrollbarWidth)
  }

  const handleSpacing = (v: string) => {
    setSpacing(v)
    scheduleSave(colors, radius, v, scrollbarWidth)
  }

  const handleScrollbarWidth = (v: string) => {
    setScrollbarWidth(v)
    scheduleSave(colors, radius, spacing, v)
  }

  return (
    <div className="flex flex-col h-full bg-[var(--surface-raised)] border-l border-[var(--line)] w-72 shrink-0">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--line-subtle)]">
        <div className="flex flex-col gap-0.5">
          <h3 className="text-xs font-bold uppercase tracking-wider tx-primary">Ajustes Manuais</h3>
          <span className={`text-[10px] flex items-center gap-1 transition-colors ${savedFlash ? 'text-emerald-400' : 'tx-faint'}`}>
            <Check className="w-2.5 h-2.5" /> {savedFlash ? 'Salvo automaticamente' : 'Alterações salvam sozinhas'}
          </span>
        </div>
        <span className="text-[10px] bg-blue-500/10 text-blue-400 font-semibold px-2 py-0.5 rounded-full shrink-0">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider tx-muted">
            <Palette className="w-3 h-3" /> Cores do Tema
          </div>
          {COLOR_FIELDS.map(f => (
            <ColorInput
              key={f.key}
              label={f.label}
              val={colors[f.key] || '#888888'}
              onChange={v => setColor(f.key, v)}
            />
          ))}
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider tx-muted">
            <Ruler className="w-3 h-3" /> Layout & Espaçamento
          </div>

          {/* Radius Slider */}
          <div className="p-3 rounded-lg bg-[var(--surface-overlay)] border border-[var(--line)] space-y-2">
            <div className="flex justify-between text-xs font-medium tx-secondary">
              <span>Arredondamento</span>
              <span className="font-mono text-[10px] text-blue-400">{radius}</span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={parseFloat(radius) || 0}
              onChange={e => handleRadius(`${e.target.value}rem`)}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Spacing Slider */}
          <div className="p-3 rounded-lg bg-[var(--surface-overlay)] border border-[var(--line)] space-y-2">
            <div className="flex justify-between text-xs font-medium tx-secondary">
              <span>Espaçamento (Grid)</span>
              <span className="font-mono text-[10px] text-blue-400">{spacing}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.25"
              value={parseFloat(spacing) || 1}
              onChange={e => handleSpacing(`${e.target.value}rem`)}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          {/* Scrollbar Thickness Slider */}
          <div className="p-3 rounded-lg bg-[var(--surface-overlay)] border border-[var(--line)] space-y-2">
            <div className="flex justify-between text-xs font-medium tx-secondary">
              <span>Espessura da Scrollbar</span>
              <span className="font-mono text-[10px] text-blue-400">{scrollbarWidth}</span>
            </div>
            <input
              type="range"
              min="2"
              max="16"
              step="1"
              value={parseInt(scrollbarWidth) || 6}
              onChange={e => handleScrollbarWidth(`${e.target.value}px`)}
              className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[var(--line-subtle)]">
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 w-full py-2 bg-[var(--surface-overlay)] hover:bg-white/5 hover:text-red-400 border border-[var(--line)] tx-secondary rounded-lg text-xs font-semibold transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Redefinir ao original
        </button>
      </div>
    </div>
  )
}
