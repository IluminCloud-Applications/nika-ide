import { Cloud, Globe, Bot, PenLine, Layers, Plug2 } from 'lucide-react'

export type McpCategory = 'cloud' | 'design' | 'context' | 'writing' | 'management' | 'custom'

export interface McpServer {
  id: string
  name: string
  tagline: string
  description: string
  category: McpCategory
  tags: string[]
  enabled: boolean
  requiresAuth: boolean
  apiKey?: string
  gradient: string
  iconBg: string
  isCustom?: boolean
  configText?: string
}

export const CATEGORY_META: Record<McpCategory, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  cloud:      { label: 'Cloud & Deploy',  icon: Cloud,    color: 'text-sky-400',     bg: '#0ea5e9' },
  design:     { label: 'Design & UI',     icon: Globe,    color: 'text-indigo-400',  bg: '#6366f1' },
  context:    { label: 'Contexto & IA',   icon: Bot,      color: 'text-violet-400',  bg: '#8b5cf6' },
  writing:    { label: 'Escrita & Copy',  icon: PenLine,  color: 'text-rose-400',    bg: '#f43f5e' },
  management: { label: 'Produtividade',   icon: Layers,   color: 'text-emerald-400', bg: '#10b981' },
  custom:     { label: 'Customizados',    icon: Plug2,    color: 'text-amber-400',   bg: '#f59e0b' },
}

export const DEFAULT_MCPS: McpServer[] = [
  {
    id: 'IluminMCP',
    name: 'Ilumin Cloud',
    tagline: 'MCP para deploy contínuo',
    description: 'Permite que a IA gerencie deploys, configure servidores e verifique logs na Ilumin Cloud em tempo real.',
    category: 'cloud',
    tags: ['deploy', 'cloud', 'hosting', 'ilumin'],
    enabled: false,
    requiresAuth: true,
    gradient: 'from-sky-600/20 via-blue-600/10 to-violet-600/5',
    iconBg: 'bg-sky-500/15 border-sky-500/25'
  },
  {
    id: 'remix-icon',
    name: 'Remix Icons',
    tagline: 'Acesso completo a Remix Icons',
    description: 'Injeta e pesquisa ícones Remix Icons no código do frontend de forma inteligente baseando-se no contexto visual.',
    category: 'design',
    tags: ['icons', 'design', 'ui', 'remix'],
    enabled: true,
    requiresAuth: false,
    gradient: 'from-indigo-600/20 to-indigo-500/5',
    iconBg: 'bg-indigo-500/15 border-indigo-500/25'
  },
  {
    id: 'shadcn',
    name: 'Shadcn UI',
    tagline: 'Componentes do Shadcn UI',
    description: 'Permite que a IA instale, atualize e gerencie componentes da biblioteca Shadcn UI diretamente no seu projeto.',
    category: 'design',
    tags: ['design', 'ui', 'shadcn', 'components'],
    enabled: true,
    requiresAuth: false,
    gradient: 'from-slate-600/20 to-slate-500/5',
    iconBg: 'bg-slate-500/15 border-slate-500/25'
  },
  {
    id: 'context7',
    name: 'Context7',
    tagline: 'Contexto de arquivos inteligente',
    description: 'Expande a inteligência do agente fornecendo indexação profunda de arquivos e estruturas de código de projetos.',
    category: 'context',
    tags: ['context', 'ai', 'files', 'indexing'],
    enabled: false,
    requiresAuth: true,
    gradient: 'from-violet-600/20 to-violet-500/5',
    iconBg: 'bg-violet-500/15 border-violet-500/25'
  },
  {
    id: 'offerspro',
    name: 'OffersPRO',
    tagline: 'MCP especializado em Copywriting',
    description: 'Fornece frameworks de alta conversão, headlines persuasivas e ganchos para páginas de vendas diretamente na geração de textos.',
    category: 'writing',
    tags: ['copywriting', 'sales', 'offers', 'marketing'],
    enabled: false,
    requiresAuth: true,
    gradient: 'from-rose-600/20 to-rose-500/5',
    iconBg: 'bg-rose-500/15 border-rose-500/25'
  },
  {
    id: 'tarefas',
    name: 'Tarefas',
    tagline: 'Gerenciador de tarefas do projeto',
    description: 'Permite que a IA visualize, crie e atualize cartões Kanban de tarefas no seu workspace.',
    category: 'management',
    tags: ['tasks', 'todo', 'kanban', 'agile'],
    enabled: true,
    requiresAuth: false,
    gradient: 'from-emerald-600/20 to-emerald-500/5',
    iconBg: 'bg-emerald-500/15 border-emerald-500/25'
  },
  {
    id: 'browser',
    name: 'Browser MCP',
    tagline: 'Console, network e controle do preview',
    description: 'Dá à IA acesso ao navegador interno: ler logs do console, listar e inspecionar chamadas de API (fetch/XHR), executar código no console, tirar screenshots e navegar entre páginas do preview para testar a aplicação.',
    category: 'design',
    tags: ['browser', 'console', 'network', 'api', 'debug', 'screenshot', 'preview'],
    enabled: true,
    requiresAuth: false,
    gradient: 'from-cyan-600/20 to-cyan-500/5',
    iconBg: 'bg-cyan-500/15 border-cyan-500/25'
  },
  {
    id: 'nika-mcp',
    name: 'Nika MCP',
    tagline: 'Controle de infraestrutura local',
    description: 'Dá à IA controle local para gerenciar o ciclo de vida do app: iniciar e parar os servidores, rodar comandos administrativos no docker e realizar operações diretas com queries SQL no Postgres.',
    category: 'management',
    tags: ['docker', 'postgres', 'infra', 'devops', 'lifecycle'],
    enabled: true,
    requiresAuth: false,
    gradient: 'from-amber-600/20 to-amber-500/5',
    iconBg: 'bg-amber-500/15 border-amber-500/25'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    tagline: 'MCP oficial da Stripe',
    description: 'Integração para gerenciar pagamentos, assinaturas, clientes e faturas da Stripe em tempo real.',
    category: 'cloud',
    tags: ['pagamentos', 'stripe', 'financeiro'],
    enabled: false,
    requiresAuth: true,
    gradient: 'from-purple-600/20 to-purple-500/5',
    iconBg: 'bg-purple-500/15 border-purple-500/25'
  },
  {
    id: 'asaas',
    name: 'Asaas',
    tagline: 'MCP para documentação da Asaas',
    description: 'Fornece documentação e referências da Asaas API para auxiliar no desenvolvimento de integrações de pagamento brasileiras.',
    category: 'cloud',
    tags: ['pagamentos', 'asaas', 'documentacao'],
    enabled: false,
    requiresAuth: false,
    gradient: 'from-blue-600/20 to-blue-500/5',
    iconBg: 'bg-blue-500/15 border-blue-500/25'
  }
]
