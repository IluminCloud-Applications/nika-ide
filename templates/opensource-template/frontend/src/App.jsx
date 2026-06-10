import React, { useState, useEffect } from 'react'
import Setup from './pages/setup'
import Login from './pages/login'
import Dashboard from './pages/dashboard'

// Same-origin app: the API is always reached via relative "/api" (Vite proxies
// it in dev, the backend serves it in production). No VITE_API_URL needed.

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [configured, setConfigured] = useState(null) // null = unknown yet
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))

  // Bootstrap: discover whether the app was already set up, then validate token.
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const res = await fetch('/api/setup/status')
        const data = await res.json()
        setConfigured(!!data.configured)
      } catch (err) {
        console.error('Falha ao verificar status do setup:', err)
        setConfigured(true) // fail-safe: don't expose setup if backend is unreachable
      }

      if (token) {
        try {
          const me = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (me.ok) {
            setUser(await me.json())
          } else {
            localStorage.removeItem('token')
            setToken(null)
          }
        } catch (err) {
          console.error('Falha ao autenticar token:', err)
        }
      }
      setLoading(false)
    }
    bootstrap()
  }, [token])

  const handleAuthSuccess = (newToken, userData) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
    setConfigured(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  if (loading || configured === null) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">Iniciando painel...</p>
        </div>
      </div>
    )
  }

  // Not configured yet → force the Setup screen (WordPress/n8n style first run).
  if (!configured) {
    return <Setup onSetupSuccess={handleAuthSuccess} />
  }

  // Configured but not logged in → Login.
  if (!token || !user) {
    return <Login onLoginSuccess={handleAuthSuccess} />
  }

  return <Dashboard user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
}
