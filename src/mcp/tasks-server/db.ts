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
// JSON-based storage — shared format with the Electron main process
// (eliminates the better-sqlite3 native-module version conflict).
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

export function initDb(projectPath: string) {
  // Ensures the .nika directory exists — no-op with JSON storage
  getStorePath(projectPath)
}

export function getNextPending(projectPath: string): Task | undefined {
  const store = loadStore(projectPath)
  return store.tasks
    .filter(t => t.column === 'pending')
    .sort((a, b) => a.id - b.id)[0]
}

export function getTaskById(projectPath: string, id: number): Task | undefined {
  const store = loadStore(projectPath)
  return store.tasks.find(t => t.id === id)
}

export function moveToExecuting(projectPath: string, id: number): Task | undefined {
  const store = loadStore(projectPath)
  const task = store.tasks.find(t => t.id === id)
  if (!task) return undefined
  task.column = 'executing'
  task.updated_at = nowISO()
  saveStore(projectPath, store)
  return { ...task }
}

export function moveToReview(projectPath: string, id: number, aiNotes?: string): Task | undefined {
  const store = loadStore(projectPath)
  const task = store.tasks.find(t => t.id === id)
  if (!task) return undefined
  task.column = 'review'
  task.rejection_reason = null
  if (aiNotes !== undefined) task.ai_notes = aiNotes
  task.updated_at = nowISO()
  saveStore(projectPath, store)
  return { ...task }
}

export function addTask(
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
