import { useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'

interface JsonKeyValueEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function JsonKeyValueEditor({ value, onChange }: JsonKeyValueEditorProps) {
  const [entries, setEntries] = useState<{key: string, val: any}[]>([])
  const [parseError, setParseError] = useState(false)

  useEffect(() => {
    try {
      const parsed = value ? JSON.parse(value) : {}
      if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
        setEntries(Object.keys(parsed).map(k => ({ 
          key: k, 
          val: typeof parsed[k] === 'object' ? JSON.stringify(parsed[k]) : String(parsed[k]) 
        })))
        setParseError(false)
      } else {
        setParseError(true)
      }
    } catch(e) {
      setParseError(true)
    }
  }, [value])

  const updateParent = (newEntries: {key: string, val: any}[]) => {
    if (parseError) return // Apenas modo raw para array ou inválido
    
    const newObj: any = {}
    newEntries.forEach(e => {
      if (e.key.trim() === '') return
      let finalVal = e.val
      if (typeof finalVal === 'string') {
        if (finalVal === 'true') finalVal = true
        else if (finalVal === 'false') finalVal = false
        else if (finalVal === 'null') finalVal = null
        else if (!isNaN(Number(finalVal)) && finalVal.trim() !== '') {
          finalVal = Number(finalVal)
        } else if (finalVal.startsWith('{') || finalVal.startsWith('[')) {
          try { finalVal = JSON.parse(finalVal) } catch(err){}
        }
      }
      newObj[e.key] = finalVal
    })
    
    // Compara para não sobrescrever com o mesmo valor JSON.
    const newStr = Object.keys(newObj).length === 0 && newEntries.length === 0 ? '' : JSON.stringify(newObj, null, 2)
    onChange(newStr)
  }

  const handleAdd = () => {
    const newE = [...entries, { key: '', val: '' }]
    setEntries(newE)
  }

  const handleRemove = (index: number) => {
    const newE = entries.filter((_, i) => i !== index)
    setEntries(newE)
    updateParent(newE)
  }

  return (
    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto overflow-x-hidden p-1 -m-1">
      {parseError && (
        <div className="text-[10px] px-3 py-2 rounded-xl" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
          O valor atual não é um objeto simples válido (ex: array ou JSON inválido). Edite o JSON Bruto abaixo.
        </div>
      )}
      
      {!parseError && entries.length > 0 && (
        <div className="flex flex-col gap-2">
          {entries.map((entry, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input 
                value={entry.key} 
                onChange={e => {
                  const newE = [...entries]
                  newE[i].key = e.target.value
                  setEntries(newE)
                }} 
                onBlur={() => updateParent(entries)}
                placeholder="Chave" 
                className="w-1/3 px-3 py-2 rounded-xl text-xs font-mono outline-none transition-colors focus:ring-1 focus:ring-blue-500/50" 
                style={{ backgroundColor: 'var(--surface-base)', border: '1px solid var(--line)', color: 'var(--tx-primary)' }} 
              />
              <span className="font-bold" style={{ color: 'var(--tx-muted)' }}>:</span>
              <input 
                value={entry.val} 
                onChange={e => {
                  const newE = [...entries]
                  newE[i].val = e.target.value
                  setEntries(newE)
                }} 
                onBlur={() => updateParent(entries)}
                placeholder="Valor" 
                className="flex-1 px-3 py-2 rounded-xl text-xs font-mono outline-none transition-colors focus:ring-1 focus:ring-blue-500/50" 
                style={{ backgroundColor: 'var(--surface-base)', border: '1px solid var(--line)', color: 'var(--tx-primary)' }} 
              />
              <button onClick={() => handleRemove(i)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition-colors" title="Remover">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {!parseError && (
        <button onClick={handleAdd} className="mt-1 py-2 rounded-xl text-xs border-dashed border transition-colors flex items-center justify-center gap-1.5 hover:border-blue-500/50 hover:text-blue-400 hover:bg-blue-500/5" style={{ borderColor: 'var(--line)', color: 'var(--tx-secondary)' }}>
          <Plus className="w-3.5 h-3.5" /> Adicionar Propriedade
        </button>
      )}
      
      <div className="mt-2 flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--tx-muted)' }}>JSON Bruto:</span>
        <textarea 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          rows={4} 
          placeholder="Valor (deixe vazio para NULL)"
          className="w-full px-3 py-2 rounded-xl text-xs font-mono outline-none resize-y transition-colors focus:ring-1 focus:ring-blue-500/50" 
          style={{ backgroundColor: 'var(--surface-overlay)', border: '1px solid var(--line)', color: 'var(--tx-primary)', minHeight: '80px' }} 
        />
      </div>
    </div>
  )
}
