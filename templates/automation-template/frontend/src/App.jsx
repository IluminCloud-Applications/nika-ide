import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Minimal status page. This is a backend-focused template — the real work lives
// in backend/agents (LangChain + Gemini) and backend/automations (APScheduler).

export default function App() {
  const [online, setOnline] = useState(null)
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    document.documentElement.classList.add('dark')
    fetch('/api/health').then(r => setOnline(r.ok)).catch(() => setOnline(false))
  }, [])

  const send = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setSending(true)
    setReply('')
    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()
      setReply(data.reply || '(sem resposta)')
    } catch {
      setReply('Falha ao contatar o backend.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-25%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/15 blur-[150px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg space-y-5">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-primary/80 to-accent/80 p-[1.5px] shadow-xl shadow-primary/10">
            <div className="w-full h-full bg-card rounded-[14px] flex items-center justify-center">
              <i className="ri-robot-2-line text-2xl text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Serviço de Automação</h1>
            <p className="text-xs text-muted-foreground mt-1">Backend de automações e agentes de IA</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2.5 h-2.5 rounded-full ${online ? 'bg-primary animate-pulse' : 'bg-destructive'}`} />
            <span className="text-muted-foreground">
              {online === null ? 'Verificando...' : online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <Card className="border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <i className="ri-chat-ai-line text-lg text-primary" />
              <CardTitle className="text-base">Testar Agente</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Envia uma mensagem para <code className="bg-muted px-1 py-0.5 rounded font-mono text-[10px]">/api/agent/chat</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <form onSubmit={send} className="flex items-center gap-2">
              <Input value={message} onChange={(e) => setMessage(e.target.value)}
                placeholder="Digite uma mensagem..." className="text-sm h-9" />
              <Button type="submit" size="sm" disabled={sending} className="gap-1.5 shrink-0">
                <i className="ri-send-plane-line text-sm" />
                {sending ? '...' : 'Enviar'}
              </Button>
            </form>
            {reply && (
              <div className="p-3 rounded-lg border border-border bg-background/50 text-sm whitespace-pre-wrap">
                {reply}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-[11px] text-muted-foreground/60">
          Edite a lógica em <code className="bg-muted px-1 py-0.5 rounded font-mono">backend/agents/</code> e <code className="bg-muted px-1 py-0.5 rounded font-mono">backend/automations/</code>
        </p>
      </div>
    </div>
  )
}
