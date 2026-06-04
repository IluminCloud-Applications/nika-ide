import { useState, useEffect } from 'react'
import WelcomePage from './pages/welcome'
import ProjectsPage from './pages/projects'
import DashboardPage from './pages/dashboard'
import SettingsPage from './pages/settings'
import SkillsPage from './pages/skills'
import StatusPage from './pages/status'
import McpPage from './pages/mcp'
import AgentsPage from './pages/agents'
import PromptsPage from './pages/prompts'
import DocsPage from './pages/docs'
import DockerPage from './pages/docker'
import AppSidebar, { NavRoute } from './components/layout/AppSidebar'
import { Theme } from './pages/settings/ThemeSelector'
import StudioPage from './pages/studio'
import StudioDashboard from './pages/studio/components/StudioDashboard'
import { TerminalProvider, useTerminalContext } from './context/TerminalContext'
import FloatingTerminalWidget from './components/terminal/FloatingTerminalWidget'
import TerminalDrawer from './pages/dashboard/components/TerminalDrawer'

export type ProjectStatus = 'draft' | 'published' | 'modified'

export interface Project {
  id: string
  name: string
  description: string
  color: string
  path: string
  imagePath?: string
  status: ProjectStatus
  publishedHash?: string
  createdAt: string
  imported?: boolean
  isStudio?: boolean
}

export default function App() {
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'welcome' | 'main' | 'dashboard' | 'studio'>('main')
  const [mainRoute, setMainRoute] = useState<NavRoute>('projects')
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [openProjects, setOpenProjects] = useState<Project[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const THEMES: Theme[] = ['dark', 'light', 'obsidian', 'notion', 'nord', 'typewriter', 'nika', 'nika-light']

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app_theme') as Theme
    return THEMES.includes(saved) ? saved : 'dark'
  })

  const toggleTheme = () => {
    setTheme(prev => {
      const next = THEMES[(THEMES.indexOf(prev) + 1) % THEMES.length]
      localStorage.setItem('app_theme', next)
      window.api.settings.set({ app_theme: next }).catch(console.error)
      return next
    })
  }

  useEffect(() => {
    window.api.settings.get().then((s) => {
      if (s) {
        Object.entries(s).forEach(([key, val]) => {
          if (typeof val === 'string') {
            localStorage.setItem(key, val)
          } else {
            localStorage.setItem(key, JSON.stringify(val))
          }
        })
      }

      const savedTheme = localStorage.getItem('app_theme') as Theme
      if (savedTheme && THEMES.includes(savedTheme)) {
        setTheme(savedTheme)
      }

      const tutorialDone = localStorage.getItem('tutorial_done')
      if (!tutorialDone && !s.workspacePath) {
        setView('welcome')
      } else {
        if (s.workspacePath) {
          localStorage.setItem('tutorial_done', 'true')
          window.api.settings.set({ tutorial_done: 'true' }).catch(console.error)
        }
        setView('main')
      }
      setLoading(false)
    }).catch(() => {
      const tutorialDone = localStorage.getItem('tutorial_done')
      setView(tutorialDone ? 'main' : 'welcome')
      setLoading(false)
    })
  }, [])

  const handleTutorialComplete = () => {
    localStorage.setItem('tutorial_done', 'true')
    window.api.settings.set({ tutorial_done: 'true' }).catch(console.error)
    setView('main')
  }

  const handleSelectProject = (project: Project) => {
    window.api.projects.open(project.path)
    setCurrentProject(project)
    setOpenProjects(prev => {
      if (prev.some(p => p.id === project.id)) return prev
      return [...prev, project]
    })
    setActiveProjectId(project.id)
    setView('dashboard')
  }

  const handleSelectStudio = (project: Project) => {
    window.api.projects.open(project.path)
    setCurrentProject(project)
    setView('studio')
  }

  const handleBackToProjects = () => {
    const wasStudio = currentProject?.isStudio
    setCurrentProject(null)
    setOpenProjects([])
    setActiveProjectId(null)
    setView('main')
    setMainRoute(wasStudio ? 'studio' : 'projects')
  }

  const handleCloseProjectTab = (projectId: string) => {
    setOpenProjects(prev => {
      const remaining = prev.filter(p => p.id !== projectId)
      if (remaining.length === 0) {
        setView('main')
        setMainRoute('projects')
        setActiveProjectId(null)
        setCurrentProject(null)
      } else if (activeProjectId === projectId) {
        const newActive = remaining[remaining.length - 1]
        setActiveProjectId(newActive.id)
        setCurrentProject(newActive)
      }
      return remaining
    })
  }

  const handleReopenProjectByPath = async (projectPath: string, terminalTabId?: string) => {
    try {
      const all = await window.api.projects.list()
      const project = all.find(p => p.path === projectPath)
      if (project) {
        if (project.isStudio) {
          handleSelectStudio(project)
        } else {
          handleSelectProject(project)
        }
        if (terminalTabId) {
          localStorage.setItem(`terminal_drawer_active_tab:${projectPath}`, terminalTabId)
        }
      }
    } catch (err) {
      console.error('Erro ao reabrir projeto do widget flutuante:', err)
    }
  }

  if (loading) {
    return <div className="h-screen w-screen bg-[#09090b]" />
  }

  return (
    <TerminalProvider reopenProject={handleReopenProjectByPath}>
      <AppContent
        theme={theme}
        setTheme={setTheme}
        toggleTheme={toggleTheme}
        handleTutorialComplete={handleTutorialComplete}
        handleSelectProject={handleSelectProject}
        handleSelectStudio={handleSelectStudio}
        handleBackToProjects={handleBackToProjects}
        openProjects={openProjects}
        activeProjectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        handleCloseProjectTab={handleCloseProjectTab}
        view={view}
        mainRoute={mainRoute}
        setMainRoute={setMainRoute}
        currentProject={currentProject}
      />
    </TerminalProvider>
  )
}

function AppContent({
  theme,
  setTheme,
  toggleTheme,
  handleTutorialComplete,
  handleSelectProject,
  handleSelectStudio,
  handleBackToProjects,
  openProjects,
  activeProjectId,
  setActiveProjectId,
  handleCloseProjectTab,
  view,
  mainRoute,
  setMainRoute,
  currentProject
}: {
  theme: Theme
  setTheme: (t: Theme) => void
  toggleTheme: () => void
  handleTutorialComplete: () => void
  handleSelectProject: (project: Project) => void
  handleSelectStudio: (project: Project) => void
  handleBackToProjects: () => void
  openProjects: Project[]
  activeProjectId: string | null
  setActiveProjectId: (id: string | null) => void
  handleCloseProjectTab: (projectId: string) => void
  view: 'welcome' | 'main' | 'dashboard' | 'studio'
  mainRoute: NavRoute
  setMainRoute: (route: NavRoute) => void
  currentProject: Project | null
}) {
  const {
    drawerVisible,
    setDrawerVisible,
    terminalProjectPath,
    setTerminalProjectPath,
    activeSessions
  } = useTerminalContext()

  // Sincroniza o projeto do terminal com o projeto ativo no dashboard
  useEffect(() => {
    if (activeProjectId) {
      const activeProj = openProjects.find(p => p.id === activeProjectId)
      if (activeProj) {
        setTerminalProjectPath(activeProj.path)
      }
    }
  }, [activeProjectId, openProjects, setTerminalProjectPath])

  // Se estiver fora do dashboard e o terminalProjectPath for vazio, inicializa com o primeiro das sessões ativas
  useEffect(() => {
    if (!activeProjectId && !terminalProjectPath && activeSessions.length > 0) {
      setTerminalProjectPath(activeSessions[0].projectPath)
    }
  }, [activeProjectId, terminalProjectPath, activeSessions, setTerminalProjectPath])

  return (
    <div
      className={`app-root h-screen w-screen flex flex-row overflow-hidden font-sans select-none antialiased ${theme}`}
      style={{ backgroundColor: 'var(--surface-base)', color: 'var(--tx-primary)' }}
    >
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {view === 'welcome' && (
          <WelcomePage onComplete={handleTutorialComplete} theme={theme} setTheme={setTheme} />
        )}

        {view === 'main' && (
          <div className="flex flex-1 overflow-hidden">
            <AppSidebar activeRoute={mainRoute} onNavigate={setMainRoute} theme={theme} onToggleTheme={toggleTheme} />
            <main className="flex-1 flex flex-col overflow-hidden">
              {mainRoute === 'projects'  && <ProjectsPage onSelectProject={handleSelectProject} />}
              {mainRoute === 'studio'    && <StudioPage onSelectStudio={handleSelectStudio} />}
              {mainRoute === 'skills'    && <SkillsPage />}
              {mainRoute === 'mcp'       && <McpPage />}
              {mainRoute === 'prompts'   && <PromptsPage />}
              {mainRoute === 'docs'      && <DocsPage />}
              {mainRoute === 'agents'    && <AgentsPage />}
              {mainRoute === 'status'    && <StatusPage />}
              {mainRoute === 'docker'    && <DockerPage />}
              {mainRoute === 'settings'  && <SettingsPage theme={theme} setTheme={setTheme} />}
            </main>
          </div>
        )}

        {view === 'dashboard' && openProjects.length > 0 && openProjects.map(project => (
          <div
            key={project.id}
            className="flex-1 flex flex-col h-full overflow-hidden"
            style={{ display: project.id === activeProjectId ? 'flex' : 'none' }}
          >
            <DashboardPage
              project={project}
              openProjects={openProjects}
              activeProjectId={activeProjectId}
              onSelectProjectTab={(id) => setActiveProjectId(id)}
              onCloseProjectTab={handleCloseProjectTab}
              onAddProjectTab={handleSelectProject}
              onBack={handleBackToProjects}
            />
          </div>
        ))}

        {view === 'studio' && currentProject && (
          <StudioDashboard project={currentProject} onBack={handleBackToProjects} />
        )}
      </div>

      {/* Gaveta do Terminal Única Global na extrema direita */}
      {drawerVisible && terminalProjectPath && (
        <div
          className="h-full z-[999] shadow-2xl flex flex-row pointer-events-auto bg-[var(--surface-raised)] border-l animate-slide-in-right shrink-0"
          style={{ borderColor: 'var(--line)' }}
        >
          <TerminalDrawer
            projectPath={terminalProjectPath}
            isOpen={drawerVisible}
            onClose={() => setDrawerVisible(false)}
            onProjectPathChange={setTerminalProjectPath}
            isGlobal={true}
          />
        </div>
      )}

      {/* Global Floating Background Terminal Widget (somente o botão discreto) */}
      <FloatingTerminalWidget />
    </div>
  )
}
