import fs from 'node:fs'
import path from 'node:path'

export type TaskColumn = 'ideas' | 'pending' | 'executing' | 'review' | 'archived'

export interface Task {
  id: number
  project_path: string
  title: string
  description: string
  column: TaskColumn
  rejection_reason: string | null
  ai_notes: string | null
  created_at: string
  updated_at: string
}

interface TasksStore {
  nextId: number
  tasks: Task[]
}

// ---------------------------------------------------------------------------
// JSON-based storage (replaces better-sqlite3 to avoid native-module conflicts
// between the Electron runtime and the system Node.js used by MCP servers).
// ---------------------------------------------------------------------------

function getStorePath(projectPath: string): string {
  const nikaDir = path.join(projectPath, '.nika')
  if (!fs.existsSync(nikaDir)) {
    fs.mkdirSync(nikaDir, { recursive: true })
  }
  return path.join(nikaDir, 'tasks.json')
}

function loadStore(projectPath: string): TasksStore {
  const storePath = getStorePath(projectPath)
  if (!fs.existsSync(storePath)) {
    return { nextId: 1, tasks: [] }
  }
  try {
    return JSON.parse(fs.readFileSync(storePath, 'utf-8'))
  } catch {
    return { nextId: 1, tasks: [] }
  }
}

function saveStore(projectPath: string, store: TasksStore): void {
  const storePath = getStorePath(projectPath)
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), 'utf-8')
}

function nowISO(): string {
  return new Date().toISOString().replace('T', ' ').slice(0, 19)
}

// ---------------------------------------------------------------------------
// Public API (same signatures as before)
// ---------------------------------------------------------------------------

export function listTasks(projectPath: string, column?: TaskColumn): Task[] {
  const store = loadStore(projectPath)
  if (column) {
    return store.tasks.filter(t => t.column === column).sort((a, b) => a.id - b.id)
  }
  return [...store.tasks].sort((a, b) => {
    if (a.column !== b.column) return a.column.localeCompare(b.column)
    return a.id - b.id
  })
}

export function getTask(projectPath: string, id: number): Task | undefined {
  const store = loadStore(projectPath)
  return store.tasks.find(t => t.id === id)
}

export function createTask(
  projectPath: string,
  title: string,
  description: string,
  column: TaskColumn = 'pending'
): Task {
  const store = loadStore(projectPath)
  const now = nowISO()
  const task: Task = {
    id: store.nextId,
    project_path: projectPath,
    title,
    description,
    column,
    rejection_reason: null,
    ai_notes: null,
    created_at: now,
    updated_at: now
  }
  store.nextId++
  store.tasks.push(task)
  saveStore(projectPath, store)
  return task
}

export function updateTask(
  projectPath: string,
  id: number,
  title: string,
  description: string
): void {
  const store = loadStore(projectPath)
  const task = store.tasks.find(t => t.id === id)
  if (!task) return
  task.title = title
  task.description = description
  task.updated_at = nowISO()
  saveStore(projectPath, store)
}

export function moveTask(
  projectPath: string,
  id: number,
  column: TaskColumn,
  extra?: { rejection_reason?: string | null; ai_notes?: string | null }
): void {
  const store = loadStore(projectPath)
  const task = store.tasks.find(t => t.id === id)
  if (!task) return

  task.column = column
  task.updated_at = nowISO()

  if (column === 'review') {
    task.rejection_reason = null
  } else if (extra && 'rejection_reason' in extra) {
    task.rejection_reason = extra.rejection_reason ?? null
  }

  if (extra && 'ai_notes' in extra) {
    task.ai_notes = extra.ai_notes ?? null
  }

  saveStore(projectPath, store)
}

export function deleteTask(projectPath: string, id: number): void {
  const store = loadStore(projectPath)
  store.tasks = store.tasks.filter(t => t.id !== id)
  saveStore(projectPath, store)
}

export function getNextPendingTask(projectPath: string): Task | undefined {
  const store = loadStore(projectPath)
  return store.tasks
    .filter(t => t.column === 'pending')
    .sort((a, b) => a.id - b.id)[0]
}

export function moveToExecuting(
  projectPath: string,
  id: number
): Task | undefined {
  moveTask(projectPath, id, 'executing')
  return getTask(projectPath, id)
}
