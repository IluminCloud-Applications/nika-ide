import { useEffect, useState } from 'react'
import { RefreshCw, ChevronLeft, ChevronRight, Ban, Table2, Edit3, X, Plus } from 'lucide-react'
import AddRowModal from './AddRowModal'

interface TableDataViewProps {
  projectPath: string
  tableName: string
  tableData: any
  schema: any
}

export default function TableDataView({ projectPath, tableName, tableData, schema }: TableDataViewProps) {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [limit] = useState(24)
  const [offset, setOffset] = useState(0)
  const [showAddRow, setShowAddRow] = useState(false)
  const [editingCell, setEditingCell] = useState<any>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)

  const primaryKeys = schema?.primaryKeys || []
  const pkObj = primaryKeys.find((p: any) => p.table_name === tableName)
  const pkName = pkObj?.primary_key || null
  const pkCol = tableData?.columns?.find((c: any) => c.name === pkName)
  const pkType = pkCol?.type || 'integer'
  const columns = tableData?.columns || []

  const fetchRows = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await window.api.database.getTableData(projectPath, tableName, limit, offset)
      setRows(data)
    } catch (e: any) {
      setError(e.message || 'Falha ao buscar registros.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { setOffset(0); fetchRows() }, [tableName])
  useEffect(() => { fetchRows() }, [offset])

  const handleCellDoubleClick = (row: any, columnName: string, columnType: string) => {
    if (!pkName) return
    setEditingCell({ row, columnName, columnType })
    setEditValue(row[columnName] === null ? '' : String(row[columnName]))
    setUpdateError(null)
  }

  const handleSaveUpdate = async () => {
    if (!editingCell) return
    setSaving(true)
    setUpdateError(null)
    let newValue: any = editValue
    if (editingCell.columnType.toLowerCase().includes('bool')) {
      newValue = editValue === '' ? null : editValue === 'true'
    } else if (editValue === '') {
      newValue = null
    }
    try {
      await window.api.database.updateRow({ projectPath, tableName, pkName, pkValue: editingCell.row[pkName], pkType, columnName: editingCell.columnName, columnType: editingCell.columnType, newValue })
      setEditingCell(null)
      fetchRows()
    } catch (err: any) {
      setUpdateError(err.message || 'Erro ao atualizar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--tx-muted)' }}>
      <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
      Buscando registros de <span className="font-mono">{tableName}</span>...
    </div>
  )

  if (error) return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
      <Ban className="w-7 h-7 text-red-400" />
      <p className="text-xs" style={{ color: 'var(--tx-muted)' }}>{error}</p>
      <button onClick={fetchRows} className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all">
        Tentar novamente
      </button>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Toolbar */}
      <div className="px-4 py-2 flex items-center justify-between shrink-0" style={{ borderBottom: '1px solid var(--line)', backgroundColor: 'var(--surface-overlay)' }}>
        <span className="text-[10px]" style={{ color: 'var(--tx-muted)' }}>
          {rows.length} registro{rows.length !== 1 ? 's' : ''}
          {pkName ? ' · Duplo clique para editar' : ' · Sem PK (edição desativada)'}
        </span>
        <button
          onClick={() => setShowAddRow(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all hover:shadow-md hover:shadow-blue-500/20"
        >
          <Plus className="w-3.5 h-3.5" />
          Adicionar Registro
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {rows.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Table2 className="w-8 h-8 opacity-20" style={{ color: 'var(--tx-muted)' }} />
            <div className="text-center">
              <p className="text-xs font-semibold" style={{ color: 'var(--tx-primary)' }}>Tabela vazia</p>
              <p className="text-[11px] mt-1" style={{ color: 'var(--tx-muted)' }}>Nenhum registro encontrado.</p>
            </div>
            <button onClick={() => setShowAddRow(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all">
              <Plus className="w-3.5 h-3.5" /> Adicionar primeiro registro
            </button>
          </div>
        ) : (
          <table className="w-full text-[11px] text-left min-w-max" style={{ borderCollapse: 'collapse' }}>
            <thead className="sticky top-0 z-10">
              <tr style={{ borderBottom: '1px solid var(--line)', backgroundColor: 'var(--surface-overlay)' }}>
                <th className="px-3 py-2 w-10 text-center font-bold font-mono" style={{ borderRight: '1px solid var(--line-subtle)', color: 'var(--tx-muted)' }}>#</th>
                {columns.map((col: any) => (
                  <th key={col.name} className="px-3 py-2 font-bold font-mono" style={{ borderRight: '1px solid var(--line-subtle)', color: 'var(--tx-secondary)' }}>
                    <div className="flex flex-col gap-0.5">
                      <span style={{ color: 'var(--tx-primary)' }}>{col.name}</span>
                      <span className="text-[9px] font-normal uppercase" style={{ color: 'var(--tx-muted)' }}>{col.type}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="transition-colors" style={{ borderBottom: '1px solid var(--line-subtle)' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.03)' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <td className="px-3 py-1.5 text-center font-mono" style={{ borderRight: '1px solid var(--line-subtle)', color: 'var(--tx-muted)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                    {offset + idx + 1}
                  </td>
                  {columns.map((col: any) => {
                    const val = row[col.name]
                    const isNull = val === null
                    const display = isNull ? 'NULL' : typeof val === 'object' ? JSON.stringify(val) : String(val)
                    return (
                      <td key={col.name} onDoubleClick={() => handleCellDoubleClick(row, col.name, col.type)}
                        className="px-3 py-1.5 max-w-xs truncate font-mono cursor-pointer transition-colors"
                        style={{ borderRight: '1px solid var(--line-subtle)' }}
                        title={pkName ? 'Duplo clique para editar' : undefined}
                        onMouseEnter={e => { if (pkName) (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(59,130,246,0.06)' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
                      >
                        <span style={{ color: isNull ? 'var(--tx-faint)' : 'var(--tx-secondary)', fontStyle: isNull ? 'italic' : 'normal', fontSize: isNull ? '10px' : undefined }}>
                          {display}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="px-4 py-2 flex items-center justify-between shrink-0" style={{ borderTop: '1px solid var(--line)', backgroundColor: 'var(--surface-overlay)' }}>
        <span className="text-[10px]" style={{ color: 'var(--tx-muted)' }}>Página {Math.floor(offset / limit) + 1}</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ border: '1px solid var(--line)', backgroundColor: 'var(--surface-raised)', color: 'var(--tx-muted)' }}>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setOffset(offset + limit)} disabled={rows.length < limit}
            className="p-1.5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ border: '1px solid var(--line)', backgroundColor: 'var(--surface-raised)', color: 'var(--tx-muted)' }}>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingCell && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && setEditingCell(null)}>
          <div className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 animate-slide-up" style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--line)' }}>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--tx-primary)' }}>
                <Edit3 className="w-4 h-4 text-blue-400" /> Editar Célula
              </h2>
              <button onClick={() => setEditingCell(null)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--tx-muted)' }}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-3 py-2 rounded-xl text-xs font-mono" style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)', color: 'var(--tx-secondary)' }}>
              <span style={{ color: 'var(--tx-muted)' }}>{tableName}.</span><span className="text-blue-400 font-bold">{editingCell.columnName}</span>
              <span className="ml-2 text-[9px] uppercase px-1 rounded" style={{ backgroundColor: 'var(--surface-base)', color: 'var(--tx-muted)' }}>{editingCell.columnType}</span>
            </div>
            {editingCell.columnType.toLowerCase().includes('bool') ? (
              <select value={editValue} onChange={e => setEditValue(e.target.value)} className="w-full px-3 py-2 rounded-xl text-xs font-mono outline-none" style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)', color: 'var(--tx-primary)' }}>
                <option value="true">true</option>
                <option value="false">false</option>
                <option value="">NULL</option>
              </select>
            ) : (
              <textarea value={editValue} onChange={e => setEditValue(e.target.value)} rows={3} placeholder="Valor (deixe vazio para NULL)" className="w-full px-3 py-2 rounded-xl text-xs font-mono outline-none resize-none" style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)', color: 'var(--tx-primary)' }} />
            )}
            {updateError && <p className="text-[11px] px-3 py-2 rounded-xl" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>{updateError}</p>}
            <div className="flex gap-2">
              <button onClick={() => setEditingCell(null)} className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all" style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)', color: 'var(--tx-secondary)' }}>Cancelar</button>
              <button onClick={handleSaveUpdate} disabled={saving} className="flex-1 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center justify-center gap-1.5 disabled:opacity-60">
                {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Row Modal */}
      {showAddRow && (
        <AddRowModal
          tableName={tableName}
          columns={columns}
          primaryKeys={schema?.primaryKeys || []}
          relations={schema?.relations || []}
          projectPath={projectPath}
          onClose={() => setShowAddRow(false)}
          onSuccess={fetchRows}
        />
      )}
    </div>
  )
}
