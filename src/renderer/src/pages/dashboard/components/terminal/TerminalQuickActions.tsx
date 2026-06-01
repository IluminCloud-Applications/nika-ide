import { Sparkles, TerminalSquare, Bot, Zap } from 'lucide-react'

interface TerminalQuickActionsProps {
  onSendCommand: (cmd: string) => void
}

const actions = [
  {
    label: 'Claude Code',
    command: 'claude --dangerously-skip-permissions\r',
    icon: Sparkles,
    accent: 'text-orange-400',
    border: 'hover:border-orange-500/40',
    bg: 'hover:bg-orange-500/5',
  },
  {
    label: 'Antigravity CLI',
    command: 'agy --dangerously-skip-permissions\r',
    icon: Bot,
    accent: 'text-blue-400',
    border: 'hover:border-blue-500/40',
    bg: 'hover:bg-blue-500/5',
  },
  {
    label: 'Codex CLI',
    command: 'codex --yolo\r',
    icon: Zap,
    accent: 'text-purple-400',
    border: 'hover:border-purple-500/40',
    bg: 'hover:bg-purple-500/5',
  },
  {
    label: 'Bash',
    command: 'bash\r',
    icon: TerminalSquare,
    accent: 'text-emerald-400',
    border: 'hover:border-emerald-500/40',
    bg: 'hover:bg-emerald-500/5',
  },
]

export default function TerminalQuickActions({ onSendCommand }: TerminalQuickActionsProps) {
  return (
    <div className="p-2 flex gap-1.5" style={{ borderBottom: '1px solid var(--line)', backgroundColor: 'var(--surface-overlay)' }}>
      {actions.map(a => (
        <button
          key={a.label}
          onClick={() => onSendCommand(a.command)}
          className={`flex-1 py-1.5 rounded-md border text-[11px] font-medium tx-muted hover:tx-primary flex items-center justify-center gap-1.5 transition-all duration-200 ${a.border} ${a.bg}`}
          style={{ backgroundColor: 'var(--surface-base)', borderColor: 'var(--line)' }}
        >
          <a.icon className={`w-3.5 h-3.5 ${a.accent}`} />
          {a.label}
        </button>
      ))}
    </div>
  )
}
