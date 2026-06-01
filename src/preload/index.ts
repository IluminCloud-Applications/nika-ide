import { contextBridge, ipcRenderer } from 'electron'

interface ProjectDetails {
  name: string
  description: string
  color: string
  path: string
  imagePath?: string
  isStudio?: boolean
}
contextBridge.exposeInMainWorld('api', {
  projects: {
    list: () => ipcRenderer.invoke('projects:list'),
    create: (details: ProjectDetails) => ipcRenderer.invoke('projects:create', details),
    selectDir: () => ipcRenderer.invoke('projects:select-dir'),
    selectImage: () => ipcRenderer.invoke('projects:select-image'),
    updateStatus: (id: string, status: string) => ipcRenderer.invoke('projects:update-status', id, status),
    update: (id: string, updates: any) => ipcRenderer.invoke('projects:update', id, updates),
    archive: (id: string) => ipcRenderer.invoke('projects:archive', id),
    listArchived: () => ipcRenderer.invoke('projects:list-archived'),
    restore: (id: string) => ipcRenderer.invoke('projects:restore', id),

    gitLog: (projectPath: string) => ipcRenderer.invoke('projects:git-log', projectPath),
    gitRollback: (projectPath: string, hash: string) => ipcRenderer.invoke('projects:git-rollback', projectPath, hash),
    gitCommit: (projectPath: string, message: string) => ipcRenderer.invoke('projects:git-commit', { projectPath, message }),
    gitStartDiffPreview: (projectPath: string, hash: string) => ipcRenderer.invoke('projects:git-start-diff-preview', projectPath, hash),
    gitStopDiffPreview: (projectPath: string, hash: string) => ipcRenderer.invoke('projects:git-stop-diff-preview', projectPath, hash),
    open: (projectPath: string) => ipcRenderer.invoke('projects:open', projectPath)
  },
  skills: {
    getState: () => ipcRenderer.invoke('skills:get-state'),
    setEnabled: (skillId: string, enabled: boolean, skillIds: string[]) =>
      ipcRenderer.invoke('skills:set-enabled', { skillId, enabled, skillIds }),
  },
  mcp: {
    getState: () => ipcRenderer.invoke('mcp:get-state'),
    setEnabled: (mcpId: string, enabled: boolean, apiKey?: string) =>
      ipcRenderer.invoke('mcp:set-enabled', { mcpId, enabled, apiKey }),
    getCustomMcps: () => ipcRenderer.invoke('mcp:get-custom-mcps'),
    saveCustomMcp: (details: { id: string; name?: string; configText: string; enabled?: boolean }) =>
      ipcRenderer.invoke('mcp:save-custom-mcp', details),
    deleteCustomMcp: (mcpId: string) =>
      ipcRenderer.invoke('mcp:delete-custom-mcp', { mcpId })
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (settings: any) => ipcRenderer.invoke('settings:set', settings),
    selectWorkspace: () => ipcRenderer.invoke('settings:select-workspace')
  },
  fs: {
    readDir: (dirPath: string) => ipcRenderer.invoke('fs:read-dir', dirPath),
    readFile: (filePath: string) => ipcRenderer.invoke('fs:read-file', filePath),
    writeFile: (filePath: string, content: string) => ipcRenderer.invoke('fs:write-file', { filePath, content }),
    readImage: (filePath: string) => ipcRenderer.invoke('fs:read-image', filePath),
    searchFiles: (rootPath: string, query: string) => ipcRenderer.invoke('fs:search-files', { rootPath, query }),
  },
  terminal: {
    create: (cwd: string) => ipcRenderer.invoke('terminal:create', { cwd }),
    write: (terminalId: string, data: string) => ipcRenderer.invoke('terminal:write', { terminalId, data }),
    resize: (terminalId: string, cols: number, rows: number) => ipcRenderer.invoke('terminal:resize', { terminalId, cols, rows }),
    kill: (terminalId: string) => ipcRenderer.invoke('terminal:kill', { terminalId }),
    onData: (terminalId: string, callback: (data: string) => void) => {
      const listener = (_: any, data: string) => callback(data)
      ipcRenderer.on(`terminal:data:${terminalId}`, listener)
      return () => {
        ipcRenderer.removeListener(`terminal:data:${terminalId}`, listener)
      }
    },
    onExit: (terminalId: string, callback: () => void) => {
      const listener = () => callback()
      ipcRenderer.on(`terminal:exit:${terminalId}`, listener)
      return () => {
        ipcRenderer.removeListener(`terminal:exit:${terminalId}`, listener)
      }
    }
  },
  runner: {
    start: (projectPath: string) => ipcRenderer.invoke('runner:start', { projectPath }),
    stop: (projectPath: string) => ipcRenderer.invoke('runner:stop', { projectPath }),
    stopAll: () => ipcRenderer.invoke('runner:stop-all'),
    status: (projectPath: string) => ipcRenderer.invoke('runner:status', { projectPath }),
    runUserScript: (projectPath: string) => ipcRenderer.invoke('runner:run-user-script', { projectPath }),
    resolvePortConflict: (port: number) => ipcRenderer.invoke('runner:resolve-port-conflict', { port }),
    onLog: (callback: (data: { label: string; data: string }) => void) => {
      const listener = (_: any, payload: any) => callback(payload)
      ipcRenderer.on('runner:log', listener)
      return () => ipcRenderer.removeListener('runner:log', listener)
    },
    onExit: (callback: (data: { label: string; code: number }) => void) => {
      const listener = (_: any, payload: any) => callback(payload)
      ipcRenderer.on('runner:exit', listener)
      return () => ipcRenderer.removeListener('runner:exit', listener)
    },
    onStartAppSignal: (callback: () => void) => {
      const listener = () => callback()
      ipcRenderer.on('browser-bridge:start-app', listener)
      return () => ipcRenderer.removeListener('browser-bridge:start-app', listener)
    },
    onStopAppSignal: (callback: () => void) => {
      const listener = () => callback()
      ipcRenderer.on('browser-bridge:stop-app', listener)
      return () => ipcRenderer.removeListener('browser-bridge:stop-app', listener)
    },
    onGitRefreshSignal: (callback: () => void) => {
      const listener = () => callback()
      ipcRenderer.on('browser-bridge:git-refresh', listener)
      return () => ipcRenderer.removeListener('browser-bridge:git-refresh', listener)
    }
  },
  webview: {
    onConsole: (callback: (log: { level: string; data: string }) => void) => {
      const listener = (_: any, payload: any) => callback(payload)
      ipcRenderer.on('webview-console', listener)
      return () => ipcRenderer.removeListener('webview-console', listener)
    },
    onNetwork: (callback: (log: any) => void) => {
      const listener = (_: any, payload: any) => callback(payload)
      ipcRenderer.on('webview-network', listener)
      return () => ipcRenderer.removeListener('webview-network', listener)
    },
  },
  system: {
    getVersion: () => ipcRenderer.invoke('system:get-version'),
    getPlatform: () => ipcRenderer.invoke('system:get-platform'),
    checkTools: () => ipcRenderer.invoke('system:check-tools'),
    checkTool: (id: string) => ipcRenderer.invoke('system:check-tool', id),
    openUrl: (url: string) => ipcRenderer.invoke('system:open-url', url),
    openPath: (path: string) => ipcRenderer.invoke('system:open-path', path),
    installWithAI: (missingToolIds: string[]) => ipcRenderer.invoke('system:install-with-ai', missingToolIds),
    getWebviewPreloadPath: () => ipcRenderer.invoke('system:get-webview-preload-path'),
    getInstallInfo: (toolId: string) => ipcRenderer.invoke('system:get-install-info', toolId),
    getAllInstallInfo: () => ipcRenderer.invoke('system:get-all-install-info'),
    autoInstallTool: (toolId: string) => ipcRenderer.invoke('system:auto-install-tool', toolId),
    onInstallProgress: (cb: (data: { toolId: string; data: string; done: boolean; success?: boolean }) => void) => {
      const listener = (_: any, payload: any) => cb(payload)
      ipcRenderer.on('system:install-progress', listener)
      return () => ipcRenderer.removeListener('system:install-progress', listener)
    },
  },
  agents: {
    list: () => ipcRenderer.invoke('agents:list'),
    save: (agent: any) => ipcRenderer.invoke('agents:save', agent),
    delete: (id: string) => ipcRenderer.invoke('agents:delete', id)
  },
  prompts: {
    list: () => ipcRenderer.invoke('prompts:list'),
    save: (prompt: any) => ipcRenderer.invoke('prompts:save', prompt),
    delete: (id: string) => ipcRenderer.invoke('prompts:delete', id)
  },
  tasks: {
    list:       (projectPath: string, column?: string) =>
                  ipcRenderer.invoke('tasks:list', { projectPath, column }),
    create:     (projectPath: string, title: string, description: string, column?: string) =>
                  ipcRenderer.invoke('tasks:create', { projectPath, title, description, column }),
    update:     (projectPath: string, id: number, title: string, description: string) =>
                  ipcRenderer.invoke('tasks:update', { projectPath, id, title, description }),
    move:       (projectPath: string, id: number, column: string) =>
                  ipcRenderer.invoke('tasks:move', { projectPath, id, column }),
    approve:    (projectPath: string, id: number) =>
                  ipcRenderer.invoke('tasks:approve', { projectPath, id }),
    reject:     (projectPath: string, id: number, reason: string) =>
                  ipcRenderer.invoke('tasks:reject', { projectPath, id, reason }),
    delete:     (projectPath: string, id: number) =>
                  ipcRenderer.invoke('tasks:delete', { projectPath, id }),
    getNext:    (projectPath: string) =>
                  ipcRenderer.invoke('tasks:get-next', { projectPath }),
    start:      (projectPath: string, id: number) =>
                  ipcRenderer.invoke('tasks:start', { projectPath, id }),
    moveToReview: (projectPath: string, id: number, aiNotes?: string) =>
                  ipcRenderer.invoke('tasks:move-to-review', { projectPath, id, aiNotes }),
  },
  database: {
    getSchema: (projectPath: string) => ipcRenderer.invoke('database:get-schema', { projectPath }),
    getTableData: (projectPath: string, tableName: string, limit?: number, offset?: number) =>
      ipcRenderer.invoke('database:get-table-data', { projectPath, tableName, limit, offset }),
    updateRow: (details: {
      projectPath: string
      tableName: string
      pkName: string
      pkValue: any
      pkType: string
      columnName: string
      columnType: string
      newValue: any
    }) => ipcRenderer.invoke('database:update-row', details),
    insertRow: (details: {
      projectPath: string
      tableName: string
      values: Record<string, { value: any; type: string }>
    }) => ipcRenderer.invoke('database:insert-row', details)
  },
  docker: {
    check: () => ipcRenderer.invoke('docker:check'),
    listContainers: (opts?: { projectPath?: string }) =>
      ipcRenderer.invoke('docker:list-containers', opts),
    listVolumes: (opts?: { projectPath?: string }) =>
      ipcRenderer.invoke('docker:list-volumes', opts),
    stopContainer: (containerId: string) =>
      ipcRenderer.invoke('docker:stop-container', { containerId }),
    removeContainer: (containerId: string) =>
      ipcRenderer.invoke('docker:remove-container', { containerId }),
    removeVolume: (volumeName: string) =>
      ipcRenderer.invoke('docker:remove-volume', { volumeName }),
    resetProject: (projectPath: string) =>
      ipcRenderer.invoke('docker:reset-project', { projectPath }),
    cleanupAll: (projectPath: string) =>
      ipcRenderer.invoke('docker:cleanup-all', { projectPath }),
    diskUsage: () => ipcRenderer.invoke('docker:disk-usage'),
    smartPrune: () => ipcRenderer.invoke('docker:smart-prune'),
  }
})
