import { DiskUsageItem } from './types'

interface DiskUsageCardProps {
  usage: DiskUsageItem[]
}

export default function DiskUsageCard({ usage }: DiskUsageCardProps) {
  if (usage.length === 0) return null

  const typeLabels: Record<string, string> = {
    Images: 'Imagens',
    Containers: 'Containers',
    'Local Volumes': 'Volumes',
    'Build Cache': 'Cache de Build',
  }

  const typeIcons: Record<string, string> = {
    Images: 'ri-image-line',
    Containers: 'ri-server-line',
    'Local Volumes': 'ri-hard-drive-3-line',
    'Build Cache': 'ri-stack-line',
  }

  const typeColors: Record<string, string> = {
    Images: '#60a5fa',
    Containers: '#10b981',
    'Local Volumes': '#a855f7',
    'Build Cache': '#f59e0b',
  }

  return (
    <div className="card p-3">
      <div className="flex items-center gap-2 mb-3">
        <i className="ri-pie-chart-2-line text-sm tx-muted" />
        <h4 className="text-[10px] font-semibold tx-muted uppercase tracking-wider">
          Uso de Disco do Docker
        </h4>
      </div>

      <div className="space-y-2">
        {usage.map(item => {
          const color = typeColors[item.Type] || '#71717a'
          return (
            <div key={item.Type} className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${color}15` }}
              >
                <i className={`${typeIcons[item.Type] || 'ri-folder-line'} text-xs`} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium tx-secondary">
                    {typeLabels[item.Type] || item.Type}
                  </span>
                  <span className="text-[10px] font-semibold tx-primary">{item.Size}</span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] tx-faint">
                    {item.TotalCount} total · {item.Active} ativo(s)
                  </span>
                  <span className="text-[9px] tx-faint">
                    Recuperável: {item.Reclaimable}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
