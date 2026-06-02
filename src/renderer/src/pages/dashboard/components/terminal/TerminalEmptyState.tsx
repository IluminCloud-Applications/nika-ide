import React from 'react'
import { Terminal } from 'lucide-react'

interface TerminalOption {
  label: string
  description: string
  icon: React.ReactNode
  action: () => void
  color: string
  borderColor: string
}

interface TerminalEmptyStateProps {
  onAddTerminal: (opts?: { name?: string; initialCommand?: string }) => void
  onAddNote: () => void
}

export default function TerminalEmptyState({ onAddTerminal }: TerminalEmptyStateProps) {
  const options: TerminalOption[] = [
    {
      label: 'Terminal',
      description: 'Shell padrão do projeto',
      icon: <Terminal className="w-4 h-4" />,
      action: () => onAddTerminal(),
      color: 'text-emerald-400',
      borderColor: 'hover:border-emerald-500/40 hover:bg-emerald-500/5',
    },
    {
      label: 'Claude Code',
      description: 'Agente de código da Anthropic',
      icon: <img src="/icons/claude-code.svg" className="w-4 h-4" alt="Claude" />,
      action: () => onAddTerminal({ name: 'Claude Code', initialCommand: 'claude --dangerously-skip-permissions\r' }),
      color: 'text-orange-400',
      borderColor: 'hover:border-orange-500/40 hover:bg-orange-500/5',
    },
    {
      label: 'Antigravity CLI',
      description: 'Seu assistente pessoal de IA',
      icon: <img src="/icons/antigravity.svg" className="w-4 h-4" alt="Antigravity" />,
      action: () => onAddTerminal({ name: 'Antigravity', initialCommand: 'agy --dangerously-skip-permissions\r' }),
      color: 'text-blue-400',
      borderColor: 'hover:border-blue-500/40 hover:bg-blue-500/5',
    },
    {
      label: 'Codex CLI',
      description: 'Agente de código da OpenAI',
      icon: <img src="/icons/codex.svg" className="w-4 h-4" alt="Codex" />,
      action: () => onAddTerminal({ name: 'Codex CLI', initialCommand: 'codex --yolo\r' }),
      color: 'text-violet-400',
      borderColor: 'hover:border-violet-500/40 hover:bg-violet-500/5',
    },
  ]

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-5 select-none">
      {/* Icon */}
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--surface-raised)', border: '1px solid var(--line)' }}>
          <Terminal className="w-5 h-5 tx-muted" />
        </div>
        <p className="text-[11px] tx-muted text-center leading-relaxed">
          Escolha como quer abrir o terminal
        </p>
      </div>

      {/* Options grid */}
      <div className="w-full flex flex-col gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={opt.action}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-150
              border cursor-pointer group
              ${opt.borderColor}
            `}
            style={{
              backgroundColor: 'var(--surface-raised)',
              borderColor: 'var(--line)',
            }}
          >
            <span className={`flex-shrink-0 ${opt.color}`}>
              {opt.icon}
            </span>
            <div className="flex flex-col min-w-0">
              <span className={`text-xs font-semibold transition-colors ${opt.color}`}>
                {opt.label}
              </span>
              <span className="text-[10px] tx-muted truncate">{opt.description}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
