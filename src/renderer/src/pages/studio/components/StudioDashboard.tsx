import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Terminal, Sliders, Moon, Sun, Download, ZoomIn, ZoomOut } from 'lucide-react'
import { Project } from '../../../App'
import StudioPreview from './StudioPreview'
import StudioManualControls from './StudioManualControls'
import TerminalDrawer from '../../dashboard/components/TerminalDrawer'
import ExportDesignModal from './ExportDesignModal'
import { parseCssVariables, injectStyles, generateCssFileContent } from '../utils/cssParser'
import { DESIGN_INSTRUCTIONS } from '../utils/designInstructions'

interface StudioDashboardProps {
  project: Project
  onBack: () => void
}

export default function StudioDashboard({ project, onBack }: StudioDashboardProps) {
  const [terminalOpen, setTerminalOpen] = useState(true)
  const [manualOpen, setManualOpen] = useState(true)
  const [isDark, setIsDark] = useState(true)
  const [exportOpen, setExportOpen] = useState(false)
  const [rawCss, setRawCss] = useState('')
  const [rootVars, setRootVars] = useState<Record<string, string>>({})
  const [darkVars, setDarkVars] = useState<Record<string, string>>({})
  const [zoom, setZoom] = useState(1)

  // Snapshot do tema original (primeira leitura) para o "Redefinir ao original".
  const originalVars = useRef<{ root: Record<string, string>; dark: Record<string, string> } | null>(null)

  // Instala as instruções do agente de estúdio ao abrir
  useEffect(() => {
    const geminiPath = `${project.path}/GEMINI.md`
    const claudePath = `${project.path}/CLAUDE.md`
    const agentsPath = `${project.path}/AGENTS.md`
    window.api.fs.writeFile(geminiPath, DESIGN_INSTRUCTIONS).catch(console.error)
    window.api.fs.writeFile(claudePath, DESIGN_INSTRUCTIONS).catch(console.error)
    window.api.fs.writeFile(agentsPath, DESIGN_INSTRUCTIONS).catch(console.error)
  }, [project.path])

  // Polling de leitura do index.css de 1.5s
  useEffect(() => {
    const cssPath = `${project.path}/frontend/src/index.css`
    const readCss = async () => {
      try {
        let content = await window.api.fs.readFile(cssPath)
        
        // Auto-inicializa com tema claro e escuro separados se não possuir a classe .dark
        if (content && !content.includes('.dark')) {
          const initialTemplate = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
    --radius: 0.5rem;
    --studio-spacing: 1rem;
    --scrollbar-width: 6px;
    --scrollbar-thumb: 240 5.9% 90%;
    --scrollbar-track: 0 0% 100%;
  }
  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
    --radius: 0.5rem;
    --studio-spacing: 1rem;
    --scrollbar-width: 6px;
    --scrollbar-thumb: 240 3.7% 15.9%;
    --scrollbar-track: 240 10% 3.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: var(--scrollbar-width, 6px);
    height: var(--scrollbar-width, 6px);
  }
  ::-webkit-scrollbar-track {
    background: hsl(var(--scrollbar-track, var(--background)));
  }
  ::-webkit-scrollbar-thumb {
    background: hsl(var(--scrollbar-thumb, var(--border)));
    border-radius: 9999px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: hsl(var(--primary));
  }
}`
          await window.api.fs.writeFile(cssPath, initialTemplate)
          content = initialTemplate
        }

        if (content && content !== rawCss) {
          setRawCss(content)
          const { root, dark } = parseCssVariables(content)
          // Guarda o tema original apenas na primeira leitura válida.
          if (!originalVars.current) {
            originalVars.current = { root: { ...root }, dark: { ...dark } }
          }
          setRootVars(root)
          setDarkVars(dark)
          injectStyles(root, dark)
        }
      } catch (err) {
        // Ignora erros temporários de leitura
      }
    }

    readCss()
    const timer = setInterval(readCss, 1500)
    return () => clearInterval(timer)
  }, [project.path, rawCss])

  // Tokens que valem para o tema inteiro (não dependem de light/dark).
  const GLOBAL_KEYS = ['--radius', '--studio-spacing', '--scrollbar-width']

  // Salva alterações manuais no arquivo index.css
  const handleSaveManual = async (updatedVars: Record<string, string>, isDarkMode: boolean) => {
    // Separa os tokens globais (raio/espaçamento) das cores específicas do modo.
    const globalVars: Record<string, string> = {}
    const modeVars: Record<string, string> = {}
    Object.entries(updatedVars).forEach(([k, v]) => {
      if (GLOBAL_KEYS.includes(k)) globalVars[k] = v
      else modeVars[k] = v
    })

    // Globais entram em root e dark; cores apenas no modo atual.
    const nextRoot = { ...rootVars, ...globalVars, ...(isDarkMode ? {} : modeVars) }
    const nextDark = { ...darkVars, ...globalVars, ...(isDarkMode ? modeVars : {}) }

    setRootVars(nextRoot)
    setDarkVars(nextDark)
    injectStyles(nextRoot, nextDark)

    const css = generateCssFileContent(nextRoot, nextDark)
    const cssPath = `${project.path}/frontend/src/index.css`
    try {
      await window.api.fs.writeFile(cssPath, css)
      setRawCss(css)
    } catch (err) {
      alert('Erro ao gravar index.css: ' + (err as Error).message)
    }
  }

  // Restaura o tema original capturado ao abrir o estúdio.
  const handleResetToOriginal = async () => {
    if (!originalVars.current) return
    if (!confirm('Redefinir todas as cores e o layout para o tema original?')) return

    const { root, dark } = originalVars.current
    const nextRoot = { ...root }
    const nextDark = { ...dark }

    setRootVars(nextRoot)
    setDarkVars(nextDark)
    injectStyles(nextRoot, nextDark)

    const css = generateCssFileContent(nextRoot, nextDark)
    const cssPath = `${project.path}/frontend/src/index.css`
    try {
      await window.api.fs.writeFile(cssPath, css)
      setRawCss(css)
    } catch (err) {
      alert('Erro ao gravar index.css: ' + (err as Error).message)
    }
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[var(--surface-base)] text-[var(--tx-primary)] select-none">
      {/* Header */}
      <header className="h-14 shrink-0 px-4 border-b border-[var(--line)] flex items-center justify-between" style={{ backgroundColor: 'var(--surface-raised)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn-ghost p-1.5 rounded-lg" title="Voltar para Estúdios">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold tx-primary flex items-center gap-1.5">Estúdio: {project.name}</h2>
            <p className="text-[10px] tx-muted">Modo Estúdio e Protótipo de Design Visual</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsDark(!isDark)} className="btn-surface px-3 py-1.5 text-xs flex items-center gap-1.5">
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
            {isDark ? 'Visualizar Claro' : 'Visualizar Escuro'}
          </button>
          <button onClick={() => setManualOpen(!manualOpen)} className={`btn-surface px-3 py-1.5 text-xs flex items-center gap-1.5 ${manualOpen ? 'bg-blue-600/20 text-blue-400' : ''}`}>
            <Sliders className="w-3.5 h-3.5" /> Ajustes Manuais
          </button>
          <button onClick={() => setTerminalOpen(!terminalOpen)} className={`btn-surface px-3 py-1.5 text-xs flex items-center gap-1.5 ${terminalOpen ? 'bg-blue-600/20 text-blue-400' : ''}`}>
            <Terminal className="w-3.5 h-3.5" /> IA Terminal
          </button>
          <button onClick={() => setExportOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow">
            <Download className="w-3.5 h-3.5" /> Exportar Design
          </button>
        </div>
      </header>

      {/* Main workspace area */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Preview Panel */}
        <div className="flex-1 flex flex-col min-h-0 bg-[var(--surface-base)]">
          {/* Viewport toolbar (zoom) */}
          <div className="h-10 shrink-0 px-4 flex items-center justify-center gap-1.5 border-b border-[var(--line-subtle)]" style={{ backgroundColor: 'var(--surface-raised)' }}>
            <button onClick={() => setZoom(z => Math.max(0.4, +(z - 0.1).toFixed(2)))} className="btn-ghost p-1 rounded" title="Diminuir">
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <input
              type="range"
              min="0.4"
              max="1"
              step="0.05"
              value={zoom}
              onChange={e => setZoom(+e.target.value)}
              className="w-40 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <button onClick={() => setZoom(z => Math.min(1, +(z + 0.1).toFixed(2)))} className="btn-ghost p-1 rounded" title="Aumentar">
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono tx-muted w-9 text-center tabular-nums">{Math.round(zoom * 100)}%</span>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto p-6 flex justify-center bg-[var(--surface-base)]">
            <div
              className="w-full rounded-xl border border-[var(--line)] overflow-hidden shadow-2xl bg-[var(--surface-raised)]"
              style={{
                height: '100%',
                transform: `scale(${zoom})`,
                transformOrigin: 'top center'
              }}
            >
              <StudioPreview isDark={isDark} />
            </div>
          </div>
        </div>

        {/* Manual Adjustments Panel */}
        {manualOpen && (
          <StudioManualControls
            rootVars={rootVars}
            darkVars={darkVars}
            isDark={isDark}
            onSave={handleSaveManual}
            onReset={handleResetToOriginal}
          />
        )}

        {/* Terminal Drawer */}
        <TerminalDrawer projectPath={project.path} isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
      </div>

      <ExportDesignModal isOpen={exportOpen} onClose={() => setExportOpen(false)} projectPath={project.path} rootVars={rootVars} darkVars={darkVars} />
    </div>
  )
}
