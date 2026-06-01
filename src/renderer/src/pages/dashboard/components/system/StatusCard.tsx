interface StatusCardProps {
  icon: string
  label: string
  value: string | number
  color?: string
  subtext?: string
}

export default function StatusCard({ icon, label, value, color = '#60a5fa', subtext }: StatusCardProps) {
  return (
    <div className="card p-3 flex items-center gap-3 min-w-0">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
      >
        <i className={`${icon} text-base`} style={{ color }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] tx-muted uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-sm font-bold tx-primary truncate">{value}</p>
        {subtext && <p className="text-[10px] tx-faint truncate">{subtext}</p>}
      </div>
    </div>
  )
}
