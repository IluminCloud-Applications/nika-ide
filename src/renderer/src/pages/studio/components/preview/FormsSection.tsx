import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

export default function FormsSection() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState('Opção 1')
  const [checked, setChecked] = useState(true)
  const [switchOn, setSwitchOn] = useState(true)
  const [hoveredTooltip, setHoveredTooltip] = useState(false)

  const options = ['Opção 1', 'Opção 2', 'Opção de Design', 'Modo Estúdio']

  return (
    <div className="studio-card p-5 space-y-4 flex flex-col justify-between">
      <h3 className="font-semibold text-xs tracking-tight uppercase studio-text-muted">Formulários e Seletores</h3>
      
      <div className="space-y-3 flex-1">
        {/* Input Text */}
        <div className="space-y-1">
          <label className="text-xs font-medium studio-text-muted">Input de Texto</label>
          <input type="text" placeholder="Escreva algo..." className="studio-input px-3 py-2 w-full text-xs" />
        </div>

        {/* Dropdown / Select */}
        <div className="space-y-1 relative">
          <label className="text-xs font-medium studio-text-muted">Caixa de Seleção (Dropdown)</label>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="studio-input px-3 py-2 w-full text-xs text-left flex justify-between items-center"
          >
            <span>{selectedOption}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {dropdownOpen && (
            <div className="absolute left-0 right-0 mt-1 studio-card bg-popover text-popover-foreground z-10 p-1 shadow-lg max-h-40 overflow-y-auto">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setSelectedOption(opt)
                    setDropdownOpen(false)
                  }}
                  className="w-full text-left px-2.5 py-1.5 text-xs rounded studio-select-item transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Checkbox and Switch */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={checked}
              onChange={() => setChecked(!checked)}
              className="studio-input w-4 h-4 accent-white rounded cursor-pointer"
            />
            <span className="text-xs studio-text-muted">Checkbox</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-xs studio-text-muted">Switch</span>
            <button
              type="button"
              onClick={() => setSwitchOn(!switchOn)}
              className={`w-8 h-4.5 rounded-full border border-transparent transition-colors relative flex items-center ${
                switchOn ? 'studio-btn-primary' : 'bg-[hsl(var(--input))] border-[hsl(var(--border))]'
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full transition-transform ${
                  switchOn ? 'translate-x-3.5 bg-[hsl(var(--background))]' : 'translate-x-0.5 bg-[hsl(var(--foreground))]'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Tooltip Demonstration */}
        <div className="flex items-center justify-between pt-2 border-t studio-divider relative">
          <span className="text-xs studio-text-muted flex items-center gap-1">
            Ajuda e Tooltip
            <div
              className="relative inline-block"
              onMouseEnter={() => setHoveredTooltip(true)}
              onMouseLeave={() => setHoveredTooltip(false)}
            >
              <HelpCircle className="w-3.5 h-3.5 cursor-pointer studio-text-muted hover:text-white transition" />
              {hoveredTooltip && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 p-2 rounded bg-popover text-popover-foreground border studio-divider text-[10px] shadow-xl z-20 leading-relaxed text-center">
                  Este é um balão de dica (Tooltip) customizado.
                </div>
              )}
            </div>
          </span>
          <span className="text-[10px] studio-text-muted">Passe o mouse no ícone</span>
        </div>
      </div>
    </div>
  )
}
