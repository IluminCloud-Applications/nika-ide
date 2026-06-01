import { Agent } from '../types'
import { PADRAO_INSTRUCTIONS } from './instructions/padrao'
import { FRONTEND_INIT_INSTRUCTIONS } from './instructions/frontendInit'
import { FRONTEND_UX_INSTRUCTIONS } from './instructions/frontendUX'
import { BACKEND_INSTRUCTIONS } from './instructions/backend'
import { IA_INSTRUCTIONS } from './instructions/ia'
import { PRODUCAO_INSTRUCTIONS } from './instructions/producao'
import { OPENSOURCE_INSTRUCTIONS } from './instructions/opensource'

export const DEFAULT_AGENTS: Agent[] = [
  {
    id: 'padrao',
    name: 'Padrão',
    description: 'Instruções de sistema padrão para desenvolvimento Fullstack geral (React, Shadcn, FastAPI Python).',
    systemInstructions: PADRAO_INSTRUCTIONS,
    isDefault: true,
    gradient: 'from-blue-600/20 to-blue-500/5',
    iconBg: 'bg-blue-500/15 border-blue-500/25',
    tags: ['fullstack', 'react', 'fastapi', 'standard']
  },
  {
    id: 'frontend-init',
    name: 'Frontend Init',
    description: 'Focado em criar o frontend de forma isolada usando dados simulados (mock data) para visualização rápida.',
    systemInstructions: FRONTEND_INIT_INSTRUCTIONS,
    isDefault: true,
    gradient: 'from-cyan-600/20 to-cyan-500/5',
    iconBg: 'bg-cyan-500/15 border-cyan-500/25',
    tags: ['mock-data', 'frontend', 'quick-start']
  },
  {
    id: 'frontend-ux',
    name: 'Frontend UI/UX',
    description: 'Focado em design consistente, estética dark premium, micro-animações, layout responsivo e Remix Icons.',
    systemInstructions: FRONTEND_UX_INSTRUCTIONS,
    isDefault: true,
    gradient: 'from-indigo-600/20 to-indigo-500/5',
    iconBg: 'bg-indigo-500/15 border-indigo-500/25',
    tags: ['ui-ux', 'design', 'tailwind', 'animation']
  },
  {
    id: 'backend',
    name: 'Backend',
    description: 'Especializado em bancos de dados relacionais, modelagem de tabelas SQL, schemas Pydantic e segurança IDOR.',
    systemInstructions: BACKEND_INSTRUCTIONS,
    isDefault: true,
    gradient: 'from-violet-600/20 to-violet-500/5',
    iconBg: 'bg-violet-500/15 border-violet-500/25',
    tags: ['python', 'fastapi', 'postgres', 'security']
  },
  {
    id: 'inteligencia-artificial',
    name: 'Inteligência Artificial',
    description: 'Focado em Langchain, RAG, persistência de memória de chat, cache semântico e tabelas de controle de custos.',
    systemInstructions: IA_INSTRUCTIONS,
    isDefault: true,
    gradient: 'from-amber-600/20 to-amber-500/5',
    iconBg: 'bg-amber-500/15 border-amber-500/25',
    tags: ['langchain', 'rag', 'llm-tokens', 'vector-db']
  },
  {
    id: 'producao',
    name: 'Produção',
    description: 'Focado em gunicorn, caching com Redis, middlewares de rate limit, headers de segurança e Docker multi-stage.',
    systemInstructions: PRODUCAO_INSTRUCTIONS,
    isDefault: true,
    gradient: 'from-red-600/20 to-red-500/5',
    iconBg: 'bg-red-500/15 border-red-500/25',
    tags: ['devops', 'gunicorn', 'redis', 'security-hardening']
  },
  {
    id: 'opensource',
    name: 'OpenSource / White Label',
    description: 'Especialista em ferramentas internas sem complexidade multi-tenant, Setup Wizards locais e configurações dinâmicas.',
    systemInstructions: OPENSOURCE_INSTRUCTIONS,
    isDefault: true,
    gradient: 'from-rose-600/20 to-rose-500/5',
    iconBg: 'bg-rose-500/15 border-rose-500/25',
    tags: ['single-user', 'setup-wizard', 'local-app', 'white-label']
  }
]
