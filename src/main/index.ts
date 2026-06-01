import { app, BrowserWindow, Menu } from 'electron'
import path from 'node:path'
import { registerProjectHandlers } from './ipc/project'
import { registerTerminalHandlers } from './ipc/terminal'
import { registerRunnerHandlers } from './ipc/runner'
import { registerSystemHandlers } from './ipc/system'
import { registerMcpHandlers } from './ipc/mcp'
import { registerAgentsHandlers } from './ipc/agents'
import { registerPromptsHandlers } from './ipc/prompts'
import { registerTasksHandlers } from './ipc/tasks'
import { registerDatabaseHandlers } from './ipc/database'
import { registerWebviewDevtools } from './ipc/webview-devtools'
import { registerDockerHandlers } from './ipc/docker'
import { startBrowserBridge } from './ipc/browser-bridge'
app.disableHardwareAcceleration()
app.setName('Nika IDE')

// Stable WM_CLASS / Wayland app_id so the Linux dock/taskbar can match the
// installed .desktop entry and show the Nika logo instead of a generic icon.
app.commandLine.appendSwitch('class', 'nika-ide')

let mainWindow: BrowserWindow | null = null

const iconPath = path.join(__dirname, '../../build/icon.png')

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    frame: true,
    title: 'Nika IDE',
    icon: iconPath,
    titleBarStyle: 'default',
    backgroundColor: '#09090b',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true,
    },
  })

  // Remove standard menus
  Menu.setApplicationMenu(null)

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  // Register IPC handlers ONCE before any window is created
  registerProjectHandlers()
  registerTerminalHandlers()
  registerRunnerHandlers()
  registerSystemHandlers()
  registerMcpHandlers()
  registerAgentsHandlers()
  registerPromptsHandlers()
  registerTasksHandlers()
  registerDatabaseHandlers()
  registerDockerHandlers()
  registerWebviewDevtools(() => mainWindow)
  startBrowserBridge()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

