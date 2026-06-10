import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function Dashboard({ user, onLogout, theme, onToggleTheme }) {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 relative overflow-hidden flex flex-col justify-between">
      <div className="absolute top-[-25%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/15 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between border-b border-border pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <i className="ri-layout-grid-line text-lg text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Painel</h1>
            <p className="text-xs text-muted-foreground">Olá, {user?.name || 'Admin'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onToggleTheme} className="w-9 h-9 flex items-center justify-center"
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}>
            <i className={theme === 'dark' ? 'ri-sun-line text-sm' : 'ri-moon-line text-sm'} />
          </Button>
          <Button variant="outline" size="sm" onClick={onLogout} className="gap-1.5 flex items-center">
            <i className="ri-logout-box-r-line text-sm" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-[var(--studio-spacing,1.5rem)] flex-1 py-4">
        <div className="md:col-span-2 space-y-[var(--studio-spacing,1.5rem)]">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <i className="ri-server-line text-lg text-primary" />
                <CardTitle>Aplicação Self-Hosted</CardTitle>
              </div>
              <CardDescription>
                Instância única: frontend e backend rodam na mesma imagem Docker.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-[calc(var(--studio-spacing,1.5rem)*0.67)]">
              <div className="p-4 rounded-xl border border-border bg-background/50">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Mesma Origem</div>
                <div className="text-lg font-bold text-foreground">Sem CORS / Sem ENV</div>
                <div className="text-sm font-mono text-primary mt-1">/api</div>
                <p className="text-[11px] text-muted-foreground/80 mt-2">
                  O frontend chama o backend por caminhos relativos. Em produção o backend serve o site em <code className="bg-muted px-1 py-0.5 rounded font-mono text-[10px]">/</code>.
                </p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-background/50">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Administrador Único</div>
                <div className="text-lg font-bold text-foreground">Setup Concluído</div>
                <div className="text-sm font-mono text-primary mt-1">1 usuário</div>
                <p className="text-[11px] text-muted-foreground/80 mt-2">
                  A tela de Setup (<code className="bg-muted px-1 py-0.5 rounded font-mono text-[10px]">pages/setup</code>) só aparece no primeiro acesso.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/30 backdrop-blur-sm">
            <CardHeader className="py-4">
              <div className="flex items-center gap-2">
                <i className="ri-information-line text-lg text-accent" />
                <CardTitle className="text-base">Como Modificar esta Tela?</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Edite a interface abrindo o arquivo:</p>
              <div className="p-3 bg-muted/60 rounded-lg font-mono text-xs text-foreground select-all text-center">
                frontend/src/pages/dashboard/index.jsx
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-[var(--studio-spacing,1.5rem)]">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <i className="ri-shield-check-line text-lg text-primary" />
                <CardTitle>Sessão Autenticada</CardTitle>
              </div>
              <CardDescription>Informações obtidas via JWT Token</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Nome</div>
                <div className="text-sm font-medium text-foreground break-all">{user?.name || 'N/A'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">E-mail</div>
                <div className="text-sm font-medium text-foreground break-all">{user?.email || 'N/A'}</div>
              </div>
              {user?.created_at && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                  <i className="ri-calendar-line text-sm text-primary" />
                  <span>Configurado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="relative z-10 w-full max-w-6xl mx-auto text-center py-6 text-xs text-muted-foreground/60 border-t border-border/50 mt-6">
        Nika IDE • Self-Hosted / White Label.
      </footer>
    </div>
  )
}
