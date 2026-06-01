import { RefreshCw } from 'lucide-react'

interface DockerPageHeaderProps {
  loading: boolean
  onRefresh: () => void
}

export default function DockerPageHeader({ loading, onRefresh }: DockerPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tx-primary">Gestão</h1>
        <p className="tx-muted text-sm mt-1">
          Visão global dos serviços, dados e recursos Docker de todos os projetos.
        </p>
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="btn-surface flex items-center gap-2"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        Atualizar
      </button>
    </div>
  )
}
