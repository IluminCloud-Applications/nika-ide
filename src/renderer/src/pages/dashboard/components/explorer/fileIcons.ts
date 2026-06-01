import {
  FileCode2, FileJson, FileText, FileType, Image, Settings, Database,
  File as FileIcon, Braces, FileSpreadsheet, Lock, Cog,
} from 'lucide-react'
import type { FC } from 'react'

type IconComponent = FC<{ className?: string }>

const extensionMap: Record<string, { icon: IconComponent; color: string }> = {
  tsx: { icon: FileCode2, color: 'text-blue-400' },
  ts: { icon: FileCode2, color: 'text-blue-300' },
  jsx: { icon: FileCode2, color: 'text-yellow-400' },
  js: { icon: FileCode2, color: 'text-yellow-300' },
  py: { icon: Braces, color: 'text-green-400' },
  json: { icon: FileJson, color: 'text-amber-400' },
  md: { icon: FileText, color: 'text-zinc-300' },
  mdx: { icon: FileText, color: 'text-zinc-300' },
  css: { icon: FileType, color: 'text-purple-400' },
  scss: { icon: FileType, color: 'text-pink-400' },
  html: { icon: FileCode2, color: 'text-orange-400' },
  svg: { icon: Image, color: 'text-emerald-400' },
  png: { icon: Image, color: 'text-emerald-300' },
  jpg: { icon: Image, color: 'text-emerald-300' },
  webp: { icon: Image, color: 'text-emerald-300' },
  env: { icon: Lock, color: 'text-yellow-500' },
  yaml: { icon: Settings, color: 'text-red-300' },
  yml: { icon: Settings, color: 'text-red-300' },
  toml: { icon: Cog, color: 'text-zinc-400' },
  sql: { icon: Database, color: 'text-cyan-400' },
  csv: { icon: FileSpreadsheet, color: 'text-green-300' },
}

const specialFiles: Record<string, { icon: IconComponent; color: string }> = {
  'package.json': { icon: FileJson, color: 'text-green-400' },
  'tsconfig.json': { icon: Settings, color: 'text-blue-400' },
  '.gitignore': { icon: Lock, color: 'text-zinc-500' },
  'Dockerfile': { icon: Cog, color: 'text-cyan-400' },
  'docker-compose.yml': { icon: Cog, color: 'text-cyan-400' },
}

export function getFileIcon(fileName: string): { Icon: IconComponent; color: string } {
  const special = specialFiles[fileName]
  if (special) return { Icon: special.icon, color: special.color }

  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const mapped = extensionMap[ext]
  if (mapped) return { Icon: mapped.icon, color: mapped.color }

  return { Icon: FileIcon, color: 'text-zinc-500' }
}
