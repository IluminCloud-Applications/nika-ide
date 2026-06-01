import { Link, Key, Table2, Rows } from 'lucide-react'

interface SchemaOverviewProps {
  schema: any
  onSelectTable: (name: string) => void
}

export default function SchemaOverview({ schema, onSelectTable }: SchemaOverviewProps) {
  const tables = schema.tables || []
  const relations = schema.relations || []
  const primaryKeys = schema.primaryKeys || []

  const getTablePK = (tableName: string) =>
    primaryKeys.filter((p: any) => p.table_name === tableName).map((p: any) => p.primary_key)

  const getTableFKs = (tableName: string) =>
    relations.filter((r: any) => r.from_table === tableName)

  const getTableIncomingFKs = (tableName: string) =>
    relations.filter((r: any) => r.to_table === tableName)

  const totalRows = tables.reduce((acc: number, t: any) => acc + (t.row_count || 0), 0)

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {[
            { label: 'Tabelas', value: tables.length, icon: Table2, color: 'blue' },
            { label: 'Relações (FK)', value: relations.length, icon: Link, color: 'violet' },
            { label: 'Chaves Primárias', value: primaryKeys.length, icon: Key, color: 'amber' },
            { label: 'Total de Registros', value: totalRows.toLocaleString('pt-BR'), icon: Rows, color: 'emerald' },
          ].map(({ label, value, icon: Icon, color }) => {
            const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
              blue:    { bg: 'rgba(59,130,246,0.06)',  border: 'rgba(59,130,246,0.18)',  text: '#60a5fa', iconBg: 'rgba(59,130,246,0.12)' },
              violet:  { bg: 'rgba(139,92,246,0.06)',  border: 'rgba(139,92,246,0.18)',  text: '#a78bfa', iconBg: 'rgba(139,92,246,0.12)' },
              amber:   { bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.18)',  text: '#fbbf24', iconBg: 'rgba(245,158,11,0.12)' },
              emerald: { bg: 'rgba(16,185,129,0.06)',  border: 'rgba(16,185,129,0.18)',  text: '#34d399', iconBg: 'rgba(16,185,129,0.12)' },
            }
            const c = colorMap[color]
            return (
              <div
                key={label}
                className="rounded-2xl p-4 flex items-center gap-3 transition-all duration-200 hover:-translate-y-0.5"
                style={{ backgroundColor: c.bg, border: `1px solid ${c.border}` }}
              >
                <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: c.iconBg }}>
                  <Icon className="w-4 h-4" style={{ color: c.text }} />
                </div>
                <div className="min-w-0">
                  <div className="text-xl font-bold font-mono tracking-tight" style={{ color: 'var(--tx-primary)' }}>
                    {value}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide truncate" style={{ color: 'var(--tx-muted)' }}>
                    {label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tables Grid */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--tx-muted)' }}>
            Tabelas do Schema
          </p>
          {tables.length === 0 ? (
            <div
              className="p-12 border border-dashed rounded-2xl text-center text-sm"
              style={{ borderColor: 'var(--line)', color: 'var(--tx-muted)' }}
            >
              Nenhuma tabela encontrada no banco de dados.
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
              {tables.map((table: any) => {
                const pks = getTablePK(table.name)
                const fks = getTableFKs(table.name)
                const incomingFks = getTableIncomingFKs(table.name)

                return (
                  <button
                    key={table.name}
                    onClick={() => onSelectTable(table.name)}
                    className="group text-left p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/5"
                    style={{ backgroundColor: 'var(--surface-raised)', borderColor: 'var(--line)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.35)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--line)' }}
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl transition-all duration-200 group-hover:bg-blue-500 group-hover:text-white bg-blue-500/10 text-blue-400">
                          <Table2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold font-mono transition-colors group-hover:text-blue-400" style={{ color: 'var(--tx-primary)' }}>
                            {table.name}
                          </h4>
                          <p className="text-[10px] mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--tx-muted)' }}>
                            <span>{table.columns.length} colunas</span>
                            <span className="w-1 h-1 rounded-full bg-zinc-700 inline-block" />
                            <span>{(table.row_count || 0).toLocaleString('pt-BR')} registros</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {pks.length > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                            <Key className="w-2.5 h-2.5" />PK
                          </span>
                        )}
                        {(fks.length > 0 || incomingFks.length > 0) && (
                          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-violet-500/10 text-violet-400 border border-violet-500/20 flex items-center gap-1">
                            <Link className="w-2.5 h-2.5" />FK
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Column Preview */}
                    <div className="space-y-0.5 border-t pt-3" style={{ borderColor: 'var(--line-subtle)' }}>
                      {table.columns.slice(0, 5).map((col: any) => {
                        const isPK = pks.includes(col.name)
                        const isFK = fks.some((f: any) => f.from_column === col.name)
                        return (
                          <div key={col.name} className="flex items-center justify-between py-0.5 px-1 rounded">
                            <span className="flex items-center gap-2 text-xs min-w-0">
                              {isPK
                                ? <Key className="w-3 h-3 text-amber-500 shrink-0" />
                                : isFK
                                  ? <Link className="w-3 h-3 text-violet-400 shrink-0" />
                                  : <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 shrink-0 ml-0.5" />
                              }
                              <span className={`font-mono truncate text-[11px] ${isPK ? 'text-amber-400 font-semibold' : isFK ? 'text-violet-400 font-semibold' : ''}`} style={!isPK && !isFK ? { color: 'var(--tx-secondary)' } : {}}>
                                {col.name}
                              </span>
                            </span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ml-2" style={{ backgroundColor: 'var(--surface-overlay)', color: 'var(--tx-muted)', border: '1px solid var(--line)' }}>
                              {col.type}
                            </span>
                          </div>
                        )
                      })}
                      {table.columns.length > 5 && (
                        <p className="text-[10px] text-right pt-1" style={{ color: 'var(--tx-muted)' }}>
                          +{table.columns.length - 5} colunas
                        </p>
                      )}
                    </div>

                    {/* FKs */}
                    {fks.length > 0 && (
                      <div className="mt-3 pt-2.5 flex flex-wrap gap-1.5" style={{ borderTop: '1px solid var(--line-subtle)' }}>
                        {fks.slice(0, 3).map((fk: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono border" style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--line)', color: 'var(--tx-muted)' }}>
                            <span>{fk.from_column}</span>
                            <span>→</span>
                            <span className="text-blue-400 font-semibold">{fk.to_table}</span>
                          </div>
                        ))}
                        {fks.length > 3 && <span className="text-[9px] px-1" style={{ color: 'var(--tx-muted)' }}>+{fks.length - 3}</span>}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
