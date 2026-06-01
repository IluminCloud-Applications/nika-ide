import { useState, useCallback } from 'react'
import PageShell from '../../components/layout/PageShell'
import StatusCard from '../dashboard/components/system/StatusCard'
import ContainersList from '../dashboard/components/system/ContainersList'
import VolumesList from '../dashboard/components/system/VolumesList'
import SystemActions from '../dashboard/components/system/SystemActions'
import DiskUsageCard from '../dashboard/components/system/DiskUsageCard'
import { useDockerData } from '../dashboard/components/system/useDockerData'
import { Section, DockerOfflineState, LoadingState, ErrorState } from '../dashboard/components/system/SystemWidgets'
import DockerPageHeader from './components/DockerPageHeader'

export default function DockerPage() {
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const { dockerRunning, containers, volumes, diskUsage, loading, error, refresh } = useDockerData({
    projectPath: '',
    filterByProject: false,
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

  const handleSmartPrune = useCallback(async () => {
    const result = await window.api.docker.smartPrune()
    if (result.success) { showStatus(result.message || 'Limpeza inteligente concluída', 'success'); refresh() }
    else showStatus(result.error || 'Erro na limpeza inteligente', 'error')
  }, [refresh])

  const handleResetProject = useCallback(async () => {
    const result = await window.api.docker.resetProject('')
    if (result.success) { showStatus(result.message || 'Todos os recursos Nika removidos', 'success'); refresh() }
    else showStatus(result.error || 'Erro ao resetar', 'error')
  }, [refresh])

  const handleCleanupAll = useCallback(async () => {
    const result = await window.api.docker.cleanupAll('')
    if (result.success) { showStatus(result.message || 'Limpeza completa realizada', 'success'); refresh() }
    else showStatus(result.error || 'Erro na limpeza', 'error')
  }, [refresh])

  const runningCount = containers.filter(c => c.state === 'running').length
  const stoppedCount = containers.filter(c => c.state !== 'running').length

  return (
    <PageShell>
      <DockerPageHeader loading={loading} onRefresh={refresh} />

      <div className="flex flex-col gap-5 relative">
        {dockerRunning === false && <DockerOfflineState />}

        {dockerRunning && !loading && (
          <>
            <div className="grid grid-cols-4 gap-2">
              <StatusCard icon="ri-play-circle-line" label="Rodando" value={runningCount} color="#10b981" />
              <StatusCard icon="ri-stop-circle-line" label="Parados" value={stoppedCount} color="#71717a" />
              <StatusCard icon="ri-database-2-line" label="Volumes" value={volumes.length} color="#a855f7" />
              <StatusCard icon="ri-server-line" label="Total" value={containers.length} color="#60a5fa" />
            </div>

            <Section title="Limpeza" icon="ri-sparkling-line">
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

            <DiskUsageCard usage={diskUsage} />
          </>
        )}

        {loading && <LoadingState />}
        {error && <ErrorState message={error} onRetry={refresh} />}

        {statusMsg && (
          <div
            className="fixed bottom-10 right-10 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl border card backdrop-blur-md shadow-2xl animate-slide-up"
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
    </PageShell>
  )
}
