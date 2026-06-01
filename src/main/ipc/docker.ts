import { ipcMain } from 'electron'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import fs from 'node:fs'
import { isDockerRunning, listContainers, listVolumes, getKnownProjectNames } from './dockerHelpers'

const execAsync = promisify(exec)

/** Run a docker command, return true on success */
async function dockerExec(cmd: string, timeoutMs = 15000): Promise<{ ok: boolean; out: string }> {
  try {
    const { stdout, stderr } = await execAsync(cmd, { timeout: timeoutMs })
    return { ok: true, out: stdout + stderr }
  } catch (err: any) {
    return { ok: false, out: err.stderr || err.message }
  }
}

export function registerDockerHandlers() {
  ipcMain.handle('docker:check', async () => {
    return { running: await isDockerRunning() }
  })

  ipcMain.handle('docker:list-containers', async (_, opts?: { projectPath?: string }) => {
    if (!(await isDockerRunning())) return { success: false, containers: [], error: 'Docker não está rodando' }
    return { success: true, containers: await listContainers(opts?.projectPath) }
  })

  ipcMain.handle('docker:list-volumes', async (_, opts?: { projectPath?: string }) => {
    if (!(await isDockerRunning())) return { success: false, volumes: [], error: 'Docker não está rodando' }
    return { success: true, volumes: await listVolumes(opts?.projectPath) }
  })

  ipcMain.handle('docker:stop-container', async (_, { containerId }: { containerId: string }) => {
    const r = await dockerExec(`docker stop ${containerId}`)
    return r.ok ? { success: true } : { success: false, error: r.out }
  })

  ipcMain.handle('docker:remove-container', async (_, { containerId }: { containerId: string }) => {
    // Force kill + remove in one shot
    const r = await dockerExec(`docker rm -f ${containerId}`)
    return r.ok ? { success: true } : { success: false, error: r.out }
  })

  ipcMain.handle('docker:remove-volume', async (_, { volumeName }: { volumeName: string }) => {
    // First remove any containers still referencing this volume
    const { ok: foundContainers, out: containerIds } = await dockerExec(
      `docker ps -aq --filter volume=${volumeName}`
    )
    if (foundContainers && containerIds.trim()) {
      for (const id of containerIds.trim().split('\n').filter(Boolean)) {
        await dockerExec(`docker rm -f ${id}`)
      }
    }
    const r = await dockerExec(`docker volume rm -f ${volumeName}`)
    return r.ok ? { success: true } : { success: false, error: r.out }
  })

  ipcMain.handle('docker:reset-project', async (_, { projectPath }: { projectPath: string }) => {
    // If a specific project path is given, use compose down
    if (projectPath) {
      const dockerFile = path.join(projectPath, 'docker-compose.yml')
      if (fs.existsSync(dockerFile)) {
        const r = await dockerExec('docker compose down -v --remove-orphans', 30000)
        return r.ok
          ? { success: true, message: 'Projeto resetado com sucesso' }
          : { success: false, error: r.out }
      }
    }
    // Global reset: iterate through all known Nika containers then volumes
    return await removeAllNikaResources(false)
  })

  ipcMain.handle('docker:cleanup-all', async (_, { projectPath }: { projectPath: string }) => {
    if (projectPath) {
      const dockerFile = path.join(projectPath, 'docker-compose.yml')
      if (fs.existsSync(dockerFile)) {
        const r = await dockerExec('docker compose down -v --remove-orphans --rmi local', 60000)
        return r.ok
          ? { success: true, message: 'Limpeza completa do projeto' }
          : { success: false, error: r.out }
      }
    }
    return await removeAllNikaResources(true)
  })

  ipcMain.handle('docker:disk-usage', async () => {
    try {
      const { stdout } = await execAsync(
        'docker system df --format "{{json .}}"', { timeout: 10000 }
      )
      const items = stdout.trim().split('\n').filter(Boolean).map(l => {
        try { return JSON.parse(l) } catch { return null }
      }).filter(Boolean)
      return { success: true, usage: items }
    } catch (err: any) {
      return { success: false, usage: [], error: err.stderr || err.message }
    }
  })

  ipcMain.handle('docker:smart-prune', async () => {
    const freed: string[] = []
    try {
      const { stdout } = await execAsync('docker image prune -f', { timeout: 30000 })
      const m = stdout.match(/Total reclaimed space:\s*(.+)/i)
      if (m) freed.push(`Imagens: ${m[1].trim()}`)
    } catch {}
    try {
      await execAsync('docker network prune -f', { timeout: 15000 })
    } catch {}
    try {
      const { stdout } = await execAsync('docker builder prune -f', { timeout: 30000 })
      const m = stdout.match(/Total reclaimed space:\s*(.+)/i)
      if (m) freed.push(`Cache: ${m[1].trim()}`)
    } catch {}
    return {
      success: true,
      message: freed.length ? `Espaço liberado — ${freed.join(', ')}` : 'Nenhum recurso órfão encontrado',
    }
  })
}

/** Remove all Nika IDE containers + volumes (+ images if requested) */
async function removeAllNikaResources(removeImages: boolean) {
  const removed = { containers: 0, volumes: 0, images: 0 }
  const errors: string[] = []

  // 1. Remove all known containers
  const containers = await listContainers()
  for (const c of containers) {
    const r = await dockerExec(`docker rm -f ${c.id}`)
    if (r.ok) removed.containers++
    else errors.push(`Container ${c.name}: ${r.out}`)
  }

  // 2. Remove all known volumes
  const volumes = await listVolumes()
  for (const v of volumes) {
    const r = await dockerExec(`docker volume rm -f ${v.name}`)
    if (r.ok) removed.volumes++
    else errors.push(`Volume ${v.name}: ${r.out}`)
  }

  // 3. Remove images + build cache (only on full cleanup)
  if (removeImages) {
    const knownNames = getKnownProjectNames()
    // Docker compose names images as "projectname-servicename"
    const { ok, out } = await dockerExec('docker images --format "{{.Repository}} {{.ID}}"')
    if (ok && out.trim()) {
      for (const line of out.trim().split('\n').filter(Boolean)) {
        const [repo, imageId] = line.split(' ')
        const repoLower = (repo || '').toLowerCase()
        const isNika = [...knownNames].some(name => repoLower.startsWith(name + '-') || repoLower === name)
        if (isNika && imageId) {
          const r = await dockerExec(`docker rmi -f ${imageId}`)
          if (r.ok) removed.images++
          else errors.push(`Imagem ${repo}: ${r.out}`)
        }
      }
    }
    // Prune dangling images and build cache left from our builds
    await dockerExec('docker image prune -f')
    await dockerExec('docker builder prune -f')
  }

  const parts = [`${removed.containers} container(s)`, `${removed.volumes} volume(s)`]
  if (removeImages) parts.push(`${removed.images} imagem(ns)`)
  const msg = `Removidos: ${parts.join(', ')}`
  return { success: errors.length === 0, message: msg, error: errors.join('; ') || undefined }
}
