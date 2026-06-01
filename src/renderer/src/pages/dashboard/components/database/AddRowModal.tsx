import { useState } from 'react'
import { X, Plus, RefreshCw, Key, Link, Info } from 'lucide-react'

interface AddRowModalProps {
  tableName: string
  columns: any[]
  primaryKeys: any[]
  relations: any[]
  projectPath: string
  onClose: () => void
  onSuccess: () => void
}

function isAutoColumn(col: any): boolean {
  const d = (col.default_value || '').toLowerCase()
  const t = col.type.toLowerCase()
  return d.includes('nextval') || d.includes('gen_random') || t === 'uuid' && d.includes('uuid_generate')
}

function resolveInputType(type: string): 'number' | 'bool' | 'text' | 'textarea' | 'datetime' {
  const t = type.toLowerCase()
  if (t.includes('int') || t.includes('serial') || t.includes('numeric') || t.includes('float') || t.includes('double') || t.includes('real') || t.includes('decimal')) return 'number'
  if (t.includes('bool')) return 'bool'
  if (t.includes('time') || t.includes('date')) return 'datetime'
  if (t.includes('text') || t.includes('json') || t.includes('xml')) return 'textarea'
  return 'text'
}

export default function AddRowModal({ tableName, columns, primaryKeys, relations, projectPath, onClose, onSuccess }: AddRowModalProps) {
  const editableColumns = columns.filter(col => !isAutoColumn(col))

  const initValues = () => {
    const v: Record<string, string> = {}
    editableColumns.forEach(col => { v[col.name] = '' })
    return v
  }

  const [values, setValues] = useState<Record<string, string>>(initValues)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isPK = (name: string) => primaryKeys.some(p => p.primary_key === name)
  const isFK = (name: string) => relations.some(r => r.from_column === name)
  const getFKRef = (name: string) => relations.find(r => r.from_column === name)

  const handleSubmit = async () => {
    setSaving(true)
    setError(null)
    try {
      const payload: Record<string, { value: any; type: string }> = {}
      for (const col of editableColumns) {
        const raw = values[col.name]
        // Skip blank optional nullable fields
        if (raw.trim() === '' && col.nullable) continue
        payload[col.name] = { value: raw.trim() === '' ? null : raw, type: col.type }
      }
      await window.api.database.insertRow({ projectPath, tableName, values: payload })
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro ao inserir registro.')
    } finally {
      setSaving(false)
    }
  }

  const autoSkipped = columns.filter(isAutoColumn)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Drawer */}
      <div
        className="h-full w-full max-w-md flex flex-col animate-slide-in-right"
        style={{ backgroundColor: 'var(--surface-raised)', borderLeft: '1px solid var(--line)' }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Plus className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold" style={{ color: 'var(--tx-primary)' }}>Novo Registro</h2>
              <p className="text-[10px] font-mono mt-0.5" style={{ color: 'var(--tx-muted)' }}>{tableName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--tx-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--surface-overlay)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auto-generated notice */}
        {autoSkipped.length > 0 && (
          <div
            className="mx-5 mt-4 px-3 py-2.5 rounded-xl flex items-start gap-2.5 shrink-0"
            style={{ backgroundColor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <Info className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-blue-300 leading-relaxed">
              <span className="font-semibold">Colunas automáticas omitidas:</span>{' '}
              <span className="font-mono">{autoSkipped.map(c => c.name).join(', ')}</span>
              {' '}— geradas pelo banco automaticamente.
            </p>
          </div>
        )}

        {/* Fields */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {editableColumns.map(col => {
            const inputType = resolveInputType(col.type)
            const pk = isPK(col.name)
            const fk = isFK(col.name)
            const fkRef = getFKRef(col.name)

            return (
              <div key={col.name} className="space-y-1.5">
                {/* Field Label */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--tx-secondary)' }}>
                    {pk && <Key className="w-3 h-3 text-amber-400 shrink-0" />}
                    {fk && !pk && <Link className="w-3 h-3 text-violet-400 shrink-0" />}
                    <span className="font-mono">{col.name}</span>
                    {!col.nullable && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  <div className="flex items-center gap-1">
                    <span
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded uppercase"
                      style={{ backgroundColor: 'var(--surface-overlay)', color: 'var(--tx-muted)', border: '1px solid var(--line)' }}
                    >
                      {col.type}
                    </span>
                    {col.nullable && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ color: 'var(--tx-muted)' }}>nullable</span>
                    )}
                  </div>
                </div>

                {/* FK reference hint */}
                {fkRef && (
                  <p className="text-[10px]" style={{ color: 'var(--tx-muted)' }}>
                    Referencia:{' '}
                    <span className="font-mono text-blue-400">{fkRef.to_table}.{fkRef.to_column}</span>
                  </p>
                )}

                {/* Input */}
                {inputType === 'bool' ? (
                  <select
                    value={values[col.name]}
                    onChange={e => setValues(v => ({ ...v, [col.name]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono outline-none transition-all"
                    style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)', color: 'var(--tx-primary)' }}
                  >
                    {col.nullable && <option value="">— NULL —</option>}
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                ) : inputType === 'textarea' ? (
                  <textarea
                    value={values[col.name]}
                    onChange={e => setValues(v => ({ ...v, [col.name]: e.target.value }))}
                    rows={3}
                    placeholder={col.nullable ? 'Deixe vazio para NULL' : 'Obrigatório'}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono outline-none transition-all resize-none"
                    style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)', color: 'var(--tx-primary)' }}
                  />
                ) : (
                  <input
                    type={inputType === 'number' ? 'number' : inputType === 'datetime' ? 'datetime-local' : 'text'}
                    value={values[col.name]}
                    onChange={e => setValues(v => ({ ...v, [col.name]: e.target.value }))}
                    placeholder={col.nullable ? 'Deixe vazio para NULL' : 'Obrigatório'}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono outline-none transition-all"
                    style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)', color: 'var(--tx-primary)' }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Error */}
        {error && (
          <div
            className="mx-5 mb-3 px-3 py-2.5 rounded-xl text-[11px] shrink-0"
            style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
          >
            {error}
          </div>
        )}

        {/* Footer */}
        <div
          className="px-5 py-4 flex items-center gap-2 shrink-0"
          style={{ borderTop: '1px solid var(--line)', backgroundColor: 'var(--surface-overlay)' }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--line)', color: 'var(--tx-secondary)' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/20"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            {saving ? 'Inserindo...' : 'Inserir Registro'}
          </button>
        </div>
      </div>
    </div>
  )
}
