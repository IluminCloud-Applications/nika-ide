import { useEffect, useState } from 'react'
import { Database, AlertCircle, RefreshCw, Table2 } from 'lucide-react'
import SchemaOverview from './SchemaOverview'
import TableDataView from './TableDataView'
import TableSchemaView from './TableSchemaView'

interface DatabasePanelProps {
  projectPath: string
  onStartApp?: () => void
  isRunning?: boolean
}

export default function DatabasePanel({ projectPath, onStartApp, isRunning }: DatabasePanelProps) {
  const [schema, setSchema] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [activeSubTab, setActiveSubTab] = useState<'data' | 'structure'>('data')

  const fetchSchema = async (showSpinner = true) => {
    if (showSpinner) setLoading(true)
    try {
      const res = await window.api.database.getSchema(projectPath)
      setSchema(res)
    } catch (e) {
      console.error(e)
      setSchema({ online: false, message: 'Erro ao conectar ao banco de dados.' })
    } finally {
      if (showSpinner) setLoading(false)
    }
  }

  useEffect(() => { fetchSchema(true) }, [projectPath])

  useEffect(() => {
    if (schema && !schema.online) {
      const timer = setInterval(() => fetchSchema(false), 5000)
      return () => clearInterval(timer)
    }
    return undefined
  }, [schema, projectPath])

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-sm tx-muted">
        <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
        </div>
        <span className="text-xs">Carregando estrutura do banco de dados...</span>
      </div>
    )
  }

  if (!schema || !schema.online) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
        <div className="p-4 rounded-2xl border" style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line)' }}>
          <AlertCircle className="w-8 h-8 text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold tx-primary mb-1">Banco de Dados Offline</h3>
          <p className="text-xs tx-muted max-w-sm">
            {schema?.message || 'O container PostgreSQL não está em execução ou ainda está iniciando.'}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {onStartApp && !isRunning && (
            <button
              onClick={onStartApp}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all hover:shadow-lg hover:shadow-emerald-500/20"
            >
              <i className="ri-play-fill text-sm" />
              Iniciar Aplicativo
            </button>
          )}
          {onStartApp && isRunning && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold tx-muted" style={{ borderColor: 'var(--line)', backgroundColor: 'var(--surface-overlay)' }}>
              <RefreshCw className="w-3 h-3 animate-spin text-blue-400" />
              Inicializando...
            </div>
          )}
          <button
            onClick={() => fetchSchema(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all hover:shadow-lg hover:shadow-blue-500/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reconectar
          </button>
        </div>
      </div>
    )
  }

  const tables = schema.tables || []
  const activeTableData = tables.find((t: any) => t.name === selectedTable)

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* Sidebar */}
      <div
        className="w-56 flex flex-col min-h-0 shrink-0"
        style={{ borderRight: '1px solid var(--line)', backgroundColor: 'var(--surface-sidebar)' }}
      >
        {/* Sidebar Header */}
        <div
          className="px-3 py-2.5 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest tx-muted">Tabelas</span>
          </div>
          <button
            onClick={() => fetchSchema(true)}
            title="Recarregar schema"
            className="p-1 rounded-lg transition-colors tx-muted hover:text-blue-400 hover:bg-blue-500/10"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* Sidebar List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {/* Overview Button */}
          <button
            onClick={() => setSelectedTable(null)}
            className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all"
            style={
              selectedTable === null
                ? { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'rgb(96, 165, 250)' }
                : { color: 'var(--tx-secondary)' }
            }
          >
            <span className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 shrink-0" />
              Overview
            </span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0"
              style={{ backgroundColor: 'var(--surface-overlay)', color: 'var(--tx-muted)' }}
            >
              {tables.length}
            </span>
          </button>

          {tables.length > 0 && (
            <div className="h-px my-2" style={{ backgroundColor: 'var(--line)' }} />
          )}

          {tables.length === 0 ? (
            <div className="text-[11px] tx-muted text-center py-6">Nenhuma tabela encontrada.</div>
          ) : (
            tables.map((t: any) => (
              <button
                key={t.name}
                onClick={() => { setSelectedTable(t.name); setActiveSubTab('data') }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-all"
                style={
                  selectedTable === t.name
                    ? { backgroundColor: 'rgba(59, 130, 246, 0.08)', color: 'rgb(96, 165, 250)' }
                    : { color: 'var(--tx-secondary)' }
                }
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Table2 className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  <span className="truncate font-mono">{t.name}</span>
                </span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 ml-1"
                  style={{ backgroundColor: 'var(--surface-overlay)', color: 'var(--tx-muted)' }}
                >
                  {t.row_count}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {selectedTable === null ? (
          <SchemaOverview schema={schema} onSelectTable={(name) => setSelectedTable(name)} />
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Table Header + Sub-tabs */}
            <div
              className="px-4 py-2 flex items-center justify-between shrink-0"
              style={{ borderBottom: '1px solid var(--line)', backgroundColor: 'var(--surface-overlay)' }}
            >
              <h4 className="text-xs font-bold flex items-center gap-2 tx-primary">
                <Table2 className="w-3.5 h-3.5 text-blue-400" />
                <span className="font-mono">{selectedTable}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono tx-muted" style={{ backgroundColor: 'var(--surface-base)' }}>
                  {activeTableData?.row_count ?? 0} rows
                </span>
              </h4>
              <div
                className="flex rounded-lg p-0.5"
                style={{ backgroundColor: 'var(--surface-base)', border: '1px solid var(--line)' }}
              >
                <button
                  onClick={() => setActiveSubTab('data')}
                  className="px-3 py-1 rounded-md text-[11px] font-semibold transition-all"
                  style={
                    activeSubTab === 'data'
                      ? { backgroundColor: 'var(--surface-overlay)', color: 'var(--tx-primary)' }
                      : { color: 'var(--tx-muted)' }
                  }
                >
                  Dados
                </button>
                <button
                  onClick={() => setActiveSubTab('structure')}
                  className="px-3 py-1 rounded-md text-[11px] font-semibold transition-all"
                  style={
                    activeSubTab === 'structure'
                      ? { backgroundColor: 'var(--surface-overlay)', color: 'var(--tx-primary)' }
                      : { color: 'var(--tx-muted)' }
                  }
                >
                  Estrutura ({activeTableData?.columns?.length || 0})
                </button>
              </div>
            </div>

            {/* View */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {activeSubTab === 'data' ? (
                <TableDataView
                  projectPath={projectPath}
                  tableName={selectedTable}
                  tableData={activeTableData}
                  schema={schema}
                />
              ) : (
                <TableSchemaView tableData={activeTableData} schema={schema} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
