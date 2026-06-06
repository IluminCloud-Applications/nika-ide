export {}

declare global {
  interface Window {
    api: {
      projects: {
        list: () => Promise<any[]>
        create: (details: any) => Promise<any>
        selectDir: () => Promise<string | null>
        selectImage: () => Promise<string | null>
        updateStatus: (id: string, status: string) => Promise<any>
        update: (id: string, updates: any) => Promise<any>
        archive: (id: string) => Promise<{ success: boolean }>
        listArchived: () => Promise<any[]>
        restore: (id: string) => Promise<{ success: boolean; project: any }>

        gitLog: (projectPath: string) => Promise<any[]>
        gitRollback: (projectPath: string, hash: string) => Promise<any>
        gitCommit: (projectPath: string, message: string) => Promise<{ success: boolean; noChanges?: boolean }>
        gitStartDiffPreview: (projectPath: string, hash: string) => Promise<{ url: string }>
        gitStopDiffPreview: (projectPath: string, hash: string) => Promise<{ success: boolean }>
        open: (projectPath: string) => Promise<{ success: boolean }>
        getNextVersion: (projectPath: string) => Promise<{ current: string; next: string; pkgPath: string | null }>
        bumpVersion: (projectPath: string, version: string) => Promise<{ success: boolean; pkgPath?: string; error?: string }>
      }
      skills: {
        getState: () => Promise<Record<string, boolean>>
        setEnabled: (skillId: string, enabled: boolean, skillIds: string[]) => Promise<{ success: boolean }>
      }
      mcp: {
        getState: () => Promise<Record<string, { enabled: boolean; apiKey?: string }>>
        setEnabled: (mcpId: string, enabled: boolean, apiKey?: string) => Promise<{ success: boolean }>
        getCustomMcps: () => Promise<Record<string, any>>
        saveCustomMcp: (details: { id: string; name?: string; configText: string; enabled?: boolean }) => Promise<{ success: boolean; error?: string; mcp?: any }>
        deleteCustomMcp: (mcpId: string) => Promise<{ success: boolean; error?: string }>
      }
      settings: {
        get: () => Promise<{ workspacePath?: string }>
        set: (settings: any) => Promise<any>
        selectWorkspace: () => Promise<string | null>
      }
      fs: {
        readDir: (dirPath: string) => Promise<any[]>
        readFile: (filePath: string) => Promise<string>
        writeFile: (filePath: string, content: string) => Promise<any>
        readImage: (filePath: string) => Promise<string | null>
        searchFiles: (rootPath: string, query: string) => Promise<Array<{ path: string; name: string; matches: Array<{ line: number; text: string }> }>>
        onChanged: (callback: (payload: { event: string; path: string }) => void) => () => void
      }
      terminal: {
        create: (cwd: string) => Promise<string>
        write: (terminalId: string, data: string) => Promise<void>
        resize: (terminalId: string, cols: number, rows: number) => Promise<void>
        kill: (terminalId: string) => Promise<void>
        onData: (terminalId: string, cb: (data: string) => void) => () => void
        onExit: (terminalId: string, cb: () => void) => () => void
      }
      runner: {
        start: (projectPath: string) => Promise<any>
        stop: (projectPath: string) => Promise<any>
        status: (projectPath: string) => Promise<any>
        runUserScript: (projectPath: string) => Promise<any>
        resolvePortConflict: (port: number) => Promise<{ success: boolean; message: string }>
        onLog: (cb: (data: { label: string; data: string }) => void) => () => void
        onExit: (cb: (data: { label: string; code: number }) => void) => () => void
        onStartAppSignal: (cb: () => void) => () => void
        onStopAppSignal: (cb: () => void) => () => void
        onGitRefreshSignal: (cb: () => void) => () => void
      }
      system: {
        getVersion: () => Promise<string>
        getPlatform: () => Promise<string>
        checkTools: () => Promise<Array<{ id: string; name: string; version: string | null; installed: boolean }>>
        checkTool: (id: string) => Promise<{ id: string; name: string; version: string | null; installed: boolean }>
        openUrl: (url: string) => Promise<{ success: boolean }>
        openPath: (path: string) => Promise<{ success: boolean; error?: string }>
        installWithAI: (missingToolIds: string[], cliId?: string) => Promise<{ success: boolean; reason?: string }>
        getInstallPrompt: (missingToolIds: string[]) => Promise<string>
        getWebviewPreloadPath: () => Promise<string>
        webviewPreloadPath: string
        getInstallInfo: (toolId: string) => Promise<{
          canAutoInstall: boolean
          command?: string | null
          url: string
          platform: string
          platformLabel: string
          interactive: boolean
        }>
        getAllInstallInfo: () => Promise<Record<string, {
          canAutoInstall: boolean
          command?: string | null
          url: string
          platform: string
          platformLabel: string
          interactive: boolean
        }>>
        autoInstallTool: (toolId: string) => Promise<{
          success: boolean
          toolId: string
          platform: string
          output: string
          mode: 'inline' | 'terminal'
          error?: string
        }>
        onInstallProgress: (cb: (data: {
          toolId: string
          data: string
          done: boolean
          success?: boolean
        }) => void) => () => void
      }
      webview: {
        onConsole: (cb: (log: { level: string; data: string }) => void) => () => void
        onNetwork: (cb: (log: { url: string; method: string; status: number; statusText: string; payload: string | null; response: string; duration: number }) => void) => () => void
      }
      agents: {
        list: () => Promise<any[]>
        save: (agent: any) => Promise<{ success: boolean }>
        delete: (id: string) => Promise<{ success: boolean }>
      }
      prompts: {
        list: () => Promise<any[]>
        save: (prompt: any) => Promise<{ success: boolean }>
        delete: (id: string) => Promise<{ success: boolean }>
      }
      docs: {
        list: () => Promise<Array<{ slug: string; name: string; description: string; updatedAt: string }>>
        get: (slug: string) => Promise<{ slug: string; name: string; description: string; content: string } | null>
        save: (doc: any) => Promise<{ success: boolean; slug: string }>
        delete: (slug: string) => Promise<{ success: boolean }>
      }
      tasks: {
        list:         (projectPath: string, column?: string) => Promise<any[]>
        create:       (projectPath: string, title: string, description: string, column?: string) => Promise<any>
        update:       (projectPath: string, id: number, title: string, description: string) => Promise<any>
        move:         (projectPath: string, id: number, column: string) => Promise<any>
        approve:      (projectPath: string, id: number) => Promise<any>
        reject:       (projectPath: string, id: number, reason: string) => Promise<any>
        delete:       (projectPath: string, id: number) => Promise<{ success: boolean }>
        getNext:      (projectPath: string) => Promise<any | null>
        start:        (projectPath: string, id: number) => Promise<any>
        moveToReview: (projectPath: string, id: number, aiNotes?: string) => Promise<any>
      }
      database: {
        getSchema: (projectPath: string) => Promise<{
          online: boolean
          message?: string
          error?: string
          tables?: Array<{
            name: string
            columns: Array<{
              name: string
              type: string
              nullable: boolean
              default_value: any
              max_length: number | null
            }>
            row_count: number
          }>
          relations?: Array<{
            from_table: string
            from_column: string
            to_table: string
            to_column: string
          }>
          primaryKeys?: Array<{
            table_name: string
            primary_key: string
          }>
        }>
        getTableData: (projectPath: string, tableName: string, limit?: number, offset?: number) => Promise<any[]>
        updateRow: (details: {
          projectPath: string
          tableName: string
          pkName: string
          pkValue: any
          pkType: string
          columnName: string
          columnType: string
          newValue: any
        }) => Promise<{ success: boolean }>
        insertRow: (details: {
          projectPath: string
          tableName: string
          values: Record<string, { value: any; type: string }>
        }) => Promise<{ success: boolean }>
      }
      docker: {
        check: () => Promise<{ running: boolean }>
        listContainers: (opts?: { projectPath?: string }) => Promise<{
          success: boolean
          containers: Array<{
            id: string; name: string; image: string; status: string
            state: string; ports: string; created: string; projectPath?: string
          }>
          error?: string
        }>
        listVolumes: (opts?: { projectPath?: string }) => Promise<{
          success: boolean
          volumes: Array<{
            name: string; driver: string; mountpoint: string
            createdAt: string; size: string; labels: Record<string, string>
          }>
          error?: string
        }>
        stopContainer: (containerId: string) => Promise<{ success: boolean; error?: string }>
        removeContainer: (containerId: string) => Promise<{ success: boolean; error?: string }>
        removeVolume: (volumeName: string) => Promise<{ success: boolean; error?: string }>
        resetProject: (projectPath: string) => Promise<{ success: boolean; message?: string; error?: string }>
        cleanupAll: (projectPath: string) => Promise<{ success: boolean; message?: string; error?: string }>
        diskUsage: () => Promise<{
          success: boolean
          usage: Array<{ Type: string; TotalCount: string; Active: string; Size: string; Reclaimable: string }>
          error?: string
        }>
        smartPrune: () => Promise<{ success: boolean; message?: string; details?: string[]; error?: string }>
      }
    }
  }
}

