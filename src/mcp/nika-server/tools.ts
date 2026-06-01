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
  }
]
