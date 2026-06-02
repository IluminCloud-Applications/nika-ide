import { type ReactNode } from 'react'
import { Globe, LayoutList, Database, Settings2, Lock } from 'lucide-react'

export type CenterView = 'preview' | 'code' | 'tasks' | 'database' | 'system' | 'env'

interface CenterTabsProps {
  active: CenterView
  onChange: (view: CenterView) => void
}

export default function CenterTabs({ active, onChange }: CenterTabsProps) {
  const tabs: { id: CenterView; label: string; icon: ReactNode }[] = [
    { id: 'preview',  label: 'Preview',  icon: <Globe className="w-3.5 h-3.5" /> },
    { id: 'tasks',    label: 'Tarefas',  icon: <LayoutList className="w-3.5 h-3.5" /> },
    { id: 'database', label: 'Database', icon: <Database className="w-3.5 h-3.5" /> },
    { id: 'system',   label: 'Sistema',  icon: <Settings2 className="w-3.5 h-3.5" /> },
    { id: 'env',      label: 'Variáveis .env', icon: <Lock className="w-3.5 h-3.5" /> },
  ]

  return (
    <div className="editor-center-tabs">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`editor-center-tab ${active === tab.id ? 'active' : ''}`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  )
}

