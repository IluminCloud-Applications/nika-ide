import { useState } from 'react'
import { DockerVolume } from './types'

interface VolumesListProps {
  volumes: DockerVolume[]
  onRemove: (name: string) => Promise<void>
}

export default function VolumesList({ volumes, onRemove }: VolumesListProps) {
  const [removingName, setRemovingName] = useState<string | null>(null)

  if (volumes.length === 0) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center gap-2 text-center">
        <i className="ri-hard-drive-3-line text-2xl tx-faint" />
        <p className="text-xs tx-muted">Nenhum volume encontrado</p>
        <p className="text-[10px] tx-faint max-w-[220px]">
          Volumes armazenam dados persistentes do banco de dados e outros serviços
        </p>
      </div>
    )
  }

  const handleRemove = async (name: string) => {
    setRemovingName(name)
    try {
      await onRemove(name)
    } finally {
      setRemovingName(null)
    }
  }

  return (
    <div className="space-y-1.5">
      {volumes.map(v => (
        <div
          key={v.name}
          className="card p-3 flex items-center gap-3 hover:border-blue-500/20 transition-all duration-200"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}
          >
            <i className="ri-database-2-line text-sm text-purple-400" />
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold tx-primary truncate block">{v.name}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] tx-faint">
                <i className="ri-settings-3-line mr-0.5" />{v.driver}
              </span>
              {v.createdAt && (
                <span className="text-[10px] tx-faint truncate max-w-[160px]">
                  <i className="ri-time-line mr-0.5" />{v.createdAt.split(' ')[0]}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => handleRemove(v.name)}
            disabled={removingName === v.name}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold
              bg-red-500/10 border border-red-500/20 text-red-400
              hover:bg-red-500/20 disabled:opacity-40 transition"
            title="Remover volume (apaga todos os dados)"
          >
            {removingName === v.name ? (
              <i className="ri-loader-4-line animate-spin text-xs" />
            ) : (
              <i className="ri-delete-bin-line text-xs" />
            )}
            Apagar dados
          </button>
        </div>
      ))}
    </div>
  )
}
