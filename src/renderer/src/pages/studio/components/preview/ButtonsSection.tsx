import { Heart, Send, Trash2, Settings } from 'lucide-react'

export default function ButtonsSection() {
  return (
    <div className="studio-card p-5 space-y-4 flex flex-col justify-between">
      <h3 className="font-semibold text-xs tracking-tight uppercase studio-text-muted">Ações e Botões</h3>
      
      <div className="grid grid-cols-1 gap-2.5 flex-1 justify-center">
        {/* Primary */}
        <button type="button" className="studio-btn-primary py-2 px-4 text-xs flex items-center justify-center gap-2">
          <Send className="w-3.5 h-3.5" /> Botão Primário
        </button>

        {/* Secondary */}
        <button type="button" className="studio-btn-secondary py-2 px-4 text-xs flex items-center justify-center gap-2">
          <Heart className="w-3.5 h-3.5" /> Botão Secundário
        </button>

        {/* Outline */}
        <button type="button" className="studio-btn-outline py-2 px-4 text-xs flex items-center justify-center gap-2">
          <Settings className="w-3.5 h-3.5" /> Botão Outline
        </button>

        {/* Destructive */}
        <button type="button" className="studio-btn-destructive py-2 px-4 text-xs flex items-center justify-center gap-2">
          <Trash2 className="w-3.5 h-3.5" /> Botão Destrutivo
        </button>
 
        {/* Ghost */}
        <button type="button" className="studio-btn-ghost py-2 px-4 text-xs flex items-center justify-center gap-2">
          Apenas Texto / Ghost
        </button>
      </div>
    </div>
  )
}
