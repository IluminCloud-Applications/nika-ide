export const TOOLS = [
  {
    name: 'start_app',
    description: 'Inicia os servidores do projeto: sobe o backend via Docker Compose e inicia o servidor de desenvolvimento React na porta 5177.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'stop_app',
    description: 'Para todos os servidores do projeto: desliga os containers Docker (docker compose down) e encerra o processo do frontend na porta 5177.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'docker_exec',
    description: 'Executa um comando administrativo dentro do container do backend (ex: migrações de banco de dados, instalação de pacotes, etc).',
    inputSchema: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'O comando a ser rodado dentro do container (ex: "python scripts/create_user.py", "pip install requests")'
        }
      },
      required: ['command']
    }
  },
  {
    name: 'sql_execute',
    description: 'Executa comandos SQL diretamente no PostgreSQL do container e retorna as linhas ou resultados em formato JSON.',
    inputSchema: {
      type: 'object',
      properties: {
        sql: {
          type: 'string',
          description: 'A query SQL válida a ser executada no banco de dados (ex: "SELECT * FROM users;", "DELETE FROM users WHERE email = ...")'
        }
      },
      required: ['sql']
    }
  },
  {
    name: 'git_commit',
    description: 'Salva uma versão do código atual realizando um Git Commit com a mensagem fornecida.',
    inputSchema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'A mensagem de commit descrevendo as alterações feitas (ex: "Criado o formulário de login", "Adicionado campo de data de nascimento")'
        }
      },
      required: ['message']
    }
  },
  {
    name: 'check_app',
    description: 'Checa a saúde geral do projeto (roda npm run build e npm audit no frontend, verifica se o Docker do backend está UP, compila arquivos Python para detectar erros de sintaxe e analisa logs do container backend em busca de exceções).',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'create_prompt',
    description: 'Cria um novo template de prompt no Nika IDE. DICA: Utilize variáveis no formato {{Nome da Variavel}} no conteúdo para que o usuário as preencha de forma visual ao usar o prompt.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nome legível do prompt (ex: "Criar Controller NestJS")' },
        description: { type: 'string', description: 'O que esse prompt faz e quando usá-lo' },
        content: { type: 'string', description: 'Conteúdo do prompt. Pode conter variáveis como {{Digite seu nome}}' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags para categorização do prompt' }
      },
      required: ['name', 'description', 'content']
    }
  },
  {
    name: 'create_agent',
    description: 'Cria um novo Agente (System Instructions personalizadas) no Nika IDE para guiar a IA no desenvolvimento.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nome do agente (ex: "Especialista Stripe")' },
        description: { type: 'string', description: 'Descrição da especialidade do agente' },
        systemInstructions: { type: 'string', description: 'As instruções de sistema detalhadas' },
        tags: { type: 'array', items: { type: 'string' }, description: 'Tags associadas ao agente' }
      },
      required: ['name', 'description', 'systemInstructions']
    }
  },
  {
    name: 'create_mcp',
    description: 'Cria ou atualiza um servidor MCP customizado no Nika IDE.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID único do servidor MCP em minúsculo e sem espaços (ex: "stripe")' },
        name: { type: 'string', description: 'Nome visível do servidor MCP' },
        configText: { type: 'string', description: 'A configuração JSON do servidor contendo o command/args ou url' },
        enabled: { type: 'boolean', description: 'Se o MCP deve ser ativado imediatamente' }
      },
      required: ['id', 'name', 'configText']
    }
  },
  {
    name: 'create_skill',
    description: 'Cria uma nova Skill (conjunto de diretrizes e boas práticas em Markdown) no projeto ativo e nos templates globais.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'ID/Nome da skill em minúsculo com hífen (ex: "auth-jwt", "payment-stripe")' },
        description: { type: 'string', description: 'Descrição detalhada de quando a IA deve ativar essa skill' },
        content: { type: 'string', description: 'O conteúdo em Markdown contendo as diretrizes, exemplos de código e gotchas' }
      },
      required: ['name', 'description', 'content']
    }
  },
  {
    name: 'list_docs',
    description: 'Lista todas as documentações salvas pelo usuário no Nika IDE (nome, slug e descrição). Use esta tool SEMPRE que precisar de documentação atualizada de uma API ou biblioteca. Após listar, use get_doc com o slug para obter o conteúdo completo.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'get_doc',
    description: 'Obtém o conteúdo completo de uma documentação pelo slug. Use após list_docs para carregar a documentação de uma API ou lib específica (ex: LangChain, Brevo, AssemblyAI) antes de implementar integrações.',
    inputSchema: {
      type: 'object',
      properties: {
        slug: {
          type: 'string',
          description: 'O slug da documentação obtido via list_docs (ex: "langchain", "brevo-api", "assemblyai")'
        }
      },
      required: ['slug']
    }
  },
  {
    name: 'create_doc',
    description: 'Cria ou atualiza uma documentação de biblioteca/API no Nika IDE. Isso permite que a IA salve novas especificações técnicas que o usuário enviar para consulta futura.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nome amigável da biblioteca ou API (ex: "Stripe", "NextAuth")' },
        description: { type: 'string', description: 'Breve descrição de qual API/Lib se trata' },
        content: { type: 'string', description: 'O conteúdo em formato Markdown com exemplos de código, endpoints e parâmetros' }
      },
      required: ['name', 'description', 'content']
    }
  }
]
