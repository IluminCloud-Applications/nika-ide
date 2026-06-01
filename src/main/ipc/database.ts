import { ipcMain } from 'electron'
import { spawn } from 'node:child_process'

function isDbContainerRunning(projectPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn('docker', ['compose', 'exec', '-T', 'db', 'pg_isready', '-U', 'postgres'], {
      cwd: projectPath
    })
    child.on('close', (code) => {
      resolve(code === 0)
    })
    child.on('error', () => {
      resolve(false)
    })
  })
}

function executeQuery(projectPath: string, query: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn('docker', ['compose', 'exec', '-T', 'db', 'psql', '-U', 'postgres', '-d', 'nika_db', '-t', '-A'], {
      cwd: projectPath
    })

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (data) => {
      stdout += data.toString()
    })

    child.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr.trim() || `Erro ao executar query (código ${code})`))
      } else {
        resolve(stdout.trim())
      }
    })

    child.stdin.write(query)
    child.stdin.end()
  })
}

export function registerDatabaseHandlers() {
  ipcMain.handle('database:get-schema', async (_evt, { projectPath }: { projectPath: string }) => {
    const isOnline = await isDbContainerRunning(projectPath)
    if (!isOnline) {
      return {
        online: false,
        message: 'O banco de dados não está rodando. Certifique-se de que o backend (Docker Compose) está ativo.'
      }
    }

    try {
      const tablesQuery = `
        SELECT coalesce(json_agg(r), '[]'::json) FROM (
          SELECT 
            t.table_name as name,
            (
              SELECT coalesce(json_agg(c), '[]'::json)
              FROM (
                SELECT 
                  column_name as name,
                  data_type as type,
                  is_nullable = 'YES' as nullable,
                  column_default as default_value,
                  character_maximum_length as max_length
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = t.table_name
                ORDER BY ordinal_position
              ) c
            ) as columns,
            (
              SELECT count(*)::int
              FROM pg_class c 
              JOIN pg_namespace n ON n.oid = c.relnamespace 
              WHERE n.nspname = 'public' AND c.relname = t.table_name
            )::int as row_count
          FROM information_schema.tables t
          WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
          ORDER BY t.table_name
        ) r;
      `

      const relationsQuery = `
        SELECT coalesce(json_agg(r), '[]'::json) FROM (
          SELECT
            tc.table_name as from_table,
            kcu.column_name as from_column,
            ccu.table_name as to_table,
            ccu.column_name as to_column
          FROM
            information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
          WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
        ) r;
      `

      const pkeysQuery = `
        SELECT coalesce(json_agg(r), '[]'::json) FROM (
          SELECT
            tc.table_name,
            kcu.column_name as primary_key
          FROM
            information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
          WHERE tc.constraint_type = 'PRIMARY KEY' AND tc.table_schema = 'public'
        ) r;
      `

      const [tablesRaw, relationsRaw, pkeysRaw] = await Promise.all([
        executeQuery(projectPath, tablesQuery),
        executeQuery(projectPath, relationsQuery),
        executeQuery(projectPath, pkeysQuery)
      ])

      return {
        online: true,
        tables: JSON.parse(tablesRaw || '[]'),
        relations: JSON.parse(relationsRaw || '[]'),
        primaryKeys: JSON.parse(pkeysRaw || '[]')
      }
    } catch (err: any) {
      console.error('[Database IPC] Erro ao obter schema:', err)
      return { online: true, error: err.message || 'Erro desconhecido ao carregar o schema' }
    }
  })

  ipcMain.handle('database:get-table-data', async (_evt, { projectPath, tableName, limit = 100, offset = 0 }: {
    projectPath: string
    tableName: string
    limit?: number
    offset?: number
  }) => {
    const isOnline = await isDbContainerRunning(projectPath)
    if (!isOnline) {
      throw new Error('O container do banco de dados não está em execução.')
    }

    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
      throw new Error('Nome de tabela inválido.')
    }

    try {
      const query = `
        SELECT coalesce(json_agg(r), '[]'::json) FROM (
          SELECT * FROM "${tableName}" LIMIT ${limit} OFFSET ${offset}
        ) r;
      `
      const rawResult = await executeQuery(projectPath, query)
      return JSON.parse(rawResult || '[]')
    } catch (err: any) {
      console.error(`[Database IPC] Erro ao obter dados da tabela ${tableName}:`, err)
      throw new Error(err.message || 'Erro ao carregar dados da tabela')
    }
  })

  ipcMain.handle('database:update-row', async (_evt, { projectPath, tableName, pkName, pkValue, pkType, columnName, columnType, newValue }: {
    projectPath: string
    tableName: string
    pkName: string
    pkValue: any
    pkType: string
    columnName: string
    columnType: string
    newValue: any
  }) => {
    const isOnline = await isDbContainerRunning(projectPath)
    if (!isOnline) {
      throw new Error('O container do banco de dados não está em execução.')
    }

    if (!/^[a-zA-Z0-9_]+$/.test(tableName) || !/^[a-zA-Z0-9_]+$/.test(pkName) || !/^[a-zA-Z0-9_]+$/.test(columnName)) {
      throw new Error('Identificadores inválidos.')
    }

    const formatValue = (val: any, type: string) => {
      if (val === null || val === undefined) return 'NULL'
      const t = type.toLowerCase()
      if (t.includes('int') || t.includes('numeric') || t.includes('double') || t.includes('real')) {
        const num = Number(val)
        if (isNaN(num)) throw new Error(`Valor inválido para o tipo numérico: ${val}`)
        return String(num)
      }
      if (t.includes('bool')) {
        return val ? 'true' : 'false'
      }
      const escaped = String(val).replace(/'/g, "''")
      return `'${escaped}'`
    }

    try {
      const query = `
        UPDATE "${tableName}"
        SET "${columnName}" = ${formatValue(newValue, columnType)}
        WHERE "${pkName}" = ${formatValue(pkValue, pkType)};
      `
      await executeQuery(projectPath, query)
      return { success: true }
    } catch (err: any) {
      console.error('[Database IPC] Erro ao atualizar row:', err)
      throw new Error(err.message || 'Erro ao atualizar dados no banco de dados.')
    }
  })

  ipcMain.handle('database:insert-row', async (_evt, { projectPath, tableName, values }: {
    projectPath: string
    tableName: string
    values: Record<string, { value: any; type: string }>
  }) => {
    const isOnline = await isDbContainerRunning(projectPath)
    if (!isOnline) throw new Error('O banco de dados não está em execução.')

    if (!/^[a-zA-Z0-9_]+$/.test(tableName)) throw new Error('Nome de tabela inválido.')

    const formatValue = (val: any, type: string): string => {
      if (val === null || val === undefined || String(val).trim() === '' || String(val).trim().toLowerCase() === 'null') return 'NULL'
      const t = type.toLowerCase()
      if (t.includes('int') || t.includes('numeric') || t.includes('double') || t.includes('real') || t.includes('float') || t.includes('decimal')) {
        const num = Number(val)
        if (isNaN(num)) throw new Error(`Valor inválido para tipo numérico na coluna: ${val}`)
        return String(num)
      }
      if (t.includes('bool')) return (val === true || val === 'true') ? 'true' : 'false'
      const escaped = String(val).replace(/'/g, "''")
      return `'${escaped}'`
    }

    const entries = Object.entries(values)
    if (entries.length === 0) throw new Error('Nenhum valor fornecido para inserção.')

    const cols = entries.map(([col]) => `"${col}"`).join(', ')
    const vals = entries.map(([, { value, type }]) => formatValue(value, type)).join(', ')
    const query = `INSERT INTO "${tableName}" (${cols}) VALUES (${vals});`

    try {
      await executeQuery(projectPath, query)
      return { success: true }
    } catch (err: any) {
      console.error('[Database IPC] Erro ao inserir row:', err)
      throw new Error(err.message || 'Erro ao inserir registro.')
    }
  })
}
