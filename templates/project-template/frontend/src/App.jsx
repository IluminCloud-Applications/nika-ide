import React, { useState, useEffect } from 'react'
import Login from './pages/login'
import Dashboard from './pages/dashboard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8742'

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setUser(data)
        } else {
          // Token might have expired or be invalid
          localStorage.removeItem('token')
          setToken(null)
        }
      } catch (err) {
        console.error('Falha ao autenticar token no servidor:', err)
        // Note: we don't clear token on network error to allow offline recovery/retries
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [token])

  const handleLoginSuccess = (newToken, userData) => {
    setToken(newToken)
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">Iniciando painel...</p>
        </div>
      </div>
    )
  }

  if (!token || !user) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return <Dashboard user={user} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} />
}
