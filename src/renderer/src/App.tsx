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
import DockerPage from './pages/docker'
import AppSidebar, { NavRoute } from './components/layout/AppSidebar'
import { Theme } from './pages/settings/ThemeSelector'
import StudioPage from './pages/studio'
import StudioDashboard from './pages/studio/components/StudioDashboard'

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
  const [view, setView] = useState<'welcome' | 'main' | 'dashboard' | 'studio'>('main')
  const [mainRoute, setMainRoute] = useState<NavRoute>('projects')
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const THEMES: Theme[] = ['dark', 'light', 'obsidian', 'notion', 'nord', 'typewriter', 'nika', 'nika-light']

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app_theme') as Theme
    return THEMES.includes(saved) ? saved : 'dark'
  })

  const toggleTheme = () => {
    setTheme(prev => {
      const next = THEMES[(THEMES.indexOf(prev) + 1) % THEMES.length]
      localStorage.setItem('app_theme', next)
      return next
    })
  }

  useEffect(() => {
    window.api.settings.get().then((s) => {
      const tutorialDone = localStorage.getItem('tutorial_done')
      if (!tutorialDone && !s.workspacePath) {
        setView('welcome')
      } else {
        if (s.workspacePath) localStorage.setItem('tutorial_done', 'true')
        setView('main')
      }
    }).catch(() => {
      const tutorialDone = localStorage.getItem('tutorial_done')
      setView(tutorialDone ? 'main' : 'welcome')
    })
  }, [])

  const handleTutorialComplete = () => {
    localStorage.setItem('tutorial_done', 'true')
    setView('main')
  }

  const handleSelectProject = (project: Project) => {
    window.api.projects.open(project.path)
    setCurrentProject(project)
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
    setView('main')
    setMainRoute(wasStudio ? 'studio' : 'projects')
  }

  return (
    <div
      className={`app-root h-screen w-screen flex flex-col overflow-hidden font-sans select-none antialiased ${theme}`}
      style={{ backgroundColor: 'var(--surface-base)', color: 'var(--tx-primary)' }}
    >
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
            {mainRoute === 'agents'    && <AgentsPage />}
            {mainRoute === 'status'    && <StatusPage />}
            {mainRoute === 'docker'    && <DockerPage />}
            {mainRoute === 'settings'  && <SettingsPage theme={theme} setTheme={setTheme} />}
          </main>
        </div>
      )}

      {view === 'dashboard' && currentProject && (
        <DashboardPage
          project={currentProject}
          onBack={handleBackToProjects}
        />
      )}

      {view === 'studio' && currentProject && (
        <StudioDashboard project={currentProject} onBack={handleBackToProjects} />
      )}
    </div>
  )
}
