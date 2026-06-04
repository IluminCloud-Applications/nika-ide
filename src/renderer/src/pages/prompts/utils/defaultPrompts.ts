import { PromptTemplate } from '../types'

export const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    id: 'configurar-apis-backend',
    name: 'Configurar APIs do Backend',
    description: 'Configura as rotas, remove mocks e integra o frontend com o backend de forma simples, direta e segura.',
    content: 'Remova os mocks existentes e configure as rotas e conexões de API entre o frontend e o backend, tornando a comunicação totalmente funcional. O foco principal é a integração segura, inteligente e organizada (por exemplo, tratamento de erros, CORS e passagem de dados). Caso a funcionalidade exija dependências ou serviços complexos (como Playwright, LangChain ou bancos de dados adicionais), limite-se a instalar as bibliotecas necessárias nos arquivos de dependências (requirements.txt, package.json, etc.) sem implementar o código complexo propriamente dito.',
    isDefault: true,
    gradient: 'from-blue-600/20 to-blue-500/5',
    iconBg: 'bg-blue-500/15 border-blue-500/25',
    tags: ['backend', 'api', 'integração', 'fullstack']
  },
  {
    id: 'refatoracao-projeto',
    name: 'Refatoração Estrutural (Mais de 300 linhas)',
    description: 'Refatora arquivos grandes do projeto quebrando-os em múltiplos arquivos menores.',
    content: 'Analise a estrutura do projeto e identifique qualquer arquivo de código que possua mais de 300 linhas de código (por exemplo, um index.tsx ou routes.py com 1000 linhas). Realize uma refatoração limpa quebrando esse arquivo em múltiplos arquivos menores e mais focados, e importe-os no arquivo original (index) para manter a funcionalidade original intacta.',
    isDefault: true,
    gradient: 'from-rose-600/20 to-rose-500/5',
    iconBg: 'bg-rose-500/15 border-rose-500/25',
    tags: ['refatoração', 'limpeza', 'arquitetura']
  },
  {
    id: 'raio-x-projeto',
    name: 'Raio-X do Projeto',
    description: 'Analisa a estrutura geral do frontend e do backend de uma determinada parte do projeto.',
    content: 'Realize uma análise profunda (Raio-X) de toda a estrutura e fluxos relacionados a {{Qual parte do projeto analisar, ex: login, pagamentos, tarefas}}. Investigue tanto o frontend (arquivos React, hooks, components) quanto o backend (FastAPI, schemas Pydantic, banco de dados, Docker). Explique como a lógica e a comunicação frontend-backend estão estruturadas nessa funcionalidade.',
    isDefault: true,
    gradient: 'from-violet-600/20 to-violet-500/5',
    iconBg: 'bg-violet-500/15 border-violet-500/25',
    tags: ['raio-x', 'análise', 'documentação', 'fullstack']
  },
  {
    id: 'correcao-erros',
    name: 'Correção de Erros (Debugging)',
    description: 'Localiza e corrige bugs e comportamentos incorretos em uma funcionalidade específica.',
    content: 'Estou enfrentando um erro ou comportamento inesperado na seguinte funcionalidade: {{Funcionalidade e descrição do erro}}. Realize um processo completo de debugging no projeto, analisando tanto o frontend quanto o backend, para identificar a causa raiz e corrigir o problema mantendo o código limpo.',
    isDefault: true,
    gradient: 'from-emerald-600/20 to-emerald-500/5',
    iconBg: 'bg-emerald-500/15 border-emerald-500/25',
    tags: ['debugging', 'bugs', 'correção', 'erros']
  }
]
