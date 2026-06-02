import { useState } from 'react'
import { Trash2, Plus, Eye, EyeOff } from 'lucide-react'
import { EnvEntry } from './utils'

interface EnvTableProps {
  entries: EnvEntry[]
  onChange: (entries: EnvEntry[]) => void
}

export default function EnvTable({ entries, onChange }: EnvTableProps) {
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({})

  const handleUpdate = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...entries]
    updated[index] = { ...updated[index], [field]: val }
    onChange(updated)
  }

  const handleAdd = () => {
    onChange([...entries, { key: 'NOVA_VARIAVEL', value: '' }])
  }

  const handleRemove = (index: number) => {
    const updated = entries.filter((_, i) => i !== index)
    onChange(updated)
  }

  const toggleVisibility = (key: string) => {
    setVisibleKeys(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const isSensitive = (key: string) => {
    const lower = key.toLowerCase()
    return lower.includes('secret') || lower.includes('key') || lower.includes('token') || lower.includes('password') || lower.includes('auth')
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-[var(--surface-overlay)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--line)] bg-[var(--surface-base)] text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <th className="py-3 px-4 w-1/3">Chave</th>
              <th className="py-3 px-4">Valor</th>
              <th className="py-3 px-4 w-16 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--line)]">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-xs text-[var(--text-muted)] italic">
                  Nenhuma variável de ambiente encontrada.
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => {
                const sensitive = isSensitive(entry.key)
                const isVisible = visibleKeys[entry.key] ?? !sensitive

                return (
                  <tr key={index} className="hover:bg-[var(--surface-base)]/30 transition-colors">
                    <td className="p-3">
                      <input
                        type="text"
                        value={entry.key}
                        onChange={e => handleUpdate(index, 'key', e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                        placeholder="CHAVE"
                        className="w-full bg-transparent border-0 font-mono text-xs text-white focus:outline-none focus:ring-0 focus:border-0 p-1 rounded hover:bg-[var(--surface-base)]"
                      />
                    </td>
                    <td className="p-3 flex items-center gap-2">
                      <input
                        type={isVisible ? 'text' : 'password'}
                        value={entry.value}
                        onChange={e => handleUpdate(index, 'value', e.target.value)}
                        placeholder="valor"
                        className="flex-1 bg-transparent border-0 font-mono text-xs text-blue-400 focus:outline-none focus:ring-0 focus:border-0 p-1 rounded hover:bg-[var(--surface-base)]"
                      />
                      {sensitive && (
                        <button
                          type="button"
                          onClick={() => toggleVisibility(entry.key)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-white rounded transition"
                        >
                          {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-start">
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--surface-overlay)] hover:bg-[var(--surface-base)] border border-[var(--line)] text-white transition"
        >
          <Plus className="w-3.5 h-3.5 text-blue-400" />
          Adicionar Variável
        </button>
      </div>
    </div>
  )
}
