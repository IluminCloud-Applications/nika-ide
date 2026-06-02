import { PromptTemplate } from '../types'

export const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    id: 'criar-componente',
    name: 'Criar Componente UI',
    description: 'Gera um componente React utilizando Tailwind CSS e ShadCN.',
    content: 'Crie um componente React chamado {{Nome do Componente}} que seja {{Descrição do visual e comportamento}}. Importe elementos do ShadCN já disponíveis no código se necessário. Use Remix Icons (ri-*) para os ícones.',
    isDefault: true,
    gradient: 'from-blue-600/20 to-blue-500/5',
    iconBg: 'bg-blue-500/15 border-blue-500/25',
    tags: ['frontend', 'componente', 'ui', 'shadcn']
  },
  {
    id: 'criar-endpoint',
    name: 'Criar Endpoint API',
    description: 'Gera um endpoint FastAPI em Python com validação Pydantic.',
    content: 'Crie um endpoint de API em FastAPI para {{Ação do endpoint, ex: obter dados}}. Deve receber o model Pydantic com as validações de {{Campos a validar e tipos}}. Previna IDOR filtrando pelo ID do usuário autenticado se aplicável.',
    isDefault: true,
    gradient: 'from-violet-600/20 to-violet-500/5',
    iconBg: 'bg-violet-500/15 border-violet-500/25',
    tags: ['backend', 'fastapi', 'python', 'security']
  },
  {
    id: 'refatorar-codigo',
    name: 'Refatorar Código',
    description: 'Refatora o código para melhorar modularidade e manter arquivos menores de 200 linhas.',
    content: 'Refatore o código a seguir:\n\n```\n{{Código Atual}}\n```\n\nMelhore a legibilidade, evite duplicações e garanta que o código esteja bem estruturado com arquivos de menos de 200 linhas.',
    isDefault: true,
    gradient: 'from-cyan-600/20 to-cyan-500/5',
    iconBg: 'bg-cyan-500/15 border-cyan-500/25',
    tags: ['refatoração', 'limpeza', 'padrões']
  },
  {
    id: 'configurar-cors',
    name: 'Configurar CORS',
    description: 'Configura CORS no backend de forma segura usando variáveis de ambiente.',
    content: 'Configure as políticas de CORS no FastAPI para aceitar requisições de {{Origem do Frontend}} lida dinamicamente da variável de ambiente {{Variável .env}}.',
    isDefault: true,
    gradient: 'from-emerald-600/20 to-emerald-500/5',
    iconBg: 'bg-emerald-500/15 border-emerald-500/25',
    tags: ['backend', 'cors', 'segurança']
  },
  {
    id: 'mock-data',
    name: 'Mock Data para Visualização',
    description: 'Adiciona dados simulados no frontend para testar interfaces isoladamente.',
    content: 'Insira dados de mock para simular a resposta de {{Nome do Recurso}} na página {{Nome da Página}} do frontend para que possamos testar o layout sem o backend ativo. Os dados devem conter {{Campos, ex: id, nome, status}}.',
    isDefault: true,
    gradient: 'from-amber-600/20 to-amber-500/5',
    iconBg: 'bg-amber-500/15 border-amber-500/25',
    tags: ['mock', 'frontend', 'layout', 'teste']
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
