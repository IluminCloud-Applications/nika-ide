import os from 'node:os'
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

/**
 * Recarrega as variáveis de ambiente PATH do Registro do Windows (HKLM e HKCU)
 * e injeta caminhos padrão comuns para Node.js, Git, Python e Docker Desktop.
 * Isso garante que o app detecte ferramentas recém-instaladas sem precisar reiniciar.
 */
export function refreshWindowsPath() {
  if (os.platform() !== 'win32') return

  try {
    // Busca o PATH do sistema e do usuário no registro do Windows
    const hklmOutput = execSync('reg query "HKLM\\System\\CurrentControlSet\\Control\\Session Manager\\Environment" /v Path', { encoding: 'utf-8', timeout: 2000 })
    const hkcuOutput = execSync('reg query "HKCU\\Environment" /v Path', { encoding: 'utf-8', timeout: 2000 })

    const parsePath = (out: string) => {
      const match = out.match(/Path\s+REG_(?:EXPAND_)?SZ\s+(.*)/i)
      return match ? match[1].trim() : ''
    }

    const sysPath = parsePath(hklmOutput)
    const userPath = parsePath(hkcuOutput)

    // Mescla os caminhos
    const paths = [sysPath, userPath].filter(Boolean).join(';')

    // Expande variáveis de ambiente no formato %VARIAVEL% (ex: %SystemRoot%)
    const expanded = paths.replace(/%([^%]+)%/g, (_, key) => process.env[key] || `%${key}%`)

    // Separa os caminhos individuais e remove duplicados
    const uniquePaths = Array.from(new Set(expanded.split(';').map(p => p.trim()).filter(Boolean)))

    // Adiciona caminhos de instalação padrão mais comuns como fallback imediato
    const userHome = os.homedir()
    const programFiles = process.env.ProgramFiles || 'C:\\Program Files'
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)'
    const localAppData = process.env.LocalAppData || path.join(userHome, 'AppData\\Local')
    const appData = process.env.AppData || path.join(userHome, 'AppData\\Roaming')

    const fallbacks = [
      path.join(programFiles, 'nodejs'),
      path.join(programFilesX86, 'nodejs'),
      path.join(appData, 'npm'),
      path.join(programFiles, 'Git\\cmd'),
      path.join(programFilesX86, 'Git\\cmd'),
      path.join(localAppData, 'Programs\\Git\\cmd'),
      path.join(programFiles, 'Docker\\Docker\\resources\\bin'),
      path.join(localAppData, 'Microsoft\\WindowsApps'),
      path.join(localAppData, 'Programs\\Python\\Python312'),
      path.join(localAppData, 'Programs\\Python\\Python311'),
      path.join(localAppData, 'Programs\\Python\\Python310'),
      path.join(localAppData, 'Programs\\Python\\Python39'),
    ]

    for (const fb of fallbacks) {
      if (fs.existsSync(fb) && !uniquePaths.some(p => p.toLowerCase() === fb.toLowerCase())) {
        uniquePaths.push(fb)
      }
    }

    process.env.PATH = uniquePaths.join(';')
  } catch (err) {
    // Caso a leitura de registro falhe por permissão ou outro motivo, injeta fallbacks
    const currentPath = process.env.PATH || ''
    const currentSet = new Set(currentPath.split(';').map(p => p.toLowerCase().trim()))
    const userHome = os.homedir()
    const programFiles = process.env.ProgramFiles || 'C:\\Program Files'
    const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)'
    const localAppData = process.env.LocalAppData || path.join(userHome, 'AppData\\Local')
    const appData = process.env.AppData || path.join(userHome, 'AppData\\Roaming')

    const fallbacks = [
      path.join(programFiles, 'nodejs'),
      path.join(programFilesX86, 'nodejs'),
      path.join(appData, 'npm'),
      path.join(programFiles, 'Git\\cmd'),
      path.join(programFilesX86, 'Git\\cmd'),
      path.join(localAppData, 'Programs\\Git\\cmd'),
      path.join(programFiles, 'Docker\\Docker\\resources\\bin'),
      path.join(localAppData, 'Microsoft\\WindowsApps'),
      path.join(localAppData, 'Programs\\Python\\Python312'),
      path.join(localAppData, 'Programs\\Python\\Python311'),
    ]

    const added: string[] = []
    for (const fb of fallbacks) {
      if (fs.existsSync(fb) && !currentSet.has(fb.toLowerCase().trim())) {
        added.push(fb)
      }
    }

    if (added.length > 0) {
      process.env.PATH = `${currentPath};${added.join(';')}`
    }
  }
}
