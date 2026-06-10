import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8742'

export default function Dashboard({ user, onLogout, theme, onToggleTheme }) {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 relative overflow-hidden flex flex-col justify-between">
      {/* Background glow effects */}
      <div className="absolute top-[-25%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-accent/15 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-6xl mx-auto flex items-center justify-between border-b border-border pb-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <i className="ri-layout-grid-line text-lg text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Nika Dashboard</h1>
            <p className="text-xs text-muted-foreground">Bem-vindo ao seu painel de controle</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onToggleTheme}
            className="w-9 h-9 flex items-center justify-center"
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            {theme === 'dark' ? (
              <i className="ri-sun-line text-sm" />
            ) : (
              <i className="ri-moon-line text-sm" />
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={onLogout} className="gap-1.5 flex items-center">
            <i className="ri-logout-box-r-line text-sm" />
            Sair
          </Button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="relative z-10 w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-[var(--studio-spacing,1.5rem)] flex-1 py-4">
        
        {/* Left Side: Server Configuration Details */}
        <div className="md:col-span-2 space-y-[var(--studio-spacing,1.5rem)]">
          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <i className="ri-code-line text-lg text-primary" />
                <CardTitle>Configurações do Ambiente</CardTitle>
              </div>
              <CardDescription>
                Seus servidores estão configurados e prontos para desenvolvimento
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-[calc(var(--studio-spacing,1.5rem)*0.67)]">
              <div className="p-4 rounded-xl border border-border bg-background/50">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Frontend Server</div>
                <div className="text-lg font-bold text-foreground">React + Vite</div>
                <div className="text-sm font-mono text-primary mt-1">http://localhost:5177</div>
                <p className="text-[11px] text-muted-foreground/80 mt-2">
                  Modifique e crie páginas em <code className="bg-muted px-1 py-0.5 rounded font-mono text-[10px]">src/pages/</code>.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-border bg-background/50">
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Backend Server</div>
                <div className="text-lg font-bold text-foreground">Python FastAPI</div>
                <div className="text-sm font-mono text-primary mt-1">{API_URL}</div>
                <p className="text-[11px] text-muted-foreground/80 mt-2">
                  APIs, modelos e rotas organizados dentro da pasta <code className="bg-muted px-1 py-0.5 rounded font-mono text-[10px]">backend/</code>.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick instructions to edit code */}
          <Card className="border-border bg-card/30 backdrop-blur-sm">
            <CardHeader className="py-4">
              <div className="flex items-center gap-2">
                <i className="ri-information-line text-lg text-accent" />
                <CardTitle className="text-base">Como Modificar esta Tela?</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Este dashboard é o ponto de partida do seu projeto. Você pode editar toda a interface, dados e componentes abrindo o arquivo:
              </p>
              <div className="p-3 bg-muted/60 rounded-lg font-mono text-xs text-foreground select-all text-center">
                frontend/src/pages/dashboard/index.jsx
              </div>
              <p>
                Qualquer modificação que você fizer será atualizada instantaneamente no seu navegador via Hot Module Replacement (HMR).
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Account and DB details */}
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
              {user?.name && (
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Nome do Usuário</div>
                  <div className="text-sm font-medium text-foreground break-all">{user.name}</div>
                </div>
              )}

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">E-mail do Usuário</div>
                <div className="text-sm font-medium text-foreground break-all">{user?.email || 'N/A'}</div>
              </div>

              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">ID do Usuário</div>
                <div className="text-xs font-mono text-muted-foreground bg-muted p-2 rounded break-all">{user?.id || 'N/A'}</div>
              </div>

              {user?.created_at && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-border">
                  <i className="ri-calendar-line text-sm text-primary" />
                  <span>Cadastrado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <i className="ri-database-2-line text-lg text-primary" />
                <CardTitle className="text-base">Banco de Dados</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-2">
              <div className="flex items-center justify-between">
                <span>Tecnologia:</span>
                <span className="font-semibold text-foreground">PostgreSQL 15</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Database:</span>
                <span className="font-mono text-foreground">nika_db</span>
              </div>
              <p className="pt-2 border-t border-border/50 text-[11px]">
                A tabela <code className="bg-muted px-1 rounded font-mono">users</code> utiliza chave primária UUID e a extensão pgcrypto está habilitada por padrão.
              </p>
            </CardContent>
          </Card>
        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto text-center py-6 text-xs text-muted-foreground/60 border-t border-border/50 mt-6">
        Nika IDE • Desenvolvido com liberdade e criatividade.
      </footer>
    </div>
  )
}
