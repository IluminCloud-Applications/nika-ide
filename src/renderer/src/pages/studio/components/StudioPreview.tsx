import { useState, useEffect } from 'react'
import { Plus, Check, Bell, ChevronRight, X } from 'lucide-react'
import Navbar from './preview/Navbar'
import Sidebar from './preview/Sidebar'
import FormsSection from './preview/FormsSection'
import ButtonsSection from './preview/ButtonsSection'
import FeedbackSection from './preview/FeedbackSection'
import CardsSection from './preview/CardsSection'
import TableSection from './preview/TableSection'
import DisplaySection from './preview/DisplaySection'

export default function StudioPreview({ isDark }: { isDark: boolean }) {
  const [showModal, setShowModal] = useState(false)
  const [showDrawer, setShowDrawer] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [studioGap, setStudioGap] = useState('1rem')
  const [activeSubTab, setActiveSubTab] = useState('Geral')

  // Monitora o valor do spacing injetado no container
  useEffect(() => {
    const timer = setInterval(() => {
      const container = document.querySelector('.studio-viewport-container')
      if (container) {
        const computed = getComputedStyle(container).getPropertyValue('--studio-spacing')
        if (computed && computed.trim() !== studioGap) setStudioGap(computed.trim())
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [studioGap])

  const handleTriggerToast = (msg: string) => {
    setToastMessage(msg)
  }

  useEffect(() => {
    if (!toastMessage) return
    const t = setTimeout(() => setToastMessage(null), 3000)
    return () => clearTimeout(t)
  }, [toastMessage])

  return (
    <div className={`studio-viewport-container w-full h-full flex flex-col overflow-hidden text-sm transition-colors duration-300 relative ${isDark ? 'dark' : ''}`}>
      <style>{`
        .studio-viewport-container,
        .studio-viewport-container * {
          font-family: 'Inter', sans-serif !important;
        }
        .studio-viewport-container {
          background-color: hsl(var(--background, 240 10% 3.9%));
          color: hsl(var(--foreground, 0 0% 98%));
          --studio-spacing: 1rem;
        }
        .studio-header {
          background-color: hsl(var(--card, 240 10% 3.9%));
          color: hsl(var(--foreground, 0 0% 98%));
          border-bottom: 1px solid hsl(var(--border, 240 3.7% 15.9%));
        }
        .studio-sidebar-item {
          color: hsl(var(--muted-foreground, 240 5% 64.9%));
          border-radius: var(--radius, 0.5rem);
          transition: background-color 0.15s, color 0.15s;
        }
        .studio-sidebar-item:hover {
          background-color: hsl(var(--accent, 240 3.7% 15.9%));
          color: hsl(var(--accent-foreground, 0 0% 98%));
        }
        .studio-sidebar-item-active {
          background-color: hsl(var(--secondary, 240 3.7% 15.9%));
          color: hsl(var(--secondary-foreground, 0 0% 98%));
          font-weight: 500;
        }
        .studio-card {
          background-color: hsl(var(--card, 240 10% 3.9%));
          color: hsl(var(--card-foreground, 0 0% 98%));
          border: 1px solid hsl(var(--border, 240 3.7% 15.9%));
          border-radius: var(--radius, 0.5rem);
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
        }
        .studio-btn-primary {
          background-color: hsl(var(--primary, 0 0% 98%));
          color: hsl(var(--primary-foreground, 240 5.9% 10%));
          border-radius: var(--radius, 0.5rem);
          font-weight: 500;
          transition: all 0.15s;
          border: none;
          cursor: pointer;
        }
        .studio-btn-primary:hover {
          opacity: 0.9;
        }
        .studio-btn-secondary {
          background-color: hsl(var(--secondary, 240 3.7% 15.9%));
          color: hsl(var(--secondary-foreground, 0 0% 98%));
          border-radius: var(--radius, 0.5rem);
          font-weight: 500;
          transition: background-color 0.15s;
          border: none;
          cursor: pointer;
        }
        .studio-btn-secondary:hover {
          background-color: hsl(var(--secondary, 240 3.7% 15.9%) / 0.8);
        }
        .studio-btn-outline {
          border: 1px solid hsl(var(--border, 240 3.7% 15.9%));
          background: transparent;
          color: hsl(var(--foreground, 0 0% 98%));
          border-radius: var(--radius, 0.5rem);
          font-weight: 500;
          transition: background-color 0.15s, color 0.15s;
          cursor: pointer;
        }
        .studio-btn-outline:hover {
          background-color: hsl(var(--accent, 240 3.7% 15.9%));
          color: hsl(var(--accent-foreground, 0 0% 98%));
        }
        .studio-btn-destructive {
          background-color: hsl(var(--destructive, 0 62.8% 30.6%));
          color: hsl(var(--destructive-foreground, 0 0% 98%));
          border-radius: var(--radius, 0.5rem);
          font-weight: 500;
          transition: background-color 0.15s;
          border: none;
          cursor: pointer;
        }
        .studio-btn-destructive:hover {
          background-color: hsl(var(--destructive, 0 62.8% 30.6%) / 0.9);
        }
        .studio-btn-ghost {
          background-color: transparent;
          color: hsl(var(--foreground, 0 0% 98%));
          border-radius: var(--radius, 0.5rem);
          font-weight: 500;
          transition: background-color 0.15s, color 0.15s;
          border: none;
          cursor: pointer;
        }
        .studio-btn-ghost:hover {
          background-color: hsl(var(--accent, 240 3.7% 15.9%));
          color: hsl(var(--accent-foreground, 0 0% 98%));
        }
        .studio-input {
          background-color: transparent;
          border: 1px solid hsl(var(--input, 240 3.7% 15.9%));
          color: hsl(var(--foreground, 0 0% 98%));
          border-radius: var(--radius, 0.5rem);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .studio-input:focus {
          border-color: hsl(var(--ring, 240 4.9% 83.9%));
          box-shadow: 0 0 0 1px hsl(var(--ring, 240 4.9% 83.9%));
        }
        .studio-input::placeholder { color: hsl(var(--muted-foreground, 240 5% 64.9%)); opacity: 1; }
        .studio-divider { border-color: hsl(var(--border, 240 3.7% 15.9%)); }
        .studio-tab-active {
          border-color: hsl(var(--primary, 0 0% 98%));
          color: hsl(var(--foreground, 0 0% 98%));
        }
        .studio-badge {
          background-color: hsl(var(--primary, 0 0% 98%));
          color: hsl(var(--primary-foreground, 240 5.9% 10%));
        }
        .studio-badge-secondary {
          background-color: hsl(var(--secondary, 240 3.7% 15.9%));
          color: hsl(var(--secondary-foreground, 0 0% 98%));
        }
        .studio-badge-outline {
          border: 1px solid hsl(var(--border, 240 3.7% 15.9%));
          color: hsl(var(--foreground, 0 0% 98%));
        }
        .studio-alert {
          background-color: hsl(var(--primary, 0 0% 98%) / 0.1);
          color: hsl(var(--primary, 0 0% 98%));
          border: 1px solid hsl(var(--primary, 0 0% 98%) / 0.25);
          border-radius: var(--radius, 0.5rem);
        }
        .studio-alert-text { color: hsl(var(--primary, 0 0% 98%) / 0.8); }
        .studio-text-muted { color: hsl(var(--muted-foreground, 240 5% 64.9%)); }
      `}</style>

      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 text-[10px] studio-text-muted font-mono uppercase tracking-wider">
            <span>Visão Geral</span> <ChevronRight className="w-3 h-3" /> <span>Estúdio</span> <ChevronRight className="w-3 h-3" /> <span className="text-[var(--foreground)] font-semibold">Temas</span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Estúdio de Componentes</h2>
              <p className="studio-text-muted text-xs">Visualize e teste os componentes mais frequentes do seu design.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowDrawer(true)} className="studio-btn-outline px-3 py-1.5 text-xs">Ver Drawer (Gaveta)</button>
              <button onClick={() => setShowModal(true)} className="studio-btn-primary px-3 py-1.5 text-xs flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Abrir Modal</button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b studio-divider pb-px">
            {['Geral', 'Segurança', 'Configurações'].map(tab => (
              <button key={tab} onClick={() => setActiveSubTab(tab)} className={`pb-2 text-xs font-semibold border-b-2 transition ${activeSubTab === tab ? 'studio-tab-active' : 'border-transparent studio-text-muted hover:text-[var(--foreground)]'}`}>{tab}</button>
            ))}
          </div>

          <CardsSection studioGap={studioGap} />

          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: studioGap }}>
            <TableSection />
            <DisplaySection />
            <FormsSection />
            <ButtonsSection />
            <FeedbackSection onTriggerToast={handleTriggerToast} />
          </div>
        </main>
      </div>

      {toastMessage && (
        <div className="absolute bottom-6 right-6 z-50 animate-slide-up">
          <div className="studio-card p-4 shadow-2xl flex items-center gap-3 bg-popover text-popover-foreground max-w-sm">
            <Bell className="w-5 h-5 text-blue-500 shrink-0" />
            <div>
              <span className="font-bold text-xs block">Notificação</span>
              <p className="text-[11px] studio-text-muted leading-relaxed">{toastMessage}</p>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="studio-card max-w-sm w-full p-6 space-y-4 shadow-2xl bg-popover text-popover-foreground">
            <h3 className="text-base font-bold">Confirmação de Ação</h3>
            <p className="studio-text-muted text-xs leading-relaxed">Este é um exemplo de modal. Ele reage automaticamente ao arredondamento da borda (--radius) e às cores HSL do estúdio.</p>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowModal(false)} className="studio-btn-secondary px-4 py-2 text-xs">Cancelar</button>
              <button onClick={() => setShowModal(false)} className="studio-btn-primary px-4 py-2 text-xs flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {showDrawer && (
        <div className="absolute inset-0 bg-black/60 z-40 flex justify-end">
          <div className="w-80 h-full studio-card border-y-0 border-r-0 rounded-none p-6 space-y-4 bg-popover text-popover-foreground shadow-2xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2.5 border-b studio-divider">
                <h3 className="font-bold text-sm">Drawer Lateral</h3>
                <button onClick={() => setShowDrawer(false)} className="p-1 rounded hover:bg-white/5"><X className="w-4 h-4" /></button>
              </div>
              <p className="studio-text-muted text-xs leading-relaxed">Este painel representa uma Drawer (gaveta lateral) clássica, ideal para formulários de cadastro ou detalhamentos sem sair do contexto.</p>
            </div>
            <button onClick={() => setShowDrawer(false)} className="w-full studio-btn-primary py-2 text-xs">Fechar Gaveta</button>
          </div>
        </div>
      )}
    </div>
  )
}
