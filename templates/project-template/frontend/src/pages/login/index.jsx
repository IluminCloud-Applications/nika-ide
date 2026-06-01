import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8742'

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'E-mail ou senha incorretos.')
      }

      if (data.access_token) {
        localStorage.setItem('token', data.access_token)
        onLoginSuccess(data.access_token, data.user)
      } else {
        setError('Token de acesso não recebido do servidor.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] rounded-full bg-accent/10 blur-[130px] pointer-events-none" />

      {/* Floating premium key icon outside the card */}
      <div className="relative z-10 flex flex-col items-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-primary/80 to-accent/80 p-[1.5px] shadow-xl shadow-primary/10">
          <div className="w-full h-full bg-card rounded-[14px] flex items-center justify-center">
            <i className="ri-key-2-line text-2xl text-primary animate-pulse" />
          </div>
        </div>
      </div>

      <Card className="w-full max-w-[360px] border-border/50 bg-card/40 backdrop-blur-md shadow-2xl relative z-10">
        <CardHeader className="space-y-1 text-center pb-4">
          <CardTitle className="text-xl font-bold tracking-tight">
            Acesse sua conta
          </CardTitle>
          <CardDescription className="text-xs">
            Bem-vindo de volta! Faça login para continuar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-2.5 rounded-lg bg-destructive/10 border border-destructive/25 text-destructive text-[11px] text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">E-mail</Label>
              <div className="relative flex items-center">
                <i className="ri-mail-line absolute left-3 text-muted-foreground/75 text-base" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu-email@exemplo.com"
                  className="pl-9 bg-background/30 border-input/60 text-sm h-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Senha</Label>
              <div className="relative flex items-center">
                <i className="ri-lock-line absolute left-3 text-muted-foreground/75 text-base" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-9 pr-10 bg-background/30 border-input/60 text-sm h-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-muted-foreground/75 hover:text-foreground transition-colors focus:outline-none flex items-center justify-center"
                  tabIndex="-1"
                >
                  {showPassword ? (
                    <i className="ri-eye-off-line text-base" />
                  ) : (
                    <i className="ri-eye-line text-base" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full font-medium h-9 text-xs mt-2" disabled={loading}>
              {loading ? (
                'Processando...'
              ) : (
                <span className="flex items-center justify-center gap-1.5">
                  Entrar
                  <i className="ri-arrow-right-line text-sm" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
