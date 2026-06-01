import { CreditCard, TrendingUp, User, ArrowUpRight } from 'lucide-react'

interface CardsSectionProps {
  studioGap: string
}

export default function CardsSection({ studioGap }: CardsSectionProps) {
  return (
    <div className="space-y-4">
      {/* Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: studioGap }}>
        {/* Card 1 */}
        <div className="studio-card p-5 space-y-1">
          <div className="flex justify-between items-center text-xs studio-text-muted">
            <span>Faturamento Mensal</span>
            <CreditCard className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold">R$ 54.320,00</p>
          <p className="text-[10px] text-emerald-500 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +12.5% em relação ao mês anterior
          </p>
        </div>

        {/* Card 2 */}
        <div className="studio-card p-5 space-y-1">
          <div className="flex justify-between items-center text-xs studio-text-muted">
            <span>Usuários Registrados</span>
            <User className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold">3.840 novos</p>
          <p className="text-[10px] text-emerald-500 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +8.2% hoje
          </p>
        </div>

        {/* Card 3 */}
        <div className="studio-card p-5 space-y-1">
          <div className="flex justify-between items-center text-xs studio-text-muted">
            <span>Taxa de Conversão</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <p className="text-xl font-bold">4.82%</p>
          <p className="text-[10px] text-emerald-500 flex items-center gap-0.5">
            <TrendingUp className="w-3 h-3" /> +1.2% esta semana
          </p>
        </div>
      </div>

      {/* Large Performance Chart Card */}
      <div className="studio-card p-5 space-y-4">
        <h3 className="font-semibold text-xs tracking-tight uppercase studio-text-muted">Desempenho Semanal</h3>
        <div className="h-40 flex items-end gap-3 pt-2">
          {[45, 80, 55, 90, 65, 100, 75].map((val, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <div className="w-full bg-[hsl(var(--muted)/0.3)] rounded-t-md relative h-full flex items-end overflow-hidden" style={{ borderRadius: 'var(--radius) var(--radius) 0 0' }}>
                <div className="w-full bg-[hsl(var(--primary))]" style={{ height: `${val}%` }} />
              </div>
              <span className="text-[10px] studio-text-muted">{['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][idx]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
