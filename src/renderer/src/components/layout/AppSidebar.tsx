import React from 'react'
import { FolderKanban, ShieldCheck, Settings, Bot, Palette, Container } from 'lucide-react'
import { Theme } from '../../pages/settings/ThemeSelector'
import faviconUrl from '../../assets/favicon.webp'

function RiChatAi2Line({ className, ...props }: React.HTMLAttributes<HTMLElement> & { strokeWidth?: number }) {
  return (
    <i
      className={`ri-chat-ai-2-line flex items-center justify-center ${className || ''}`}
      {...props}
      style={{ fontSize: '18px', width: '18px', height: '18px', lineHeight: 1, color: 'currentColor' }}
    />
  )
}

function RiBrainAi3Line({ className, ...props }: React.HTMLAttributes<HTMLElement> & { strokeWidth?: number }) {
  return (
    <i
      className={`ri-brain-ai-3-line flex items-center justify-center ${className || ''}`}
      {...props}
      style={{ fontSize: '18px', width: '18px', height: '18px', lineHeight: 1, color: 'currentColor' }}
    />
  )
}

function RiBrushAiLine({ className, ...props }: React.HTMLAttributes<HTMLElement> & { strokeWidth?: number }) {
  return (
    <i
      className={`ri-brush-ai-line flex items-center justify-center ${className || ''}`}
      {...props}
      style={{ fontSize: '18px', width: '18px', height: '18px', lineHeight: 1, color: 'currentColor' }}
    />
  )
}

function McpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="currentColor"
      fillRule="evenodd"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>ModelContextProtocol</title>
      <path d="M15.688 2.343a2.588 2.588 0 00-3.61 0l-9.626 9.44a.863.863 0 01-1.203 0 .823.823 0 010-1.18l9.626-9.44a4.313 4.313 0 016.016 0 4.116 4.116 0 011.204 3.54 4.3 4.3 0 013.609 1.18l.05.05a4.115 4.115 0 010 5.9l-8.706 8.537a.274.274 0 000 .393l1.788 1.754a.823.823 0 010 1.18.863.863 0 01-1.203 0l-1.788-1.753a1.92 1.92 0 010-2.754l8.706-8.538a2.47 2.47 0 000-3.54l-.05-.049a2.588 2.588 0 00-3.607-.003l-7.172 7.034-.002.002-.098.097a.863.863 0 01-1.204 0 .823.823 0 010-1.18l7.273-7.133a2.47 2.47 0 00-.003-3.537z"></path>
      <path d="M14.485 4.703a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a4.115 4.115 0 000 5.9 4.314 4.314 0 006.016 0l7.12-6.982a.823.823 0 000-1.18.863.863 0 00-1.204 0l-7.119 6.982a2.588 2.588 0 01-3.61 0 2.47 2.47 0 010-3.54l7.12-6.982z"></path>
    </svg>
  )
}

export type NavRoute = 'projects' | 'studio' | 'skills' | 'mcp' | 'status' | 'agents' | 'prompts' | 'settings' | 'docker'

interface AppSidebarProps {
  activeRoute: NavRoute
  onNavigate: (route: NavRoute) => void
  theme?: Theme
  onToggleTheme?: () => void
}

interface NavItem {
  id: NavRoute
  label: string
  icon: React.ElementType
  enabled: boolean
  group?: 'main' | 'bottom'
}

const NAV_ITEMS: NavItem[] = [
  { id: 'projects', label: 'Projetos',       icon: FolderKanban,   enabled: true,  group: 'main' },
  { id: 'studio',   label: 'Estúdio',        icon: RiBrushAiLine,  enabled: true,  group: 'main' },
  { id: 'agents',   label: 'Agentes',        icon: Bot,            enabled: true,  group: 'main' },
  { id: 'mcp',      label: 'MCP',            icon: McpIcon,        enabled: true,  group: 'main' },
  { id: 'skills',   label: 'Skills',         icon: RiBrainAi3Line, enabled: true,  group: 'main' },
  { id: 'prompts',  label: 'Prompts',        icon: RiChatAi2Line,  enabled: true,  group: 'main' },
  { id: 'status',   label: 'Status',         icon: ShieldCheck,    enabled: true,  group: 'bottom' },
  { id: 'docker',   label: 'Gestão',          icon: Container,      enabled: true,  group: 'bottom' },
  { id: 'settings', label: 'Configurações',  icon: Settings,       enabled: true,  group: 'bottom' },
]

function NavButton({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick: () => void }) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      disabled={!item.enabled}
      className={`
        group relative w-full flex items-center justify-start rounded-lg pl-[13px] pr-3 py-2.5 transition-all duration-200 gap-3
        ${isActive
          ? 'bg-blue-600/20 text-blue-400 shadow-[0_0_0_1px_rgba(59,130,246,0.3)]'
          : item.enabled
            ? 'tx-secondary hover:tx-primary hover:bg-[var(--line-subtle)]'
            : 'opacity-40 cursor-not-allowed tx-faint'
        }
      `}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" strokeWidth={isActive ? 2 : 1.75} />

      {/* Label Text */}
      <span className="text-xs font-medium whitespace-nowrap transition-all duration-300 opacity-0 max-w-0 overflow-hidden group-hover/sidebar:opacity-100 group-hover/sidebar:max-w-[140px]">
        {item.label}
      </span>

      {/* Tooltip */}
      <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded-md card text-xs font-medium tx-primary whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover/sidebar:!opacity-0 transition-opacity z-50 shadow-xl">
        {item.label}
        {!item.enabled && <span className="ml-1.5 text-[10px] tx-muted">(em breve)</span>}
      </span>

      {/* Active indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r-full" />
      )}
    </button>
  )
}

export default function AppSidebar({ activeRoute, onNavigate, theme = 'dark', onToggleTheme }: AppSidebarProps) {
  const mainItems   = NAV_ITEMS.filter(i => i.group === 'main')
  const bottomItems = NAV_ITEMS.filter(i => i.group === 'bottom')

  return (
    <aside
      className="w-[60px] hover:w-[220px] shrink-0 flex flex-col py-4 border-r transition-all duration-300 ease-in-out group/sidebar z-30"
      style={{ backgroundColor: 'var(--surface-sidebar)', borderColor: 'var(--line)' }}
    >
      {/* Logo */}
      <div className="mb-5 flex items-center justify-start w-full px-3 h-9 gap-3 overflow-hidden">
        <img src={faviconUrl} alt="Logo" className="w-9 h-9 object-contain shrink-0" />
        <span className="text-sm font-bold tracking-wider tx-primary font-sans transition-all duration-300 opacity-0 max-w-0 overflow-hidden group-hover/sidebar:opacity-100 group-hover/sidebar:max-w-[140px] whitespace-nowrap">
          Nika IDE
        </span>
      </div>

      {/* Main nav */}
      <div className="w-full px-2 flex flex-col gap-1 flex-1">
        {mainItems.map(item => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeRoute === item.id}
            onClick={() => item.enabled && onNavigate(item.id)}
          />
        ))}
      </div>

      {/* Bottom nav */}
      <div className="w-full px-2 flex flex-col gap-1 mt-auto pt-3" style={{ borderTop: '1px solid var(--line-subtle)' }}>
        {/* Theme toggle — above Status */}
        <button
          onClick={onToggleTheme}
          className="group relative w-full flex items-center justify-start rounded-lg pl-[13px] pr-3 py-2.5 transition-all duration-200 tx-muted hover:tx-primary hover:bg-[var(--line-subtle)] gap-3"
        >
          <Palette className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
          <span className="text-xs font-medium whitespace-nowrap transition-all duration-300 opacity-0 max-w-0 overflow-hidden group-hover/sidebar:opacity-100 group-hover/sidebar:max-w-[140px]">
            {`Tema: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
          </span>
          <span className="pointer-events-none absolute left-full ml-3 px-2 py-1 rounded-md card text-xs font-medium tx-primary whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover/sidebar:!opacity-0 transition-opacity z-50 shadow-xl">
            {`Tema: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
          </span>
        </button>

        {bottomItems.map(item => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeRoute === item.id}
            onClick={() => item.enabled && onNavigate(item.id)}
          />
        ))}
      </div>
    </aside>
  )
}

