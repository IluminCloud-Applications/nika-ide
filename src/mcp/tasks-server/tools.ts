export const TOOLS = [
  {
    name: 'get_next_task',
    description: [
      'Obtém a próxima tarefa PENDENTE do projeto para a IA executar.',
      'Retorna id, title, description e instruções de como proceder.',
      'Sempre inicie pela leitura da tarefa antes de fazer qualquer alteração no código.',
      'Quando terminar a implementação, chame move_to_review.'
    ].join(' '),
    inputSchema: {
      type: 'object',
      properties: {
        project_path: {
          type: 'string',
          description: 'Caminho absoluto do projeto. Obrigatório.'
        }
      },
      required: ['project_path']
    }
  },
  {
    name: 'move_to_review',
    description: [
      'Move uma tarefa PENDENTE para REVISÃO após a IA terminar a implementação.',
      'IMPORTANTE: Só chame esta tool quando a implementação estiver 100% concluída.',
      'Após mover, um git commit automático será feito com o título da tarefa.',
      'Depois disso chame get_next_task para obter a próxima tarefa.'
    ].join(' '),
    inputSchema: {
      type: 'object',
      properties: {
        project_path: {
          type: 'string',
          description: 'Caminho absoluto do projeto.'
        },
        task_id: {
          type: 'number',
          description: 'ID da tarefa a ser movida para revisão.'
        },
        ai_notes: {
          type: 'string',
          description: 'Observações opcionais da IA para o usuário revisar (o que foi feito, detalhes relevantes).'
        }
      },
      required: ['project_path', 'task_id']
    }
  },
  {
    name: 'add_task',
    description: [
      'Cria uma nova tarefa no quadro de tarefas do projeto.',
      'A tarefa será criada na coluna pendente por padrão.',
      'O título e a descrição da tarefa devem ser informados.'
    ].join(' '),
    inputSchema: {
      type: 'object',
      properties: {
        project_path: {
          type: 'string',
          description: 'Caminho absoluto do projeto. Obrigatório.'
        },
        title: {
          type: 'string',
          description: 'Título da tarefa.'
        },
        description: {
          type: 'string',
          description: 'Descrição detalhada do que será realizado na tarefa.'
        }
      },
      required: ['project_path', 'title', 'description']
    }
  },
  {
    name: 'add_idea',
    description: [
      'Cria uma nova ideia (sugestão ou hipótese de feature) na coluna de Ideias do Kanban do projeto.',
      'O título e a descrição da ideia devem ser informados.',
      'O usuário poderá revisar e aprovar esta ideia arrastando-a para a coluna Pendente manualmente.'
    ].join(' '),
    inputSchema: {
      type: 'object',
      properties: {
        project_path: {
          type: 'string',
          description: 'Caminho absoluto do projeto. Obrigatório.'
        },
        title: {
          type: 'string',
          description: 'Título da ideia.'
        },
        description: {
          type: 'string',
          description: 'Descrição detalhada da ideia, incluindo objetivo, dores que resolve e possível abordagem técnica.'
        }
      },
      required: ['project_path', 'title', 'description']
    }
  }
]

