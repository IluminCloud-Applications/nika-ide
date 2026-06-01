import { ipcMain, BrowserWindow } from 'electron'
import os from 'node:os'
import fs from 'node:fs'
import * as pty from 'node-pty'

interface TerminalEntry {
  ptyProcess: pty.IPty
  alive: boolean
}

const activeTerminals = new Map<string, TerminalEntry>()

function safeSend(win: BrowserWindow, channel: string, data: any) {
  try {
    if (win && !win.isDestroyed()) {
      win.webContents.send(channel, data)
    }
  } catch {}
}

function getValidCwd(cwd: string): string {
  try {
    if (fs.existsSync(cwd) && fs.statSync(cwd).isDirectory()) return cwd
  } catch {}
  return os.homedir()
}

function getDefaultShell(): string {
  if (process.platform === 'win32') {
    return process.env.COMSPEC || 'powershell.exe'
  }
  return process.env.SHELL || '/bin/bash'
}

export function registerTerminalHandlers() {
  ipcMain.handle('terminal:create', async (event, { cwd }: { cwd: string }) => {
    const terminalId = Math.random().toString(36).substring(7)
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win) throw new Error('No window found')

    const validCwd = getValidCwd(cwd)
    const shell = getDefaultShell()

    const ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 24,
      cwd: validCwd,
      env: { ...process.env } as Record<string, string>,
    })

    const entry: TerminalEntry = { ptyProcess, alive: true }

    ptyProcess.onData((data: string) => {
      safeSend(win, `terminal:data:${terminalId}`, data)
    })

    ptyProcess.onExit(() => {
      entry.alive = false
      safeSend(win, `terminal:exit:${terminalId}`, null)
      activeTerminals.delete(terminalId)
    })

    activeTerminals.set(terminalId, entry)
    return terminalId
  })

  ipcMain.handle('terminal:write', async (_, { terminalId, data }: { terminalId: string; data: string }) => {
    const entry = activeTerminals.get(terminalId)
    if (entry?.alive) {
      try { entry.ptyProcess.write(data) } catch {}
    }
  })

  ipcMain.handle('terminal:resize', async (_, { terminalId, cols, rows }: { terminalId: string; cols: number; rows: number }) => {
    const entry = activeTerminals.get(terminalId)
    if (entry?.alive && cols > 0 && rows > 0) {
      try { entry.ptyProcess.resize(cols, rows) } catch {}
    }
  })

  ipcMain.handle('terminal:kill', async (_, { terminalId }: { terminalId: string }) => {
    const entry = activeTerminals.get(terminalId)
    if (entry) {
      entry.alive = false
      try { entry.ptyProcess.kill() } catch {}
      activeTerminals.delete(terminalId)
    }
  })
}
