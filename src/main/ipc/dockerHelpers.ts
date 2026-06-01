import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import path from 'node:path'
import { app } from 'electron'
import fs from 'node:fs'

const execAsync = promisify(exec)

export interface DockerContainer {
  id: string
  name: string
  image: string
  status: string
  state: string
  ports: string
  created: string
  projectPath?: string
}

export interface DockerVolume {
  name: string
  driver: string
  mountpoint: string
  createdAt: string
  size: string
  labels: Record<string, string>
}

export async function isDockerRunning(): Promise<boolean> {
  try {
    await execAsync('docker info', { timeout: 5000 })
    return true
  } catch {
    return false
  }
}

/** Load registered project paths from the app database */
export function getKnownProjectNames(): Set<string> {
  const names = new Set<string>()
  try {
    const dbPath = path.join(app.getPath('userData'), 'nika_projects.json')
    if (!fs.existsSync(dbPath)) return names
    const projects = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
    for (const p of projects) {
      if (!p.path) continue
      // docker compose uses lowercased dirname with special chars stripped as project name
      const dirName = path.basename(p.path).toLowerCase().replace(/[^a-z0-9-_]/g, '')
      names.add(dirName)
    }
  } catch {}
  return names
}

function isFromKnownProject(labelsStr: string, knownNames: Set<string>): boolean {
  const composePrj = labelsStr
    .split(',')
    .find((l: string) => l.startsWith('com.docker.compose.project='))
    ?.split('=')
    .slice(1)
    .join('=') ?? ''
  return composePrj !== '' && knownNames.has(composePrj)
}

export async function listContainers(filterProject?: string): Promise<DockerContainer[]> {
  try {
    const knownNames = getKnownProjectNames()
    const { stdout } = await execAsync(
      'docker ps -a --filter "label=com.docker.compose.project" --format "{{json .}}"',
      { timeout: 10000, maxBuffer: 1024 * 1024 }
    )
    const lines = stdout.trim().split('\n').filter(Boolean)
    const containers: DockerContainer[] = lines.map(line => {
      try {
        const j = JSON.parse(line)
        const labelsStr = j.Labels || ''
        if (!isFromKnownProject(labelsStr, knownNames)) return null
        const projectDir = labelsStr
          .split(',')
          .find((l: string) => l.includes('com.docker.compose.project.working_dir'))
          ?.split('=')
          .slice(1)
          .join('=') ?? ''
        return {
          id: j.ID, name: j.Names, image: j.Image, status: j.Status,
          state: j.State, ports: j.Ports || '', created: j.CreatedAt || '',
          projectPath: projectDir,
        }
      } catch { return null }
    }).filter(Boolean) as DockerContainer[]

    if (filterProject) {
      const norm = path.resolve(filterProject)
      return containers.filter(c => c.projectPath && path.resolve(c.projectPath) === norm)
    }
    return containers
  } catch {
    return []
  }
}

export async function listVolumes(filterProject?: string): Promise<DockerVolume[]> {
  try {
    const knownNames = getKnownProjectNames()
    const { stdout } = await execAsync(
      'docker volume ls --filter "label=com.docker.compose.project" --format "{{json .}}"',
      { timeout: 10000, maxBuffer: 1024 * 1024 }
    )
    const lines = stdout.trim().split('\n').filter(Boolean)
    const volumes: DockerVolume[] = lines.map(line => {
      try {
        const j = JSON.parse(line)
        const labelsStr = j.Labels || ''
        if (!isFromKnownProject(labelsStr, knownNames)) return null
        const labels: Record<string, string> = {}
        labelsStr.split(',').forEach((l: string) => {
          const eqIdx = l.indexOf('=')
          if (eqIdx > 0) labels[l.slice(0, eqIdx).trim()] = l.slice(eqIdx + 1).trim()
        })
        return {
          name: j.Name, driver: j.Driver || 'local', mountpoint: j.Mountpoint || '',
          createdAt: j.CreatedAt || '', size: j.Size || '', labels,
        }
      } catch { return null }
    }).filter(Boolean) as DockerVolume[]

    if (filterProject) {
      const projectName = path.basename(filterProject).toLowerCase().replace(/[^a-z0-9-_]/g, '')
      return volumes.filter(v => {
        const composePrj = v.labels['com.docker.compose.project'] || ''
        return composePrj.includes(projectName) || v.name.toLowerCase().includes(projectName)
      })
    }
    return volumes
  } catch {
    return []
  }
}
