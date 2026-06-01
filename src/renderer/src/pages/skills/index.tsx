import { useState, useEffect } from 'react'
import { Globe, Server, Container, CreditCard, Cloud, Layers, PenLine, ShieldCheck } from 'lucide-react'
import PageShell from '../../components/layout/PageShell'
import { PageHeader, FilterBar, ItemTag, Toggle, ItemCard, ItemIcon, EmptyState } from '../../components/ui/PageWidgets'

type SkillCategory = 'frontend' | 'backend' | 'security' | 'devops' | 'payments' | 'hosting' | 'writing'

interface Skill {
  id: string; name: string; tagline: string; description: string
  category: SkillCategory; tags: string[]; enabled: boolean; featured?: boolean
  iconColor: string; iconBg: string
}

const CATEGORY_META: Record<SkillCategory, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  frontend: { label: 'Frontend',   icon: Globe,       color: 'text-blue-400',    bg: '#3b82f6' },
  backend:  { label: 'Backend',    icon: Server,      color: 'text-violet-400',  bg: '#8b5cf6' },
  security: { label: 'Segurança',  icon: ShieldCheck, color: 'text-red-400',     bg: '#ef4444' },
  devops:   { label: 'DevOps',     icon: Container,   color: 'text-emerald-400', bg: '#10b981' },
  payments: { label: 'Pagamentos', icon: CreditCard,  color: 'text-green-400',   bg: '#22c55e' },
  hosting:  { label: 'Hosting',    icon: Cloud,       color: 'text-sky-400',     bg: '#0ea5e9' },
  writing:  { label: 'Escrita',    icon: PenLine,     color: 'text-rose-400',    bg: '#f43f5e' },
}

const SKILLS: Skill[] = [
  { id: 'react-shadcn',       name: 'React + ShadCN',           tagline: 'UI components prontos para uso',            description: 'Biblioteca completa de componentes ShadCN pré-instalados. A IA importa componentes existentes ao invés de criar do zero.', category: 'frontend', tags: ['react', 'shadcn', 'typescript', 'radix'],   enabled: true,  featured: true,  iconColor: 'text-blue-400',    iconBg: '#3b82f6' },
  { id: 'tailwind',           name: 'Tailwind CSS',              tagline: 'Utility-first CSS framework',              description: 'Estilização rápida com Tailwind. Instruções para classes utilitárias, design system e componentes responsivos.',          category: 'frontend', tags: ['tailwind', 'css', 'responsive'],            enabled: true,                   iconColor: 'text-cyan-400',    iconBg: '#06b6d4' },
  { id: 'remix-icons',        name: 'Remix Icons',               tagline: 'Biblioteca de ícones open-source',         description: 'Mais de 2800 ícones vetoriais gratuitos. A IA usa classes `ri-*` para adicionar ícones semânticos.',                        category: 'frontend', tags: ['icons', 'svg', 'remix', 'ui'],             enabled: false,                  iconColor: 'text-indigo-400',  iconBg: '#6366f1' },
  { id: 'fastapi',            name: 'FastAPI',                   tagline: 'APIs Python modernas e rápidas',           description: 'Backend Python com FastAPI. Inclui estrutura de rotas, schemas Pydantic, validações e integração com Docker.',              category: 'backend',  tags: ['python', 'fastapi', 'pydantic', 'rest'],   enabled: true,  featured: true,  iconColor: 'text-violet-400',  iconBg: '#8b5cf6' },
  { id: 'auth-jwt',           name: 'Auth JWT',                  tagline: 'Autenticação segura e completa',           description: 'Sistema de autenticação com JWT. Login, registro, refresh token, guards de rota e proteção de endpoints.',                    category: 'security', tags: ['auth', 'jwt', 'bcrypt', 'sessions'],       enabled: true,                   iconColor: 'text-orange-400',  iconBg: '#f97316' },
  { id: 'rate-limit',         name: 'Rate Limiting',             tagline: 'Proteção contra abuso e DDoS',             description: 'Limita requisições por IP/usuário para prevenir brute-force, DDoS e abuso de API.',                                          category: 'security', tags: ['rate-limit', 'ddos', 'brute-force'],       enabled: true,                   iconColor: 'text-red-400',     iconBg: '#ef4444' },
  { id: 'data-separation',    name: 'Separação Frontend/Backend', tagline: 'Credenciais sensíveis nunca no frontend', description: 'Garante que tokens, API keys e secrets externos fiquem exclusivamente no backend.',                                         category: 'security', tags: ['secrets', 'api-keys', 'proxy', 'env'],    enabled: true,                   iconColor: 'text-rose-400',    iconBg: '#f43f5e' },
  { id: 'cors-config',        name: 'CORS + Origens',            tagline: 'Controle estrito de origens permitidas',   description: 'Configura CORS via .env em ambos os lados: frontend aponta para o backend e o backend restringe requisições.',               category: 'security', tags: ['cors', 'origins', 'env', 'headers'],      enabled: true,                   iconColor: 'text-amber-400',   iconBg: '#f59e0b' },
  { id: 'input-validation',   name: 'Validação Estrita de Input', tagline: 'Nunca confie no que vem do cliente',      description: 'Valida formato, tipo e tamanho de cada dado que entra na API com Zod ou Joi.',                                               category: 'security', tags: ['zod', 'joi', 'validation', 'sanitization'], enabled: true,                  iconColor: 'text-yellow-400',  iconBg: '#eab308' },
  { id: 'idor-prevention',    name: 'Prevenção de IDOR',         tagline: 'Usuário só acessa seus próprios dados',    description: 'Previne Insecure Direct Object Reference: toda query filtra por owner_id do usuário autenticado.',                            category: 'security', tags: ['idor', 'authorization', 'ownership'],      enabled: true,                   iconColor: 'text-pink-400',    iconBg: '#ec4899' },
  { id: 'postgres-drizzle',   name: 'PostgreSQL + Drizzle',      tagline: 'Banco de dados relacional typesafe',       description: 'PostgreSQL com ORM Drizzle. Migrations automáticas, schema typesafe e queries performáticas.',                               category: 'backend',  tags: ['postgres', 'drizzle', 'sql', 'migrations'], enabled: false,                 iconColor: 'text-amber-400',   iconBg: '#f59e0b' },
  { id: 'docker-compose',     name: 'Docker Compose',            tagline: 'Ambiente completo em containers',          description: 'Setup de ambiente completo com Docker Compose. Redis, PostgreSQL, Nginx, workers e hot reload.',                              category: 'devops',   tags: ['docker', 'containers', 'redis', 'nginx'],  enabled: true,                   iconColor: 'text-emerald-400', iconBg: '#10b981' },
  { id: 'stripe',             name: 'Stripe Payments',           tagline: 'Pagamentos e assinaturas',                 description: 'Integração completa com Stripe. Checkout, webhooks, assinaturas recorrentes e portal do cliente.',                           category: 'payments', tags: ['stripe', 'checkout', 'subscriptions'],     enabled: false,                  iconColor: 'text-green-400',   iconBg: '#22c55e' },
  { id: 'ilumin-cloud',       name: 'Ilumin Cloud',              tagline: 'Deploy 1-clique na nuvem',                 description: 'Plataforma de hospedagem Ilumin com deploy automatizado. Do código ao ar em segundos.',                                        category: 'hosting',  tags: ['deploy', 'hosting', 'ilumin', 'cloud'],   enabled: false,  featured: true,  iconColor: 'text-sky-400',     iconBg: '#0ea5e9' },
  { id: 'humanizer',          name: 'Humanizer de Textos',       tagline: 'Textos que soam naturais e humanos',       description: 'Instrui a IA a sempre humanizar os textos gerados. Evita linguagem robótica e genérica.',                                     category: 'writing',  tags: ['humanizer', 'copywriting', 'ux-writing'],  enabled: true,                   iconColor: 'text-rose-400',    iconBg: '#f43f5e' },
  { id: 'project-organization', name: 'Organização de Projeto',  tagline: 'Componentização e estrutura modular',      description: 'Limita arquivos de código a 200 linhas e organiza frontend e backend em pastas/subpastas limpas.',                           category: 'devops',   tags: ['folders', 'modular', 'components'],        enabled: true,  featured: true,  iconColor: 'text-emerald-400', iconBg: '#10b981' },
]

function SkillCard({ skill, onToggle, syncing }: { skill: Skill; onToggle: () => void; syncing?: boolean }) {
  const catMeta = CATEGORY_META[skill.category]
  const CatIcon = catMeta.icon
  return (
    <ItemCard enabled={skill.enabled} accentColor={skill.iconBg}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <ItemIcon icon={CatIcon} color={skill.iconColor} bg={skill.iconBg} />
          <Toggle enabled={skill.enabled} onToggle={onToggle} syncing={syncing} />
        </div>
        <div className="mb-2">
          <h3 className="text-sm font-bold tx-primary leading-tight">{skill.name}</h3>
          <p className="text-xs tx-muted mt-0.5">{skill.tagline}</p>
        </div>
        <p className="text-xs tx-muted leading-relaxed line-clamp-2">{skill.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {skill.tags.slice(0, 3).map(tag => <ItemTag key={tag}>{tag}</ItemTag>)}
          {skill.tags.length > 3 && <span className="text-[10px] tx-faint">+{skill.tags.length - 3}</span>}
        </div>
      </div>
    </ItemCard>
  )
}

export default function SkillsPage() {
  const [skills, setSkills]         = useState<Skill[]>(SKILLS)
  const [search, setSearch]         = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [syncing, setSyncing]       = useState<string | null>(null)

  useEffect(() => {
    if (!window.api?.skills) return
    window.api.skills.getState().then((state: Record<string, boolean>) => {
      setSkills(prev => prev.map(s => ({ ...s, enabled: s.id in state ? state[s.id] : true })))
    })
  }, [])

  const handleToggle = async (id: string) => {
    const skill = skills.find(s => s.id === id)
    if (!skill) return
    const newEnabled = !skill.enabled
    setSkills(prev => prev.map(s => s.id === id ? { ...s, enabled: newEnabled } : s))
    setSyncing(id)
    if (window.api?.skills) await window.api.skills.setEnabled(id, newEnabled, SKILLS.map(s => s.id))
    setSyncing(null)
  }

  const filtered = skills.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.tags.some(t => t.includes(search.toLowerCase()))
    const matchCat = activeCategory === 'all' || s.category === activeCategory
    return matchSearch && matchCat
  })

  const enabledCount = skills.filter(s => s.enabled).length
  const categories = [
    { key: 'all', label: 'Todas' },
    ...Object.entries(CATEGORY_META).map(([key, { label }]) => ({ key, label })),
  ]

  return (
    <PageShell>
      <PageHeader
        title="Skills"
        subtitle={<>Tecnologias e capacidades disponíveis para seus projetos. <span className="tx-faint">{enabledCount} ativas de {skills.length}.</span></>}
      />
      <FilterBar search={search} onSearch={setSearch} placeholder="Buscar skill ou tecnologia..." filters={categories} activeFilter={activeCategory} onFilter={setActiveCategory} />

      {filtered.length === 0
        ? <EmptyState icon={Layers} message="Nenhuma skill encontrada." />
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-10">
            {filtered.map(skill => (
              <SkillCard key={skill.id} skill={skill} onToggle={() => handleToggle(skill.id)} syncing={syncing === skill.id} />
            ))}
          </div>
        )
      }
    </PageShell>
  )
}
