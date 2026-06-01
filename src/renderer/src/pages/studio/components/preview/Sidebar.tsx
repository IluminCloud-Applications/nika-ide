import { User, CreditCard, Calendar, Settings, LayoutDashboard } from 'lucide-react'

export default function Sidebar() {
  return (
    <aside className="w-52 shrink-0 border-r studio-divider flex flex-col p-4 gap-1.5">
      <button className="flex items-center gap-2.5 px-3 py-2 w-full text-left studio-sidebar-item studio-sidebar-item-active">
        <LayoutDashboard className="w-4 h-4" /> Visão Geral
      </button>
      <button className="flex items-center gap-2.5 px-3 py-2 w-full text-left studio-sidebar-item">
        <User className="w-4 h-4" /> Usuários
      </button>
      <button className="flex items-center gap-2.5 px-3 py-2 w-full text-left studio-sidebar-item">
        <CreditCard className="w-4 h-4" /> Faturamento
      </button>
      <button className="flex items-center gap-2.5 px-3 py-2 w-full text-left studio-sidebar-item">
        <Calendar className="w-4 h-4" /> Eventos
      </button>
      <button className="flex items-center gap-2.5 px-3 py-2 w-full text-left studio-sidebar-item mt-auto">
        <Settings className="w-4 h-4" /> Ajustes
      </button>
    </aside>
  )
}
