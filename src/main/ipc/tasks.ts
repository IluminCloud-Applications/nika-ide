import { ipcMain } from 'electron'
import { execSync } from 'node:child_process'
import {
  listTasks, createTask, updateTask, moveTask,
  deleteTask, getTask, moveToExecuting, TaskColumn
} from './tasksDb'

function autoGitCommit(projectPath: string, title: string) {
  try {
    execSync('git add .', { cwd: projectPath, timeout: 10000 })
    const msg = `task: ${title.replace(/"/g, "'")}`
    execSync(`git commit -m "${msg}"`, { cwd: projectPath, timeout: 10000 })
  } catch (e) {
    // Non-fatal: ignore if no changes or git not initialized
    console.warn('[Tasks] git auto-commit skipped:', (e as Error).message?.split('\n')[0])
  }
}

export function registerTasksHandlers() {
  ipcMain.handle('tasks:list', (_evt, { projectPath, column }: {
    projectPath: string
    column?: TaskColumn
  }) => {
    return listTasks(projectPath, column)
  })

  ipcMain.handle('tasks:create', (_evt, { projectPath, title, description, column }: {
    projectPath: string
    title: string
    description: string
    column?: TaskColumn
  }) => {
    return createTask(projectPath, title, description, column ?? 'pending')
  })

  ipcMain.handle('tasks:update', (_evt, { projectPath, id, title, description }: {
    projectPath: string
    id: number
    title: string
    description: string
  }) => {
    updateTask(projectPath, id, title, description)
    return getTask(projectPath, id)
  })

  ipcMain.handle('tasks:move', (_evt, { projectPath, id, column }: {
    projectPath: string
    id: number
    column: TaskColumn
  }) => {
    moveTask(projectPath, id, column)
    return getTask(projectPath, id)
  })

  ipcMain.handle('tasks:approve', (_evt, { projectPath, id }: {
    projectPath: string
    id: number
  }) => {
    moveTask(projectPath, id, 'archived')
    return getTask(projectPath, id)
  })

  ipcMain.handle('tasks:reject', (_evt, { projectPath, id, reason }: {
    projectPath: string
    id: number
    reason: string
  }) => {
    moveTask(projectPath, id, 'pending', { rejection_reason: reason })
    return getTask(projectPath, id)
  })

  ipcMain.handle('tasks:delete', (_evt, { projectPath, id }: {
    projectPath: string
    id: number
  }) => {
    deleteTask(projectPath, id)
    return { success: true }
  })

  // Called by MCP: move to executing (AI starts working)
  ipcMain.handle('tasks:start', (_evt, { projectPath, id }: {
    projectPath: string
    id: number
  }) => {
    const task = getTask(projectPath, id)
    if (!task) throw new Error(`Task ${id} not found`)
    if (task.column !== 'pending') throw new Error(`Task ${id} is not pending (current: ${task.column})`)
    return moveToExecuting(projectPath, id)
  })

  // Called by MCP: move to review + auto git commit
  ipcMain.handle('tasks:move-to-review', (_evt, { projectPath, id, aiNotes }: {
    projectPath: string
    id: number
    aiNotes?: string
  }) => {
    const task = getTask(projectPath, id)
    if (!task) throw new Error(`Task ${id} not found`)
    if (task.column !== 'pending' && task.column !== 'executing') {
      throw new Error(`Task ${id} is not in pending/executing (current: ${task.column})`)
    }
    moveTask(projectPath, id, 'review', { ai_notes: aiNotes })
    autoGitCommit(projectPath, task.title)
    return getTask(projectPath, id)
  })

  // Called by MCP: get next pending task
  ipcMain.handle('tasks:get-next', (_evt, { projectPath }: { projectPath: string }) => {
    const tasks = listTasks(projectPath, 'pending')
    return tasks[0] ?? null
  })
}
