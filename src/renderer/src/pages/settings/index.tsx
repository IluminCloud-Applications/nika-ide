import { useState, useEffect } from 'react'
import { Folder, Save, Check, FolderOpen, HardDrive, Info, Cpu, Package } from 'lucide-react'
import SettingRow from './SettingRow'
import ThemeSelector, { Theme } from './ThemeSelector'
import faviconUrl from '../../assets/favicon.webp'

const LogoIcon = (props: React.HTMLAttributes<HTMLElement>) => (
  <img src={faviconUrl} alt="Logo" className={`${props.className || ''} object-contain`} />
)

interface SettingsPageProps {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export default function SettingsPage({ theme, setTheme }: SettingsPageProps) {
  const [workspacePath, setWorkspacePath] = useState('')
  const [saved, setSaved]               = useState(false)
  const [dirty, setDirty]               = useState(false)
  const [version, setVersion]           = useState('1.0.0')

  useEffect(() => {
    window.api.settings.get().then((s) => {
      if (s.workspacePath) setWorkspacePath(s.workspacePath)
    }).catch(() => {})

    window.api.system.getVersion().then((v) => {
      setVersion(v)
    }).catch(() => {})
  }, [])

  const handleSelectFolder = async () => {
    if (workspacePath) return
    const selected = await window.api.settings.selectWorkspace()
    if (selected) { setWorkspacePath(selected); setDirty(true) }
  }

  const handleSave = async () => {
    try {
      await window.api.settings.set({ workspacePath })
      setSaved(true)
      setDirty(false)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      alert('Erro ao salvar: ' + (err as Error).message)
    }
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem('app_theme', newTheme)
    window.api.settings.set({ app_theme: newTheme }).catch(console.error)
  }

  return (
    <div className="page-root">
      {/* Page header */}
      <div className="page-header">
        <div className="max-w-7xl mx-auto">
          <h1 className="page-title">Configurações</h1>
          <p className="page-subtitle">Preferências e informações do aplicativo.</p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="page-body">
        <div className="max-w-7xl w-full mx-auto space-y-8">

          {/* Theme section */}
          <div>
            <div className="section-label">
              <h2>Tema Visual</h2>
              <div className="divider" />
            </div>
            <p className="text-xs tx-muted mt-1 mb-3 leading-relaxed">
              Selecione sua paleta de cores favorita para o aplicativo.
            </p>
            <ThemeSelector currentTheme={theme} onChangeTheme={handleThemeChange} />
          </div>

          {/* Workspace section */}
          <div>
            <div className="section-label">
              <h2>Workspace</h2>
              <div className="divider" />
            </div>
            <div className="glass-panel rounded-xl overflow-hidden mt-3">
              <SettingRow
                icon={HardDrive}
                iconColor="text-blue-400"
                title="Pasta padrão de projetos"
                description="Novos projetos serão criados como subpastas aqui. O nome do projeto vira o slug da pasta."
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectFolder}
                    disabled={!!workspacePath}
                    className="btn-surface flex items-center gap-2 max-w-[240px] disabled:opacity-60 disabled:cursor-not-allowed"
                    title={workspacePath ? 'A pasta de projetos não pode ser alterada após a configuração inicial' : 'Selecionar pasta'}
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate font-mono tx-muted text-xs">
                      {workspacePath ? workspacePath.split('/').slice(-2).join('/') : 'Nenhuma pasta'}
                    </span>
                  </button>
                </div>
              </SettingRow>
            </div>
            {workspacePath && (
              <div className="flex items-center gap-2 mt-2 px-1">
                <Info className="w-3 h-3 tx-faint shrink-0" />
                <p className="text-[11px] tx-muted font-mono truncate">{workspacePath}</p>
              </div>
            )}
          </div>

          {/* About section */}
          <div>
            <div className="section-label">
              <h2>Sobre</h2>
              <div className="divider" />
            </div>
            <div className="glass-panel rounded-xl overflow-hidden mt-3">
              <SettingRow
                icon={LogoIcon}
                iconColor=""
                title="Nika IDE"
                description="IDE low-code com IA integrada para construção rápida de apps."
                noWrapper
              >
                <span className="badge" style={{ borderColor: 'var(--line)', color: 'var(--tx-muted)', backgroundColor: 'var(--surface-overlay)' }}>
                  v{version}
                </span>
              </SettingRow>
              <SettingRow
                icon={Cpu}
                iconColor="text-violet-400"
                title="Plataforma"
                description="Runtime do aplicativo desktop."
              >
                <span className="badge" style={{ borderColor: 'var(--line)', color: 'var(--tx-muted)', backgroundColor: 'var(--surface-overlay)' }}>
                  Electron
                </span>
              </SettingRow>
              <SettingRow
                icon={Package}
                iconColor="text-emerald-400"
                title="Frontend"
                description="Framework usado na interface do app."
              >
                <span className="badge" style={{ borderColor: 'var(--line)', color: 'var(--tx-muted)', backgroundColor: 'var(--surface-overlay)' }}>
                  React + Vite
                </span>
              </SettingRow>
              <SettingRow
                icon={Folder}
                iconColor="text-amber-400"
                title="Dados do usuário"
                description="Onde projetos, settings e ícones são armazenados localmente."
              >
                <button
                  onClick={() => window.api.system.openUrl('file://' + (window as any).__appDataPath || '')}
                  className="text-xs tx-muted hover:tx-secondary transition font-mono"
                >
                  userData/
                </button>
              </SettingRow>
            </div>
          </div>

        </div>
      </div>

      {/* Sticky save panel */}
      {dirty && (
        <div className="fixed bottom-6 right-6 animate-slide-up">
          <div className="glass-panel rounded-xl px-4 py-3 flex items-center gap-3 shadow-xl">
            <p className="text-xs tx-secondary">Alterações não salvas</p>
            <button onClick={handleSave} className="btn-primary">
              {saved ? <><Check className="w-3.5 h-3.5" /> Salvo!</> : <><Save className="w-3.5 h-3.5" /> Salvar</>}
            </button>
          </div>
        </div>
      )}

      {!dirty && saved && (
        <div className="fixed bottom-6 right-6 animate-slide-up">
          <div className="glass-panel rounded-xl px-4 py-3 flex items-center gap-2 shadow-xl border border-emerald-500/20 bg-emerald-500/5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <p className="text-xs text-emerald-400 font-medium">Configurações salvas!</p>
          </div>
        </div>
      )}
    </div>
  )
}
