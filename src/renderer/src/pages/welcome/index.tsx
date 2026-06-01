import { useState } from 'react'
import { Sparkles, ArrowRight, FolderOpen, Zap, Laptop, Palette, ArrowLeft } from 'lucide-react'
import faviconUrl from '../../assets/favicon.webp'
import ThemeSelector, { Theme } from '../settings/ThemeSelector'

interface WelcomePageProps {
  onComplete: () => void
  theme: Theme
  setTheme: (theme: Theme) => void
}

export default function WelcomePage({ onComplete, theme, setTheme }: WelcomePageProps) {
  const [step, setStep] = useState(0)
  const [workspacePath, setWorkspacePath] = useState('')

  const handleSelectWorkspace = async () => {
    try {
      const selected = await window.api.settings.selectWorkspace()
      if (selected) {
        setWorkspacePath(selected)
        await window.api.settings.set({ workspacePath: selected })
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#09090b] relative overflow-y-auto px-6 py-8 min-h-screen">
      {/* Background gradients */}
      <div className="absolute top-[15%] left-[15%] w-[45vw] h-[45vw] rounded-full bg-blue-500/5 blur-[180px] animate-pulse-subtle pointer-events-none" />
      <div className="absolute bottom-[15%] right-[15%] w-[45vw] h-[45vw] rounded-full bg-purple-500/5 blur-[180px] animate-pulse-subtle pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-3xl glass-panel p-8 md:p-10 rounded-2xl shadow-glass flex flex-col space-y-6 md:space-y-8 z-10 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <img src={faviconUrl} alt="Logo" className="w-5 h-5 object-contain" />
            <span className="font-bold text-zinc-300 text-sm tracking-wide">Nika IDE</span>
          </div>
          <div className="flex gap-1.5">
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 0 ? 'w-8 bg-blue-500' : 'w-2 bg-zinc-700'}`} />
            <div className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-blue-500' : 'w-2 bg-zinc-700'}`} />
          </div>
        </div>

        {step === 0 ? (
          /* Step 0: Presentation & Copywriting Benefits */
          <div className="flex flex-col items-center text-center space-y-6 py-2">
            <div className="space-y-3">
              <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent tracking-tight">
                Liberte sua Criatividade com o Nika IDE
              </h2>
              <p className="text-zinc-400 text-sm max-w-xl mx-auto leading-relaxed">
                Diga adeus à lentidão e ao desperdício de tokens no VSCode comum. O primeiro ambiente planejado sob medida para Claude Code, Antigravity e Codex CLI.
              </p>
            </div>

            {/* Grid of benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left pt-2">
              <div className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/30 hover:bg-zinc-900/50 transition flex gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 h-fit">
                  <Zap className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider">Economize Tokens</h4>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                    A AI não recria componentes de UI. Com componentes pré-configurados, ela apenas importa e usa, diminuindo drasticamente seu consumo de tokens.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/30 hover:bg-zinc-900/50 transition flex gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0 h-fit">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider">Construa 5x Mais Rápido</h4>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                    Crie novos projetos com frontend (React) e backend (Python/Docker) prontos. Edite visualmente e veja os resultados em tempo real.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/30 hover:bg-zinc-900/50 transition flex gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0 h-fit">
                  <Laptop className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider">Terminais com 1 Clique</h4>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                    Inicie Claude Code, Antigravity CLI e Codex CLI nativamente no painel lateral. Gerencie tudo de forma organizada em abas.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800/60 bg-zinc-900/30 hover:bg-zinc-900/50 transition flex gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0 h-fit">
                  <Palette className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-zinc-200 text-xs uppercase tracking-wider">Gestão Descomplicada</h4>
                  <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                    Organize MCPs, prompts personalizados, skills e agentes direto de uma interface limpa, intuitiva e feita para alta produtividade.
                  </p>
                </div>
              </div>
            </div>

            {/* Step navigation */}
            <div className="w-full flex justify-end pt-4 border-t border-zinc-800/60">
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg hover:shadow-blue-500/25 transition duration-200"
              >
                Configurar Meu IDE <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Step 1: Workspace and Theme setup */
          <div className="flex flex-col space-y-6">
            <div className="text-center space-y-1.5">
              <h3 className="text-xl font-bold text-zinc-100">Personalize seu Ambiente</h3>
              <p className="text-zinc-400 text-xs">
                Selecione o seu tema favorito e a pasta onde seus projetos serão criados.
              </p>
            </div>

            {/* Folder Select */}
            <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">Pasta Padrão de Projetos</h4>
                  <p className="text-zinc-500 text-[11px] mt-0.5">Seus novos projetos serão criados e estruturados nessa pasta.</p>
                </div>
                <button
                  type="button"
                  onClick={handleSelectWorkspace}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg text-xs text-zinc-300 font-medium transition"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                  {workspacePath ? 'Alterar Pasta' : 'Selecionar Pasta'}
                </button>
              </div>
              {workspacePath ? (
                <div className="text-xs bg-[#09090b] border border-zinc-800/80 p-2.5 rounded-md font-mono text-zinc-400 break-all select-all">
                  {workspacePath}
                </div>
              ) : (
                <div className="text-xs border border-dashed border-zinc-800 p-3 rounded-md text-zinc-500 text-center font-medium">
                  Nenhuma pasta selecionada. Clique em "Selecionar Pasta" para continuar.
                </div>
              )}
            </div>

            {/* Theme Select */}
            <div className="space-y-2">
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Tema Visual</h4>
                <p className="text-zinc-500 text-[11px] mt-0.5">Mude a cara do Nika IDE instantaneamente.</p>
              </div>
              <ThemeSelector currentTheme={theme} onChangeTheme={setTheme} />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/60">
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition text-xs font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar
              </button>
              <button
                onClick={onComplete}
                disabled={!workspacePath}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-850 disabled:text-zinc-650 disabled:border-zinc-800 text-white text-sm font-semibold shadow-lg hover:shadow-blue-500/25 transition duration-200"
              >
                <Sparkles className="w-4 h-4" /> Entrar no Nika IDE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
