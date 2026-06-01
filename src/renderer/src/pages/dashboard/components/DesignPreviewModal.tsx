import { useState, useEffect } from 'react'
import { Palette, Check, Loader2, Brush, Sparkles, Eye } from 'lucide-react'
import ModalShell, { ModalHeader, ModalFooter } from '../../../components/layout/ModalShell'
import { DEFAULT_DESIGNS, DesignPalette } from '../../studio/utils/defaultDesigns'
import { parseCssVariables } from '../../studio/utils/cssParser'

interface DesignPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  /** Aplica a prévia ao vivo no app e fecha o modal (não-destrutivo). */
  onPreview: (palette: DesignPalette) => void
}

const studioSwatch = (root: Record<string, string>): string[] =>
  ['--background', '--primary', '--foreground']
    .map(k => root[k])
    .filter(Boolean)
    .map(v => `hsl(${v})`)

export default function DesignPreviewModal({ isOpen, onClose, onPreview }: DesignPreviewModalProps) {
  const [studioPalettes, setStudioPalettes] = useState<DesignPalette[]>([])
  const [loadingStudios, setLoadingStudios] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const allPalettes = [...DEFAULT_DESIGNS, ...studioPalettes]
  const selected = allPalettes.find(p => p.id === selectedId) || null

  useEffect(() => {
    if (!isOpen) return
    setSelectedId(null)
    loadStudios()
  }, [isOpen])

  const loadStudios = async () => {
    setLoadingStudios(true)
    try {
      const all = await window.api.projects.list()
      const studios = all.filter((p: any) => p.isStudio === true)
      const palettes: DesignPalette[] = []
      for (const s of studios) {
        try {
          const css = await window.api.fs.readFile(`${s.path}/frontend/src/index.css`)
          if (!css) continue
          const { root, dark } = parseCssVariables(css)
          if (!Object.keys(root).length) continue
          palettes.push({
            id: `studio:${s.id}`,
            name: s.name,
            description: s.description || 'Estúdio de design criado por você.',
            swatch: studioSwatch(root),
            root,
            dark: Object.keys(dark).length ? dark : root,
          })
        } catch {
          // ignora estúdio sem css legível
        }
      }
      setStudioPalettes(palettes)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingStudios(false)
    }
  }

  if (!isOpen) return null

  const PaletteCard = ({ p, builtin }: { p: DesignPalette; builtin: boolean }) => {
    const active = selectedId === p.id
    return (
      <button
        type="button"
        onClick={() => setSelectedId(p.id)}
        onDoubleClick={() => onPreview(p)}
        className={`text-left p-3 rounded-xl border transition-all duration-150 ${
          active ? 'border-blue-500 ring-1 ring-blue-500/40' : 'border-[var(--line)] hover:border-blue-500/40'
        }`}
        style={{ backgroundColor: 'var(--surface-overlay)' }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          {p.swatch.map((c, i) => (
            <span key={i} className="w-5 h-5 rounded-md border border-black/20" style={{ backgroundColor: c }} />
          ))}
          {active && <Check className="w-4 h-4 text-blue-400 ml-auto" />}
        </div>
        <div className="flex items-center gap-1.5">
          {builtin ? <Sparkles className="w-3 h-3 text-blue-400 shrink-0" /> : <Brush className="w-3 h-3 text-blue-400 shrink-0" />}
          <span className="text-xs font-bold tx-primary truncate">{p.name}</span>
        </div>
        <p className="text-[10px] tx-muted mt-1 line-clamp-2 leading-snug">{p.description}</p>
      </button>
    )
  }

  return (
    <ModalShell onClose={onClose} accentColor="#3b82f6" width="max-w-2xl">
      <ModalHeader
        icon={<Palette className="w-4 h-4 text-blue-400" />}
        title="Pré-visualizar Design"
        subtitle="Escolha uma paleta e clique em Pré-visualizar para ver como o app fica."
        onClose={onClose}
      />

      <div className="p-6 space-y-6 flex flex-col max-h-[520px] overflow-y-auto">
        {/* Designs prontos */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider tx-secondary">Designs Prontos</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DEFAULT_DESIGNS.map(p => <PaletteCard key={p.id} p={p} builtin />)}
          </div>
        </div>

        <div className="border-t border-[var(--line-subtle)]" />

        {/* Estúdios do usuário */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider tx-secondary">Meus Estúdios</h4>
          {loadingStudios ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            </div>
          ) : studioPalettes.length === 0 ? (
            <p className="text-xs tx-muted">
              Nenhum estúdio de design criado ainda. Crie um no menu “Estúdio de Design” para usá-lo como paleta.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {studioPalettes.map(p => <PaletteCard key={p.id} p={p} builtin={false} />)}
            </div>
          )}
        </div>
      </div>

      <ModalFooter>
        <button onClick={onClose} className="btn-ghost px-4 py-2 text-xs">
          Cancelar
        </button>
        <button
          onClick={() => selected && onPreview(selected)}
          disabled={!selected}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold disabled:opacity-40 transition"
        >
          <Eye className="w-4 h-4" /> Pré-visualizar
        </button>
      </ModalFooter>
    </ModalShell>
  )
}
