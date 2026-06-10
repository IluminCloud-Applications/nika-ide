import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// First-run setup: creates the single administrator account for this instance.
export default function Setup({ onSetupSuccess }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, confirm_password: confirm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Falha ao concluir a configuração.')
      onSetupSuccess(data.access_token, data.user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] rounded-full bg-primary/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[55%] h-[55%] rounded-full bg-accent/10 blur-[130px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-primary/80 to-accent/80 p-[1.5px] shadow-xl shadow-primary/10">
          <div className="w-full h-full bg-card rounded-[14px] flex items-center justify-center">
            <i className="ri-rocket-2-line text-2xl text-primary" />
          </div>
        </div>
      </div>

      <Card className="w-full max-w-[400px] border-border/50 bg-card/40 backdrop-blur-md shadow-2xl relative z-10">
        <CardHeader className="space-y-1 text-center pb-4">
          <CardTitle className="text-xl font-bold tracking-tight">Configuração Inicial</CardTitle>
          <CardDescription className="text-xs">
            Crie a conta de administrador. Esta é uma instalação de instância única.
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
              <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">Nome</Label>
              <Input id="name" type="text" placeholder="Seu nome" className="bg-background/30 border-input/60 text-sm h-9"
                value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">E-mail</Label>
              <Input id="email" type="email" placeholder="seu-email@exemplo.com" className="bg-background/30 border-input/60 text-sm h-9"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-muted-foreground">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" className="bg-background/30 border-input/60 text-sm h-9"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirm" className="text-xs font-medium text-muted-foreground">Confirmar Senha</Label>
              <Input id="confirm" type="password" placeholder="••••••••" className="bg-background/30 border-input/60 text-sm h-9"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            </div>

            <Button type="submit" className="w-full font-medium h-9 text-xs mt-2" disabled={loading}>
              {loading ? 'Configurando...' : (
                <span className="flex items-center justify-center gap-1.5">
                  Criar Administrador
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
