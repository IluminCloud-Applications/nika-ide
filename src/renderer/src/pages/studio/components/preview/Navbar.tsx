import { Search, Bell } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="h-14 shrink-0 px-6 flex items-center justify-between studio-header">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-md bg-white flex items-center justify-center text-black font-extrabold text-xs">N</div>
        <span className="font-bold tracking-tight">Nika Studio</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 studio-text-muted" />
          <input type="text" placeholder="Buscar no sistema..." className="studio-input pl-8 pr-3 py-1.5 text-xs w-48" />
        </div>
        <button className="p-1.5 rounded-full studio-btn-ghost relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">A</div>
      </div>
    </header>
  )
}
