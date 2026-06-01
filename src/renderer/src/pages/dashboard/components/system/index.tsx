import { useState, useCallback } from 'react'
import { useDockerData } from './useDockerData'
import StatusCard from './StatusCard'
import ContainersList from './ContainersList'
import VolumesList from './VolumesList'
import SystemActions from './SystemActions'
import DiskUsageCard from './DiskUsageCard'
import { SystemHeader, Section, DockerOfflineState, LoadingState, ErrorState } from './SystemWidgets'

interface SystemPanelProps {
  projectPath: string
  isRunning: boolean
  onStopApp: () => void
}

export default function SystemPanel({ projectPath, isRunning, onStopApp }: SystemPanelProps) {
  const [scope, setScope] = useState<'project' | 'all'>('project')
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const { dockerRunning, containers, volumes, diskUsage, loading, error, refresh } = useDockerData({
    projectPath,
    filterByProject: scope === 'project',
  })

  const showStatus = (text: string, type: 'success' | 'error') => {
    setStatusMsg({ text, type })
    setTimeout(() => setStatusMsg(null), 3000)
  }

  const handleStopContainer = useCallback(async (id: string) => {
    const result = await window.api.docker.stopContainer(id)
    if (result.success) { showStatus('Container parado com sucesso', 'success'); refresh() }
    else showStatus(result.error || 'Erro ao parar container', 'error')
  }, [refresh])

  const handleRemoveContainer = useCallback(async (id: string) => {
    const result = await window.api.docker.removeContainer(id)
    if (result.success) { showStatus('Container removido', 'success'); refresh() }
    else showStatus(result.error || 'Erro ao remover container', 'error')
  }, [refresh])

  const handleRemoveVolume = useCallback(async (name: string) => {
    const result = await window.api.docker.removeVolume(name)
    if (result.success) { showStatus('Dados apagados com sucesso', 'success'); refresh() }
    else showStatus(result.error || 'Erro ao apagar dados (volume em uso?)', 'error')
  }, [refresh])

  const handleResetProject = useCallback(async () => {
    if (isRunning) onStopApp()
    const result = await window.api.docker.resetProject(projectPath)
    if (result.success) { showStatus('Projeto resetado! Todos os dados foram limpos.', 'success'); refresh() }
    else showStatus(result.error || 'Erro ao resetar projeto', 'error')
  }, [projectPath, isRunning, onStopApp, refresh])

  const handleCleanupAll = useCallback(async () => {
    if (isRunning) onStopApp()
    const result = await window.api.docker.cleanupAll(projectPath)
    if (result.success) { showStatus('Limpeza completa realizada!', 'success'); refresh() }
    else showStatus(result.error || 'Erro na limpeza', 'error')
  }, [projectPath, isRunning, onStopApp, refresh])

  const handleSmartPrune = useCallback(async () => {
    const result = await window.api.docker.smartPrune()
    if (result.success) { showStatus(result.message || 'Limpeza inteligente concluída', 'success'); refresh() }
    else showStatus(result.error || 'Erro na limpeza inteligente', 'error')
  }, [refresh])

  const runningCount = containers.filter(c => c.state === 'running').length
  const stoppedCount = containers.filter(c => c.state !== 'running').length

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-fade-in">
      <SystemHeader scope={scope} onScopeChange={setScope} onRefresh={refresh} loading={loading} />

      <div className="flex-1 overflow-y-auto p-4 space-y-5" style={{ scrollbarWidth: 'thin' }}>
        {dockerRunning === false && <DockerOfflineState />}

        {dockerRunning && !loading && (
          <>
            <div className="grid grid-cols-4 gap-2">
              <StatusCard icon="ri-play-circle-line" label="Rodando" value={runningCount} color="#10b981" />
              <StatusCard icon="ri-stop-circle-line" label="Parados" value={stoppedCount} color="#71717a" />
              <StatusCard icon="ri-database-2-line" label="Volumes" value={volumes.length} color="#a855f7" />
              <StatusCard
                icon="ri-pulse-line" label="Status"
                value={isRunning ? 'Ativo' : 'Inativo'}
                color={isRunning ? '#10b981' : '#71717a'}
              />
            </div>

            <Section title="Ações Rápidas" icon="ri-flashlight-line">
              <SystemActions
                onResetProject={handleResetProject}
                onCleanupAll={handleCleanupAll}
                onSmartPrune={handleSmartPrune}
                hasContainers={containers.length > 0}
                hasVolumes={volumes.length > 0}
              />
            </Section>

            <Section title="Serviços" icon="ri-server-line" badge={containers.length}>
              <ContainersList
                containers={containers}
                onStop={handleStopContainer}
                onRemove={handleRemoveContainer}
              />
            </Section>

            <Section title="Armazenamento de Dados" icon="ri-hard-drive-3-line" badge={volumes.length}>
              <VolumesList volumes={volumes} onRemove={handleRemoveVolume} />
            </Section>

            {scope === 'all' && <DiskUsageCard usage={diskUsage} />}
          </>
        )}

        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refresh} />}
      </div>

      {statusMsg && (
        <div
          className="absolute bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border card backdrop-blur-md shadow-2xl animate-slide-up"
          style={{
            borderColor: statusMsg.type === 'success' ? '#10b98150' : '#ef444450',
            color: statusMsg.type === 'success' ? '#10b981' : '#ef4444',
          }}
        >
          <i className={statusMsg.type === 'success' ? 'ri-checkbox-circle-fill text-lg' : 'ri-error-warning-fill text-lg'} />
          <span className="text-xs font-semibold tx-primary">{statusMsg.text}</span>
        </div>
      )}
    </div>
  )
}
