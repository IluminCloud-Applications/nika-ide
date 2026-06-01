---
name: tarefas
description: Skill para a IA obter e executar tarefas do Kanban do Nika IDE. Use sempre que precisar saber o que fazer ou quando terminar uma implementação.
user-invocable: false
---

# Skill de Tarefas — Nika IDE

Esta skill define como a IA deve interagir com o sistema de tarefas do Nika IDE via MCP.

## Ferramentas disponíveis (MCP: `nika-tasks`)

| Ferramenta | O que faz |
|---|---|
| `get_next_task` | Obtém a próxima tarefa pendente e a move automaticamente para **Executando** |
| `move_to_review` | Move a tarefa concluída para **Revisão** e faz git commit automático |
| `add_task` | Cria uma nova tarefa no quadro (coluna pendente) |

---

## Fluxo obrigatório

### 1. Obter uma tarefa

Sempre comece chamando `get_next_task` com o `project_path`:

```
get_next_task({ project_path: "/caminho/absoluto/do/projeto" })
```

> A tarefa é automaticamente movida para **Executando** no Kanban assim que você a obtém.
> Isso evita que outra IA pegue a mesma tarefa ao mesmo tempo.

### 2. Executar a tarefa

- Leia o `title` e a `description` com atenção.
- Analise o que precisa ser feito **antes** de escrever qualquer código.
- Execute a implementação completa.
- Se a tarefa foi **rejeitada**, o campo `rejection_reason` estará preenchido — corrija exatamente o que foi apontado.

### 3. Mover para revisão

Quando a implementação estiver **100% concluída**, chame:

```
move_to_review({
  project_path: "/caminho/absoluto/do/projeto",
  task_id: <ID_DA_TAREFA>,
  ai_notes: "Resumo do que foi implementado, arquivos modificados, decisões tomadas..."
})
```

> Um git commit automático será feito com o título da tarefa.
> O usuário revisará e aprovará ou rejeitará a implementação.

### 4. Continuar o ciclo

Após mover para revisão, chame `get_next_task` novamente para obter a próxima tarefa pendente.

---

## Regras importantes

- **Nunca** chame `move_to_review` antes de terminar completamente a implementação.
- **Nunca** modifique tarefas que não estejam em `pending` ou `executing`.
- Sempre inclua `ai_notes` descritivas para facilitar a revisão do usuário.
- Se não houver tarefas pendentes, aguarde — não invente tarefas.
- Trabalhe **apenas no projeto especificado** pelo `project_path`.

---

## Exemplo de ai_notes bem escritas

```
Implementei a tela de login conforme solicitado:

- Criado: src/pages/login/index.tsx (formulário principal)
- Criado: src/pages/login/form.tsx (campos de email/senha)
- Criado: src/pages/login/components/modalForgot.tsx (modal esqueci senha)
- Atualizado: src/App.tsx (adicionada rota /login)

Utilizei os componentes shadcn/ui: Input, Button, Card.
A validação é feita com react-hook-form + zod.
```

---

## Visibilidade no Kanban

| Coluna | Significado |
|---|---|
| **Ideias** | Backlog de ideias — sem acesso da IA |
| **Pendentes** | Tarefas prontas para a IA executar |
| **Executando** | IA trabalhando (você está aqui!) |
| **Revisão** | Aguardando aprovação do usuário |
| **Arquivadas** | Concluídas e aprovadas |
