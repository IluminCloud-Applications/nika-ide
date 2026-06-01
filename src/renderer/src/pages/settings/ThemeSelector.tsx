import { Check } from 'lucide-react'

export type Theme = 'dark' | 'light' | 'obsidian' | 'notion' | 'nord' | 'typewriter' | 'nika' | 'nika-light'

interface ThemeConfig {
  id: Theme
  name: string
  desc: string
  colors: {
    base: string
    raised: string
    sidebar: string
    text: string
    border: string
  }
}

const THEME_LIST: ThemeConfig[] = [
  {
    id: 'dark',
    name: 'Dark',
    desc: 'Escuro (Padrão)',
    colors: { base: '#09090b', raised: '#0e0e11', sidebar: '#0c0c0e', text: '#fafafa', border: '#27272a' }
  },
  {
    id: 'light',
    name: 'Light',
    desc: 'Claro clássico',
    colors: { base: '#f4f4f6', raised: '#ffffff', sidebar: '#ffffff', text: '#09090b', border: '#e4e4e7' }
  },
  {
    id: 'obsidian',
    name: 'Obsidian',
    desc: 'Carvão suave',
    colors: { base: '#1a1a1a', raised: '#202020', sidebar: '#161616', text: '#e3e3e3', border: '#333333' }
  },
  {
    id: 'notion',
    name: 'Notion',
    desc: 'Warm white minimal',
    colors: { base: '#fbfbfa', raised: '#ffffff', sidebar: '#f7f7f5', text: '#37352f', border: '#e9e9e6' }
  },
  {
    id: 'nord',
    name: 'Nord',
    desc: 'Azul polar ártico',
    colors: { base: '#2e3440', raised: '#3b4252', sidebar: '#242933', text: '#d8dee9', border: '#3b4252' }
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    desc: 'Sépia vintage',
    colors: { base: '#f4eedd', raised: '#faf6eb', sidebar: '#e5dcbf', text: '#322f28', border: '#d4cbb3' }
  },
  {
    id: 'nika',
    name: 'Nika',
    desc: 'Sol da meia-noite',
    colors: { base: '#15110a', raised: '#1f1810', sidebar: '#100d07', text: '#fdf3df', border: '#3a2f1c' }
  },
  {
    id: 'nika-light',
    name: 'Nika Light',
    desc: 'Aurora dourada',
    colors: { base: '#fdf6e9', raised: '#fffdf7', sidebar: '#fbf3e3', text: '#3d2f17', border: '#ecdcc0' }
  }
]

interface ThemeSelectorProps {
  currentTheme: Theme
  onChangeTheme: (theme: Theme) => void
}

export default function ThemeSelector({ currentTheme, onChangeTheme }: ThemeSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
      {THEME_LIST.map((theme) => {
        const isActive = currentTheme === theme.id
        const tColors = theme.colors

        return (
          <button
            key={theme.id}
            onClick={() => onChangeTheme(theme.id)}
            className={`
              relative flex flex-col text-left rounded-xl p-2.5 transition-all duration-200 border group
              ${isActive 
                ? 'border-blue-500 ring-2 ring-blue-500/25 bg-[var(--surface-overlay)] shadow-md' 
                : 'border-[var(--line)] hover:border-blue-500/50 hover:bg-[var(--surface-overlay)]/40 bg-transparent'
              }
            `}
          >
            {/* Visual simulation of the UI */}
            <div 
              className="w-full h-16 rounded-lg border overflow-hidden flex relative select-none shadow-inner" 
              style={{ backgroundColor: tColors.base, borderColor: tColors.border }}
            >
              {/* Sidebar */}
              <div 
                className="w-[18px] h-full border-r flex flex-col justify-between p-0.5 shrink-0" 
                style={{ backgroundColor: tColors.sidebar, borderColor: tColors.border }}
              >
                <div className="space-y-0.5">
                  <div className="w-2.5 h-1 rounded-sm bg-blue-500" />
                  <div className="w-2.5 h-0.5 rounded-sm opacity-40" style={{ backgroundColor: tColors.text }} />
                  <div className="w-2 h-0.5 rounded-sm opacity-40" style={{ backgroundColor: tColors.text }} />
                </div>
                <div className="w-2.5 h-1 rounded-sm opacity-30" style={{ backgroundColor: tColors.text }} />
              </div>
              
              {/* Body */}
              <div className="flex-1 flex flex-col p-1 gap-1">
                {/* Header */}
                <div className="w-full h-1 rounded-sm opacity-30" style={{ backgroundColor: tColors.text }} />
                {/* Simulated widgets */}
                <div className="flex-1 flex gap-1">
                  <div 
                    className="w-1/2 h-full rounded border flex items-center justify-center" 
                    style={{ backgroundColor: tColors.raised, borderColor: tColors.border }}
                  >
                    <div className="w-3 h-0.5 opacity-20" style={{ backgroundColor: tColors.text }} />
                  </div>
                  <div 
                    className="w-1/2 h-full rounded border flex flex-col gap-0.5 p-0.5 justify-center" 
                    style={{ backgroundColor: tColors.raised, borderColor: tColors.border }}
                  >
                    <div className="w-3 h-0.5 opacity-20" style={{ backgroundColor: tColors.text }} />
                    <div className="w-2 h-0.5 opacity-20" style={{ backgroundColor: tColors.text }} />
                  </div>
                </div>
              </div>

              {/* Selected Badge */}
              {isActive && (
                <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5 shadow-md">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </div>

            {/* Labels */}
            <div className="mt-2.5 px-0.5 min-w-0">
              <span className="text-xs font-semibold tx-primary block truncate">{theme.name}</span>
              <span className="text-[10px] tx-muted block truncate mt-0.5">{theme.desc}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
