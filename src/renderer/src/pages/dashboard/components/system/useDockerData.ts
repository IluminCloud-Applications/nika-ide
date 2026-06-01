import { useState, useEffect, useCallback } from 'react'
import { DockerContainer, DockerVolume, DiskUsageItem } from './types'

interface UseDockerDataOpts {
  projectPath: string
  filterByProject: boolean
}

export function useDockerData({ projectPath, filterByProject }: UseDockerDataOpts) {
  const [dockerRunning, setDockerRunning] = useState<boolean | null>(null)
  const [containers, setContainers] = useState<DockerContainer[]>([])
  const [volumes, setVolumes] = useState<DockerVolume[]>([])
  const [diskUsage, setDiskUsage] = useState<DiskUsageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const check = await window.api.docker.check()
      setDockerRunning(check.running)

      if (!check.running) {
        setContainers([])
        setVolumes([])
        setDiskUsage([])
        setLoading(false)
        return
      }

      const opts = filterByProject ? { projectPath } : undefined
      const [cResult, vResult, dResult] = await Promise.all([
        window.api.docker.listContainers(opts),
        window.api.docker.listVolumes(opts),
        window.api.docker.diskUsage(),
      ])

      if (cResult.success) setContainers(cResult.containers)
      if (vResult.success) setVolumes(vResult.volumes)
      if (dResult.success) setDiskUsage(dResult.usage)
    } catch (err: any) {
      setError(err.message || 'Erro ao consultar Docker')
    } finally {
      setLoading(false)
    }
  }, [projectPath, filterByProject])

  useEffect(() => { refresh() }, [refresh])

  return { dockerRunning, containers, volumes, diskUsage, loading, error, refresh }
}
