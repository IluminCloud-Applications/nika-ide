import { useState } from 'react'
import { Key, Link, Search, ArrowRight } from 'lucide-react'

interface TableSchemaViewProps {
  tableData: any
  schema: any
}

const TYPE_STYLES: Record<string, { badge: string; dot: string }> = {
  number:  { badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',    dot: 'bg-blue-400' },
  text:    { badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20', dot: 'bg-violet-400' },
  bool:    { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-400' },
  date:    { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',  dot: 'bg-amber-400' },
  default: { badge: 'bg-zinc-800/50 text-zinc-400 border-zinc-700/40',    dot: 'bg-zinc-500' },
}

function resolveType(type: string) {
  const t = type.toLowerCase()
  if (t.includes('int') || t.includes('serial') || t.includes('numeric') || t.includes('float') || t.includes('double') || t.includes('real') || t.includes('decimal')) return 'number'
  if (t.includes('char') || t.includes('text') || t.includes('uuid') || t.includes('json') || t.includes('xml')) return 'text'
  if (t.includes('bool')) return 'bool'
  if (t.includes('time') || t.includes('date') || t.includes('interval')) return 'date'
  return 'default'
}

export default function TableSchemaView({ tableData, schema }: TableSchemaViewProps) {
  const [search, setSearch] = useState('')
  const columns = tableData?.columns || []
  const relations = schema?.relations || []
  const primaryKeys = schema?.primaryKeys || []

  const isPK = (colName: string) =>
    primaryKeys.some((p: any) => p.table_name === tableData.name && p.primary_key === colName)

  const getFK = (colName: string) =>
    relations.find((r: any) => r.from_table === tableData.name && r.from_column === colName)

  const filtered = columns.filter((col: any) =>
    col.name.toLowerCase().includes(search.toLowerCase()) ||
    col.type.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Search bar — fixed, não rola */}
      <div className="px-5 py-3 shrink-0" style={{ borderBottom: '1px solid var(--line)', backgroundColor: 'var(--surface-overlay)' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--tx-muted)' }} />
          <input
            type="text"
            placeholder={`Filtrar colunas... (${columns.length} total)`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs outline-none transition-all focus:ring-1"
            style={{
              backgroundColor: 'var(--surface-base)',
              border: '1px solid var(--line)',
              color: 'var(--tx-primary)',
            }}
          />
        </div>
      </div>

      {/* Table — scroll acontece aqui */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-xs text-left" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr
              className="sticky top-0 z-10 select-none"
              style={{ backgroundColor: 'var(--surface-overlay)', borderBottom: '1px solid var(--line)' }}
            >
              <th className="px-5 py-3 font-semibold text-[10px] uppercase tracking-widest" style={{ color: 'var(--tx-muted)', width: '35%' }}>Coluna</th>
              <th className="px-4 py-3 font-semibold text-[10px] uppercase tracking-widest" style={{ color: 'var(--tx-muted)', width: '20%' }}>Tipo</th>
              <th className="px-4 py-3 font-semibold text-[10px] uppercase tracking-widest text-center" style={{ color: 'var(--tx-muted)', width: '15%' }}>Nulidade</th>
              <th className="px-4 py-3 font-semibold text-[10px] uppercase tracking-widest" style={{ color: 'var(--tx-muted)', width: '15%' }}>Default</th>
              <th className="px-5 py-3 font-semibold text-[10px] uppercase tracking-widest" style={{ color: 'var(--tx-muted)', width: '15%' }}>Relação</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-xs" style={{ color: 'var(--tx-muted)' }}>
                  Nenhuma coluna encontrada para "{search}".
                </td>
              </tr>
            ) : (
              filtered.map((col: any, idx: number) => {
                const hasPK = isPK(col.name)
                const fkInfo = getFK(col.name)
                const typeKey = resolveType(col.type)
                const ts = TYPE_STYLES[typeKey]
                const isEven = idx % 2 === 0

                return (
                  <tr
                    key={col.name}
                    className="transition-colors"
                    style={{
                      borderBottom: '1px solid var(--line-subtle)',
                      backgroundColor: isEven ? 'transparent' : 'rgba(255,255,255,0.01)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(59,130,246,0.04)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isEven ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                  >
                    {/* Nome da Coluna */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {hasPK && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-bold shrink-0">
                            <Key className="w-2.5 h-2.5" />PK
                          </span>
                        )}
                        {fkInfo && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 text-[9px] font-bold shrink-0">
                            <Link className="w-2.5 h-2.5" />FK
                          </span>
                        )}
                        <span
                          className="font-mono font-medium"
                          style={{ color: hasPK ? '#fbbf24' : fkInfo ? '#a78bfa' : 'var(--tx-primary)' }}
                        >
                          {col.name}
                        </span>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono border uppercase ${ts.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${ts.dot}`} />
                        {col.type}{col.max_length ? `(${col.max_length})` : ''}
                      </span>
                    </td>

                    {/* Nulidade */}
                    <td className="px-4 py-3 text-center">
                      {col.nullable ? (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold" style={{ backgroundColor: 'var(--surface-overlay)', color: 'var(--tx-muted)', border: '1px solid var(--line)' }}>
                          NULL
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          NOT NULL
                        </span>
                      )}
                    </td>

                    {/* Default */}
                    <td className="px-4 py-3">
                      {col.default_value ? (
                        <code className="text-[10px] px-2 py-0.5 rounded font-mono" style={{ backgroundColor: 'var(--surface-overlay)', color: '#93c5fd', border: '1px solid var(--line)' }}>
                          {col.default_value}
                        </code>
                      ) : (
                        <span className="text-[11px] italic" style={{ color: 'var(--tx-faint)' }}>—</span>
                      )}
                    </td>

                    {/* Relação FK */}
                    <td className="px-5 py-3">
                      {fkInfo ? (
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded-lg border" style={{ backgroundColor: 'var(--surface-overlay)', borderColor: 'var(--line)', color: 'var(--tx-muted)' }}>
                          <ArrowRight className="w-3 h-3 text-blue-400 shrink-0" />
                          <span>{fkInfo.to_table}.<span className="text-blue-400 font-bold">{fkInfo.to_column}</span></span>
                        </div>
                      ) : (
                        <span className="text-[11px] italic" style={{ color: 'var(--tx-faint)' }}>—</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-5 py-2 shrink-0 flex items-center justify-between" style={{ borderTop: '1px solid var(--line)', backgroundColor: 'var(--surface-overlay)' }}>
        <span className="text-[10px]" style={{ color: 'var(--tx-muted)' }}>
          {filtered.length} de {columns.length} coluna{columns.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-3 text-[9px]" style={{ color: 'var(--tx-muted)' }}>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400/70" />PK = Chave Primária</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400/70" />FK = Chave Estrangeira</span>
        </div>
      </div>
    </div>
  )
}
