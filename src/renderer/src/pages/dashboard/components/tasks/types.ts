export type TaskColumn = 'ideas' | 'pending' | 'executing' | 'review' | 'archived'

export interface Task {
  id: number
  project_path: string
  title: string
  description: string
  column: TaskColumn
  rejection_reason: string | null
  ai_notes: string | null
  created_at: string
  updated_at: string
}

export interface ColumnMeta {
  id: TaskColumn
  label: string
  icon: string          // Remix Icon class
  color: string         // Tailwind text color
  border: string        // Tailwind border color
  bg: string            // Tailwind bg for header
  canCreate: boolean    // user can create tasks here
  aiLabel: string       // label shown in AI badge
  aiAccess: boolean     // AI can access this column
}

export const COLUMNS: ColumnMeta[] = [
  {
    id: 'ideas',
    label: 'Ideias',
    icon: 'ri-lightbulb-line',
    color: 'text-violet-400',
    border: 'border-violet-500/30',
    bg: 'from-violet-500/10 to-transparent',
    canCreate: true,
    aiLabel: 'Sem acesso IA',
    aiAccess: false,
  },
  {
    id: 'pending',
    label: 'Pendentes',
    icon: 'ri-time-line',
    color: 'text-amber-400',
    border: 'border-amber-500/30',
    bg: 'from-amber-500/10 to-transparent',
    canCreate: true,
    aiLabel: 'IA executa',
    aiAccess: true,
  },
  {
    id: 'executing',
    label: 'Executando',
    icon: 'ri-loader-4-line',
    color: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'from-orange-500/10 to-transparent',
    canCreate: false,
    aiLabel: 'IA trabalhando',
    aiAccess: true,
  },
  {
    id: 'review',
    label: 'Revisão',
    icon: 'ri-eye-line',
    color: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'from-blue-500/10 to-transparent',
    canCreate: false,
    aiLabel: 'Aguardando revisão',
    aiAccess: false,
  },
  {
    id: 'archived',
    label: 'Arquivadas',
    icon: 'ri-archive-line',
    color: 'text-zinc-500',
    border: 'border-zinc-700/30',
    bg: 'from-zinc-700/10 to-transparent',
    canCreate: false,
    aiLabel: 'Concluídas',
    aiAccess: false,
  },
]
