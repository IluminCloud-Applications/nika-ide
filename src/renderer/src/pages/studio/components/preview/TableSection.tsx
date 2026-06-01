import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'

export default function TableSection() {
  const users = [
    { name: 'Ana Silva', email: 'ana@nika.io', role: 'Admin', status: 'Ativo', date: '29/05/2026', avatar: 'AS' },
    { name: 'Bruno Costa', email: 'bruno@nika.io', role: 'Editor', status: 'Pendente', date: '28/05/2026', avatar: 'BC' },
    { name: 'Carla Dias', email: 'carla@nika.io', role: 'Viewer', status: 'Inativo', date: '25/05/2026', avatar: 'CD' }
  ]

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Ativo': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
      case 'Pendente': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
      default: return 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
    }
  }

  return (
    <div className="studio-card p-5 space-y-4 md:col-span-2 flex flex-col justify-between">
      <div className="space-y-3">
        <h3 className="font-semibold text-xs tracking-tight uppercase studio-text-muted">Lista de Usuários (Table)</h3>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b studio-divider studio-text-muted">
                <th className="pb-2.5 font-medium">Usuário</th>
                <th className="pb-2.5 font-medium">Cargo</th>
                <th className="pb-2.5 font-medium">Status</th>
                <th className="pb-2.5 font-medium">Data</th>
                <th className="pb-2.5 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y studio-divider">
              {users.map((u, i) => (
                <tr key={i} className="studio-table-row border-b studio-divider">
                  <td className="py-3 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-600/25 border border-blue-500/30 flex items-center justify-center font-bold text-[10px] text-blue-400">
                      {u.avatar}
                    </div>
                    <div>
                      <span className="font-medium block">{u.name}</span>
                      <span className="text-[10px] studio-text-muted">{u.email}</span>
                    </div>
                  </td>
                  <td className="py-3 studio-text-muted">{u.role}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${getStatusBadgeClass(u.status)}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 studio-text-muted">{u.date}</td>
                  <td className="py-3 text-right">
                    <button type="button" className="p-1 rounded studio-btn-ghost text-zinc-400 transition">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination component */}
      <div className="flex items-center justify-between border-t studio-divider pt-4 mt-2">
        <span className="text-[10px] studio-text-muted">Mostrando 1-3 de 12 usuários</span>
        <div className="flex items-center gap-1">
          <button type="button" className="studio-btn-outline p-1.5" disabled>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button type="button" className="studio-btn-primary px-2.5 py-1 text-[10px]">1</button>
          <button type="button" className="studio-btn-outline px-2.5 py-1 text-[10px]">2</button>
          <button type="button" className="studio-btn-outline px-2.5 py-1 text-[10px]">3</button>
          <button type="button" className="studio-btn-outline p-1.5">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
