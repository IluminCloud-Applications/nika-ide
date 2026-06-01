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

export interface DiskUsageItem {
  Type: string
  TotalCount: string
  Active: string
  Size: string
  Reclaimable: string
}
