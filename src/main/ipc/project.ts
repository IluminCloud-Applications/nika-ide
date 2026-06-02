import { app, ipcMain, dialog } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { execSync, spawn, ChildProcess } from 'node:child_process'
import { loadMcpState, syncMcpStateToProject } from './mcp'
import { updateProjectInstructions } from './projectInstructions'

const diffPreviews = new Map<string, { proc: ChildProcess; tempPath: string }>()

const getProjectsDbPath = () => path.join(app.getPath('userData'), 'nika_projects.json')
const getSettingsPath  = () => path.join(app.getPath('userData'), 'nika_settings.json')
const getSkillsDbPath  = () => path.join(app.getPath('userData'), 'nika_skills.json')

function loadProjects() {
  const dbPath = getProjectsDbPath()
  if (!fs.existsSync(dbPath)) return []
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
  } catch {
    return []
  }
}

function saveProjects(projects: any[]) {
  const dbPath = getProjectsDbPath()
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  fs.writeFileSync(dbPath, JSON.stringify(projects, null, 2), 'utf-8')
}

const getArchivedProjectsDbPath = () => path.join(app.getPath('userData'), 'nika_archived_projects.json')

function loadArchivedProjects() {
  const dbPath = getArchivedProjectsDbPath()
  if (!fs.existsSync(dbPath)) return []
  try {
    return JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
  } catch {
    return []
  }
}

function saveArchivedProjects(projects: any[]) {
  const dbPath = getArchivedProjectsDbPath()
  fs.mkdirSync(path.dirname(dbPath), { recursive: true })
  fs.writeFileSync(dbPath, JSON.stringify(projects, null, 2), 'utf-8')
}

function loadSettings(): { workspacePath?: string } {
  const p = getSettingsPath()
  if (!fs.existsSync(p)) return {}
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')) } catch { return {} }
}

function saveSettings(settings: any) {
  const p = getSettingsPath()
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, JSON.stringify(settings, null, 2), 'utf-8')
}

// ─── Skills persistence ────────────────────────────────────────────────────

/** Returns a map of skillId → enabled (persisted in userData) */
function loadSkillsState(): Record<string, boolean> {
  const p = getSkillsDbPath()
  if (!fs.existsSync(p)) return {}
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')) } catch { return {} }
}

function saveSkillsState(state: Record<string, boolean>) {
  const p = getSkillsDbPath()
  fs.writeFileSync(p, JSON.stringify(state, null, 2), 'utf-8')
}

function getTemplateSkillsDir(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'templates', 'project-template', '.agents', 'skills')
    : path.join(app.getAppPath(), 'templates', 'project-template', '.agents', 'skills')
}

/** Copy a single skill folder into a project's .agents/skills/ and .claude/skills/ */
function installSkillInProject(skillId: string, projectPath: string) {
  const src = path.join(getTemplateSkillsDir(), skillId)
  if (!fs.existsSync(src)) return

  // Copy to .agents/skills
  const destAgents = path.join(projectPath, '.agents', 'skills', skillId)
  fs.mkdirSync(destAgents, { recursive: true })
  fs.cpSync(src, destAgents, { recursive: true })

  // Copy to .claude/skills
  const destClaude = path.join(projectPath, '.claude', 'skills', skillId)
  fs.mkdirSync(destClaude, { recursive: true })
  fs.cpSync(src, destClaude, { recursive: true })
}

/** Remove a skill folder from a project's .agents/skills/ and .claude/skills/ */
function removeSkillFromProject(skillId: string, projectPath: string) {
  // Remove from .agents/skills
  const destAgents = path.join(projectPath, '.agents', 'skills', skillId)
  if (fs.existsSync(destAgents)) fs.rmSync(destAgents, { recursive: true, force: true })

  // Remove from .claude/skills
  const destClaude = path.join(projectPath, '.claude', 'skills', skillId)
  if (fs.existsSync(destClaude)) fs.rmSync(destClaude, { recursive: true, force: true })
}

function runGit(command: string, cwd: string): string {
  return execSync(command, { cwd, encoding: 'utf-8', timeout: 10000 })
}



export function registerProjectHandlers() {
  ipcMain.handle('projects:list', () => loadProjects())

  // ─── Skills handlers ──────────────────────────────────────────────────────

  ipcMain.handle('skills:get-state', () => loadSkillsState())

  /** Toggle a skill and sync the change to every existing project */
  ipcMain.handle('skills:set-enabled', (_, { skillId, enabled, skillIds }: {
    skillId: string; enabled: boolean; skillIds: string[]
  }) => {
    const state = loadSkillsState()

    // Ensure all known skills have an entry — default to enabled on first run
    for (const id of skillIds) {
      if (!(id in state)) state[id] = true
    }
    state[skillId] = enabled
    saveSkillsState(state)

    // Sync to all existing projects
    const projects = loadProjects()
    for (const project of projects) {
      if (!fs.existsSync(project.path)) continue
      if (enabled) {
        installSkillInProject(skillId, project.path)
      } else {
        removeSkillFromProject(skillId, project.path)
      }
    }

    return { success: true }
  })

  ipcMain.handle('settings:get', () => loadSettings())

  ipcMain.handle('settings:set', (_, settings: any) => {
    saveSettings(settings)
    return { success: true }
  })

  ipcMain.handle('settings:select-workspace', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Selecionar pasta padrão de projetos',
      properties: ['openDirectory', 'createDirectory']
    })
    if (result.canceled) return null
    return result.filePaths[0]
  })

  ipcMain.handle('projects:select-dir', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] })
    if (result.canceled) return null
    return result.filePaths[0]
  })

  ipcMain.handle('projects:select-image', async () => {
    const result = await dialog.showOpenDialog({
      title: 'Selecionar imagem do projeto',
      properties: ['openFile'],
      filters: [{ name: 'Imagens', extensions: ['png', 'jpg', 'jpeg', 'webp', 'svg'] }]
    })
    if (result.canceled) return null
    const src = result.filePaths[0]
    const iconsDir = path.join(app.getPath('userData'), 'project_icons')
    fs.mkdirSync(iconsDir, { recursive: true })
    const dest = path.join(iconsDir, `${Date.now()}${path.extname(src)}`)
    fs.copyFileSync(src, dest)
    return dest
  })

  ipcMain.handle('projects:create', async (_, details: {
    name: string; description: string; color: string; path: string; imagePath?: string; isStudio?: boolean
  }) => {
    const { name, description, color, path: projectPath, imagePath, isStudio } = details

    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true })
    }

    const templateDir = app.isPackaged
      ? path.join(process.resourcesPath, 'templates', 'project-template')
      : path.join(app.getAppPath(), 'templates', 'project-template')

    if (fs.existsSync(templateDir)) {
      // Copy template but skip .agents/skills and .claude/skills — we'll only copy enabled skills below
      fs.cpSync(templateDir, projectPath, {
        recursive: true,
        filter: (src) => {
          const rel = path.relative(templateDir, src)
          // Block individual skill folders but allow .agents/skills itself (as empty dir)
          return !rel.match(/^(\.agents|\.claude)[/\\]skills[/\\].+/)
        }
      })

      // Copy only enabled skills
      const skillsState = loadSkillsState()
      const templateSkillsDir = getTemplateSkillsDir()
      if (fs.existsSync(templateSkillsDir)) {
        const availableSkills = fs.readdirSync(templateSkillsDir)
        for (const skillId of availableSkills) {
          // Default to enabled if no preference saved yet
          const isEnabled = skillId in skillsState ? skillsState[skillId] : true
          if (isEnabled) {
            installSkillInProject(skillId, projectPath)
          }
        }
      }

      // Inject project name/description into frontend .env
      const envPath = path.join(projectPath, 'frontend', '.env')
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf-8')
        envContent = envContent
          .replace(/VITE_APP_NAME=.*/, `VITE_APP_NAME=${name}`)
          .replace(/VITE_APP_DESCRIPTION=.*/, `VITE_APP_DESCRIPTION=${description}`)
        fs.writeFileSync(envPath, envContent, 'utf-8')
      }

      // Replace tokens in frontend/index.html
      const indexHtmlPath = path.join(projectPath, 'frontend', 'index.html')
      if (fs.existsSync(indexHtmlPath)) {
        let html = fs.readFileSync(indexHtmlPath, 'utf-8')
        html = html.replace(/__APP_NAME__/g, name).replace(/__APP_DESCRIPTION__/g, description)
        fs.writeFileSync(indexHtmlPath, html, 'utf-8')
      }
    } else {
      fs.mkdirSync(path.join(projectPath, 'frontend', 'src'), { recursive: true })
      fs.mkdirSync(path.join(projectPath, 'backend', 'api'), { recursive: true })
      fs.writeFileSync(path.join(projectPath, 'GEMINI.md'), '# instructions', 'utf-8')
      fs.writeFileSync(path.join(projectPath, 'CLAUDE.md'), '# instructions', 'utf-8')
      fs.writeFileSync(path.join(projectPath, 'AGENTS.md'), '# instructions', 'utf-8')
    }

    // Inject project name and description dynamically in instructions files
    updateProjectInstructions(projectPath, name, description)

    // Sync MCP configurations
    try {
      const mcpState = loadMcpState()
      syncMcpStateToProject(projectPath, mcpState)
    } catch (e) {
      console.error('Failed to sync MCP state on project create:', e)
    }

    // Initialize git repository
    try {
      // 1. Write a .gitignore if none exists in root
      const gitignorePath = path.join(projectPath, '.gitignore')
      if (!fs.existsSync(gitignorePath)) {
        const gitignoreContent = [
          'node_modules/',
          'dist/',
          'dist-electron/',
          '.venv/',
          'venv/',
          '__pycache__/',
          '*.pyc',
          '.env',
          '.env.local',
          '.DS_Store',
          '.trash/',
        ].join('\n')
        fs.writeFileSync(gitignorePath, gitignoreContent, 'utf-8')
      }

      runGit('git init -b main', projectPath)

      // 2. Set default user name and email locally if not set globally/locally
      try {
        runGit('git config user.name', projectPath)
      } catch {
        try {
          runGit('git config --local user.name "User"', projectPath)
        } catch {}
      }
      try {
        runGit('git config user.email', projectPath)
      } catch {
        try {
          runGit('git config --local user.email "user@ilumin.internal"', projectPath)
        } catch {}
      }

      // 3. Make initial commit
      runGit('git add -A', projectPath)
      runGit('git commit -m "init"', projectPath)
    } catch (gitErr: any) {
      console.error('Erro ao inicializar Git no projeto:', gitErr)
    }

    const projects = loadProjects()
    const newProject = {
      id: Date.now().toString(),
      name, description, color, imagePath,
      path: projectPath,
      status: 'draft',
      publishedHash: null,
      createdAt: new Date().toISOString(),
      isStudio: !!isStudio
    }
    projects.push(newProject)
    saveProjects(projects)
    return newProject
  })

  ipcMain.handle('projects:update-status', (_, id: string, status: 'draft' | 'published' | 'modified') => {
    const projects = loadProjects()
    const idx = projects.findIndex((p: any) => p.id === id)
    if (idx === -1) throw new Error('Project not found')

    let publishedHash: string | null = projects[idx].publishedHash ?? null

    if (status === 'published') {
      // Try to get the current HEAD hash for the published reference
      try {
        const hash = runGit('git rev-parse HEAD', projects[idx].path).trim()
        publishedHash = hash
      } catch {
        publishedHash = null
      }
    }

    projects[idx].status = status
    projects[idx].publishedHash = publishedHash
    saveProjects(projects)
    return projects[idx]
  })

  ipcMain.handle('projects:update', (_, id: string, updates: {
    name?: string; description?: string; color?: string; imagePath?: string; imported?: boolean
  }) => {
    const projects = loadProjects()
    const idx = projects.findIndex((p: any) => p.id === id)
    if (idx === -1) throw new Error('Project not found')
    
    const hasNameOrDescUpdate = 'name' in updates || 'description' in updates
    
    const allowed = ['name', 'description', 'color', 'imagePath', 'imported']
    allowed.forEach(key => {
      if (key in updates) projects[idx][key] = (updates as any)[key]
    })
    saveProjects(projects)

    if (hasNameOrDescUpdate && fs.existsSync(projects[idx].path)) {
      updateProjectInstructions(projects[idx].path, projects[idx].name, projects[idx].description)
    }

    return projects[idx]
  })

  ipcMain.handle('projects:archive', async (_, id: string) => {
    const projects = loadProjects()
    const idx = projects.findIndex((p: any) => p.id === id)
    if (idx === -1) throw new Error('Project not found')

    const project = projects[idx]
    const projectPath = project.path
    let finalDest = projectPath

    if (fs.existsSync(projectPath)) {
      const parentDir = path.dirname(projectPath)
      const trashDir = path.join(parentDir, '.trash')
      fs.mkdirSync(trashDir, { recursive: true })

      const projectName = path.basename(projectPath)
      const dest = path.join(trashDir, projectName)

      // If destination already exists, add a timestamp suffix
      finalDest = fs.existsSync(dest)
        ? path.join(trashDir, `${projectName}_${Date.now()}`)
        : dest

      fs.renameSync(projectPath, finalDest)
    }

    const archivedProjects = loadArchivedProjects()
    archivedProjects.push({
      ...project,
      originalPath: projectPath,
      path: finalDest,
      archivedAt: new Date().toISOString()
    })
    saveArchivedProjects(archivedProjects)

    projects.splice(idx, 1)
    saveProjects(projects)
    return { success: true }
  })

  ipcMain.handle('projects:list-archived', () => {
    return loadArchivedProjects()
  })

  ipcMain.handle('projects:restore', async (_, id: string) => {
    const archivedProjects = loadArchivedProjects()
    const idx = archivedProjects.findIndex((p: any) => p.id === id)
    if (idx === -1) throw new Error('Archived project not found')

    const project = archivedProjects[idx]
    const archivedPath = project.path
    const originalPath = project.originalPath
    let dest = originalPath

    if (fs.existsSync(archivedPath)) {
      const originalParentDir = path.dirname(originalPath)
      fs.mkdirSync(originalParentDir, { recursive: true })

      if (fs.existsSync(originalPath)) {
        const base = path.basename(originalPath)
        dest = path.join(originalParentDir, `${base}_restored_${Date.now()}`)
      }
      fs.renameSync(archivedPath, dest)
      project.path = dest
    }

    const restoredProject = { ...project }
    delete restoredProject.originalPath
    delete restoredProject.archivedAt

    const projects = loadProjects()
    projects.push(restoredProject)
    saveProjects(projects)

    archivedProjects.splice(idx, 1)
    saveArchivedProjects(archivedProjects)

    return { success: true, project: restoredProject }
  })



  ipcMain.handle('projects:git-log', (_, projectPath: string) => {
    try {
      const output = runGit('git log --pretty=format:"%H|%h|%s|%ar" -20', projectPath)
      if (!output.trim()) return []
      return output.trim().split('\n').map(line => {
        const [hash, shortHash, message, date] = line.replace(/^"|"$/g, '').split('|')
        return { hash, shortHash, message, date }
      })
    } catch (e: any) {
      throw new Error('Repositório Git não encontrado. Inicialize com "git init" no projeto.')
    }
  })

  ipcMain.handle('projects:git-rollback', (_, projectPath: string, hash: string) => {
    try {
      runGit(`git checkout ${hash} -- .`, projectPath)
      return { success: true }
    } catch (e: any) {
      throw new Error('Erro no rollback: ' + e.message)
    }
  })

  ipcMain.handle('projects:git-commit', (_, { projectPath, message }: { projectPath: string; message: string }) => {
    try {
      if (!fs.existsSync(path.join(projectPath, '.git'))) {
        runGit('git init -b main', projectPath)
      }

      // Check user.name / user.email
      try {
        runGit('git config user.name', projectPath)
      } catch {
        try {
          runGit('git config --local user.name "User"', projectPath)
        } catch {}
      }
      try {
        runGit('git config user.email', projectPath)
      } catch {
        try {
          runGit('git config --local user.email "user@ilumin.internal"', projectPath)
        } catch {}
      }

      runGit('git add -A', projectPath)

      // Check status to see if there are any changes
      const status = runGit('git status --porcelain', projectPath).trim()
      if (!status) {
        return { success: true, noChanges: true }
      }

      runGit(`git commit -m "${message.replace(/"/g, '\\"')}"`, projectPath)
      return { success: true }
    } catch (e: any) {
      throw new Error('Erro ao salvar versão: ' + e.message)
    }
  })

  ipcMain.handle('projects:git-start-diff-preview', async (_, projectPath: string, hash: string) => {
    const tempRoot = path.join(app.getPath('temp'), 'ilumin-previews')
    const tempPath = path.join(tempRoot, hash)

    // Stop and prune existing if any
    const existing = diffPreviews.get(hash)
    if (existing) {
      try {
        if (existing.proc.pid) {
          if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', String(existing.proc.pid), '/f', '/t'], { shell: true })
          } else {
            process.kill(-existing.proc.pid, 'SIGTERM')
          }
        }
      } catch {}
      diffPreviews.delete(hash)
    }

    try {
      execSync('git worktree prune', { cwd: projectPath })
    } catch {}

    if (fs.existsSync(tempPath)) {
      try {
        fs.rmSync(tempPath, { recursive: true, force: true })
      } catch {}
    }

    // Add worktree
    execSync(`git worktree add --detach "${tempPath}" ${hash}`, { cwd: projectPath })

    // Symlink node_modules
    const srcModules = path.join(projectPath, 'frontend', 'node_modules')
    const destModules = path.join(tempPath, 'frontend', 'node_modules')
    if (fs.existsSync(srcModules)) {
      fs.mkdirSync(path.dirname(destModules), { recursive: true })
      try {
        fs.symlinkSync(srcModules, destModules, 'dir')
      } catch (err) {
        console.error('Symlink failed', err)
      }
    }

    // Start Vite on port 5178
    const port = '5178'
    const isWin = process.platform === 'win32'
    const proc = spawn('npm', ['run', 'dev', '--', '--port', port], {
      cwd: path.join(tempPath, 'frontend'),
      shell: isWin,
      detached: true,
      env: { ...process.env, FORCE_COLOR: '1' }
    })

    diffPreviews.set(hash, { proc, tempPath })

    return { url: `http://localhost:${port}` }
  })

  ipcMain.handle('projects:git-stop-diff-preview', async (_, projectPath: string, hash: string) => {
    const existing = diffPreviews.get(hash)
    if (existing) {
      try {
        if (existing.proc.pid) {
          if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', String(existing.proc.pid), '/f', '/t'], { shell: true })
          } else {
            process.kill(-existing.proc.pid, 'SIGTERM')
          }
        }
      } catch {}
      diffPreviews.delete(hash)
    }

    // Prune worktree
    try {
      const targetPath = existing?.tempPath ?? path.join(app.getPath('temp'), 'ilumin-previews', hash)
      execSync(`git worktree remove --force "${targetPath}"`, { cwd: projectPath })
    } catch (err) {
      console.error('Worktree remove failed:', err)
    }

    try {
      execSync('git worktree prune', { cwd: projectPath })
    } catch {}

    return { success: true }
  })

  ipcMain.handle('projects:open', async (_, projectPath: string) => {
    // 1. Sync skills
    const skillsState = loadSkillsState()
    const templateSkillsDir = getTemplateSkillsDir()
    if (fs.existsSync(templateSkillsDir)) {
      const availableSkills = fs.readdirSync(templateSkillsDir)
      for (const skillId of availableSkills) {
        const isEnabled = skillId in skillsState ? skillsState[skillId] : true
        if (isEnabled) {
          installSkillInProject(skillId, projectPath)
        } else {
          removeSkillFromProject(skillId, projectPath)
        }
      }
    }

    // 2. Sync MCPs
    try {
      const mcpState = loadMcpState()
      syncMcpStateToProject(projectPath, mcpState)
    } catch (e) {
      console.error('Failed to sync MCP state on project open:', e)
    }

    return { success: true }
  })

  // Filesystem helpers
  const IGNORED_DIRS = new Set([
    'node_modules', '__pycache__', '.git', '.venv', 'venv',
    'dist', 'build', '.next', '.nuxt', '.output', 'out',
    '.cache', '.pytest_cache', '.mypy_cache', '.ruff_cache',
    'coverage', '.coverage', 'htmlcoverage',
  ])

  ipcMain.handle('fs:read-dir', async (_, dirPath: string) => {
    if (!fs.existsSync(dirPath)) throw new Error('Path does not exist')
    const items = fs.readdirSync(dirPath, { withFileTypes: true })
    return items
      .filter(item => !item.name.startsWith('.') && !IGNORED_DIRS.has(item.name))
      .map(item => ({ name: item.name, isDirectory: item.isDirectory(), path: path.join(dirPath, item.name) }))
  })

  ipcMain.handle('fs:read-file', async (_, filePath: string) => fs.readFileSync(filePath, 'utf-8'))

  ipcMain.handle('fs:write-file', async (_, { filePath, content }: { filePath: string; content: string }) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, content, 'utf-8')
    return { success: true }
  })

  // Search file names and content recursively
  ipcMain.handle('fs:search-files', async (_, { rootPath, query }: { rootPath: string; query: string }) => {
    const results: { path: string; name: string; matches: { line: number; text: string }[] }[] = []
    const q = query.toLowerCase()
    const MAX_RESULTS = 80
    const TEXT_EXTS = new Set(['ts','tsx','js','jsx','py','json','md','mdx','css','scss','html','yaml','yml','toml','sh','sql','txt','env','conf','ini','xml','svg','rs','go','rb','php'])

    const walk = (dir: string, depth: number) => {
      if (depth > 10 || results.length >= MAX_RESULTS) return
      let entries: fs.Dirent[]
      try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }

      for (const entry of entries) {
        if (results.length >= MAX_RESULTS) break
        if (entry.name.startsWith('.') || IGNORED_DIRS.has(entry.name)) continue
        const fullPath = path.join(dir, entry.name)
        if (entry.isDirectory()) { walk(fullPath, depth + 1); continue }

        const nameMatches = entry.name.toLowerCase().includes(q)
        const contentMatches: { line: number; text: string }[] = []
        const ext = entry.name.split('.').pop()?.toLowerCase() ?? ''

        if (TEXT_EXTS.has(ext)) {
          try {
            const stat = fs.statSync(fullPath)
            if (stat.size < 512 * 1024) {
              const lines = fs.readFileSync(fullPath, 'utf-8').split('\n')
              lines.forEach((lineText, idx) => {
                if (contentMatches.length < 5 && lineText.toLowerCase().includes(q))
                  contentMatches.push({ line: idx + 1, text: lineText.trim().slice(0, 120) })
              })
            }
          } catch { /* skip unreadable */ }
        }

        if (nameMatches || contentMatches.length > 0)
          results.push({ path: fullPath, name: entry.name, matches: contentMatches })
      }
    }

    walk(rootPath, 0)
    return results
  })

  // Read an image file and return it as a base64 data URL (avoids file:// CSP issues)
  ipcMain.handle('fs:read-image', async (_, filePath: string) => {
    if (!filePath || !fs.existsSync(filePath)) return null
    const ext = path.extname(filePath).toLowerCase().replace('.', '')
    const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext === 'jpg' ? 'jpeg' : ext}`
    const data = fs.readFileSync(filePath).toString('base64')
    return `data:${mime};base64,${data}`
  })
}


