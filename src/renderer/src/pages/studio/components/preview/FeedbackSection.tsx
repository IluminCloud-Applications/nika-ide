import { AlertCircle, CheckCircle, Info, Sparkles } from 'lucide-react'

interface FeedbackSectionProps {
  onTriggerToast: (message: string) => void
}

export default function FeedbackSection({ onTriggerToast }: FeedbackSectionProps) {
  return (
    <div className="studio-card p-5 space-y-4 flex flex-col justify-between">
      <h3 className="font-semibold text-xs tracking-tight uppercase studio-text-muted">Status e Feedbacks</h3>
      
      <div className="space-y-4 flex-1">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="studio-text-muted font-medium">Progresso de Tarefa</span>
            <span className="font-bold">70%</span>
          </div>
          <div className="w-full bg-[hsl(var(--secondary))] h-2 rounded-full overflow-hidden">
            <div className="bg-[hsl(var(--primary))] h-full rounded-full transition-all duration-500" style={{ width: '70%' }} />
          </div>
        </div>

        {/* Badges Row */}
        <div className="space-y-2">
          <label className="text-xs font-medium studio-text-muted block">Etiquetas (Badges)</label>
          <div className="flex flex-wrap gap-1.5">
            <span className="studio-badge px-2 py-0.5 text-[10px] font-semibold rounded-full">
              Padrão
            </span>
            <span className="studio-badge-secondary px-2 py-0.5 text-[10px] font-semibold rounded-full">
              Secundário
            </span>
            <span className="studio-badge-outline px-2 py-0.5 text-[10px] font-semibold rounded-full">
              Outline
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-[hsl(var(--destructive)/0.1)] text-[hsl(var(--destructive))] border border-[hsl(var(--destructive)/0.2)] rounded-full flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5" /> Erro
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
              <CheckCircle className="w-2.5 h-2.5" /> Sucesso
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center gap-1">
              <AlertCircle className="w-2.5 h-2.5" /> Alerta
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full flex items-center gap-1">
              <Info className="w-2.5 h-2.5" /> Informação
            </span>
          </div>
        </div>

        {/* Toast Trigger */}
        <div className="pt-2 border-t studio-divider">
          <button
            type="button"
            onClick={() => onTriggerToast('Parabéns! Design atualizado com sucesso via Estúdio Nika.')}
            className="w-full studio-btn-primary py-2 px-3 text-xs flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Simular Notificação (Toast)
          </button>
        </div>
      </div>
    </div>
  )
}
