import { useState } from 'react'
import { EnvEntry } from './utils'

interface EnvTableProps {
  entries: EnvEntry[]
  onChange: (entries: EnvEntry[]) => void
}

function isSensitive(key: string) {
  const l = key.toLowerCase()
  return l.includes('secret') || l.includes('key') || l.includes('token') || l.includes('password') || l.includes('auth')
}

export default function EnvTable({ entries, onChange }: EnvTableProps) {
  const [visible, setVisible] = useState<Record<string, boolean>>({})

  const update = (i: number, field: 'key' | 'value', val: string) => {
    const next = [...entries]
    next[i] = { ...next[i], [field]: val }
    onChange(next)
  }

  const add = () => onChange([...entries, { key: 'NOVA_VARIAVEL', value: '' }])

  const remove = (i: number) => onChange(entries.filter((_, idx) => idx !== i))

  const toggle = (key: string) => setVisible(p => ({ ...p, [key]: !p[key] }))

  return (
    <div className="space-y-3">
      {/* Tabela de variáveis */}
      <div
        className="overflow-x-auto rounded-lg"
        style={{ border: '1px solid var(--line)', backgroundColor: 'var(--surface-overlay)' }}
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider tx-muted w-1/3">Chave</th>
              <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider tx-muted">Valor</th>
              <th className="py-2 px-3 text-[10px] font-bold uppercase tracking-wider tx-muted w-10 text-center" />
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-10 text-center text-xs tx-muted italic">
                  Nenhuma variável de ambiente encontrada
                </td>
              </tr>
            ) : (
              entries.map((entry, i) => {
                const sensitive = isSensitive(entry.key)
                const isVisible = visible[entry.key] ?? !sensitive

                return (
                  <tr
                    key={i}
                    style={{
                      borderBottom: i < entries.length - 1 ? '1px solid var(--line)' : undefined,
                    }}
                    className="group transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--surface-base)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                  >
                    {/* Chave */}
                    <td className="px-3 py-1.5">
                      <input
                        type="text"
                        value={entry.key}
                        onChange={e =>
                          update(i, 'key', e.target.value.toUpperCase().replace(/\s+/g, '_'))
                        }
                        placeholder="CHAVE"
                        className="w-full bg-transparent border-0 font-mono text-[11px] tx-primary
                          focus:outline-none focus:ring-0 p-1 rounded"
                      />
                    </td>

                    {/* Valor */}
                    <td className="px-3 py-1.5">
                      <div className="flex items-center gap-1">
                        <input
                          type={isVisible ? 'text' : 'password'}
                          value={entry.value}
                          onChange={e => update(i, 'value', e.target.value)}
                          placeholder="valor"
                          className="flex-1 bg-transparent border-0 font-mono text-[11px] text-blue-400
                            focus:outline-none focus:ring-0 p-1 rounded"
                        />
                        {sensitive && (
                          <button
                            type="button"
                            onClick={() => toggle(entry.key)}
                            className="p-1 rounded transition tx-muted hover:text-white"
                            title={isVisible ? 'Ocultar' : 'Mostrar'}
                          >
                            <i className={`${isVisible ? 'ri-eye-off-line' : 'ri-eye-line'} text-xs`} />
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Remover */}
                    <td className="px-3 py-1.5 text-center">
                      <button
                        type="button"
                        onClick={() => remove(i)}
                        className="p-1 rounded transition text-rose-500 hover:text-rose-400
                          hover:bg-rose-500/10 opacity-0 group-hover:opacity-100"
                        title="Remover"
                      >
                        <i className="ri-delete-bin-line text-xs" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Adicionar */}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all"
        style={{
          backgroundColor: 'var(--surface-overlay)',
          border: '1px solid var(--line)',
          color: 'var(--tx-muted)',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--tx-primary)')}
        onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--tx-muted)')}
      >
        <i className="ri-add-line text-xs text-blue-400" />
        Adicionar variável
      </button>
    </div>
  )
}
