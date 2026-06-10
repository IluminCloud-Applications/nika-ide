# AI System Instructions (Claude Code)

Você é um programador AI sênior trabalhando neste projeto. Siga rigorosamente as regras abaixo:

## Tipo de Projeto: Automações & Agentes de IA (Foco no Backend)
Template **focado no backend**. O frontend é apenas uma página de status mínima; o trabalho real acontece em Python.

## Estrutura do Projeto
- **Backend (principal)**: Python FastAPI (na pasta `backend/`). É aqui que você trabalha.
  - `backend/agents/` → base de IA com **LangChain + Google Gemini**: `llm.py` (init lazy do modelo via `@lru_cache` + `ai_enabled()`), `prompts.py` (prompts do sistema e montagem de mensagens em tuplas `(role, content)`), `service.py` (`chat_reply` + exceção `AIUnavailable`).
  - `backend/automations/` → `scheduler.py` com **APScheduler** (`AsyncIOScheduler`). Registre seus jobs com `scheduler.add_job(...)` (interval/cron).
  - `backend/api/` → rotas. `agent.py` expõe `POST /api/agent/chat` (usa `agents/service.py`, com fallback se a IA estiver offline).
  - `backend/redis_client.py` → cliente Redis lazy (`get_redis()`) para cache, filas e estado.
  - **NÃO há banco de dados nem autenticação** neste template. Adicione apenas se realmente precisar.
- **Frontend (mínimo)**: React + Tailwind (na pasta `frontend/`), apenas a página de status em `frontend/src/App.jsx`. Mantenha simples.
- **ShadCN**: Componentes pré-instalados em `frontend/src/components/ui/`. NÃO instale novos; importe os existentes.

## Padrão de IA (LangChain)
- A IA NUNCA recebe chave no frontend; o backend é o proxy. Configure `GEMINI_API_KEY`/`GOOGLE_API_KEY` no `.env`.
- Sempre proteja chamadas de LLM com `try/except` e tenha um fallback amigável (`ai_enabled()` deve degradar suavemente).
- Estruture prompts em `agents/prompts.py` via tuplas `(role, content)`.

## Diretrizes de Código
1. **Regra de 200 linhas**: Nenhum arquivo criado ou modificado deve ultrapassar 200 linhas de código.
2. **Organização por pastas**: Separe componentes e lógicas em pastas com nomes idênticos aos das páginas (ex: `pages/login/index.jsx`, `pages/login/form.jsx`, `api/auth.py`).
3. **Comunicação Frontend ↔ Backend (sem CORS)**: 
   - O Frontend chama o Backend por caminhos relativos `/api/...`. NÃO use `VITE_API_URL`. O proxy de `/api` está em `frontend/vite.config.js`. NÃO adicione CORS.
   - Em produção tudo roda em UMA imagem Docker (`Dockerfile` na raiz, multi-stage): o backend serve o frontend estático em `backend/static`.
4. **Sem Duplicações e Foco em Reuso**: Promova reuso criando componentes globais ou locais organizados. Priorize sempre criar ou reutilizar componentes globais (como wrappers de modal, botões ou inputs comuns) em vez de repetir estruturas de layout locais nas páginas. Por exemplo, use o wrapper global de modal em vez de recriar o backdrop/container em cada tela. Assim, mudanças estruturais ou visuais (ex: limitar altura dos modais a 90vh, alterar o radius das bordas, etc.) são feitas centralizadamente no componente correspondente, atualizando o aplicativo inteiro globalmente.

## Design System / Tema (OBRIGATÓRIO)
O arquivo `frontend/src/index.css` é a **fonte única de verdade** do design (tokens de cor e raio) e é controlado pelo Estúdio de Design. Para que a troca de tema funcione, siga estas regras à risca:

- **NUNCA** use cores fixas em classes: nada de `bg-[#09090b]`, `bg-black`, `bg-white`, `text-zinc-400`, `text-white`, `border-zinc-800`, hex/rgb arbitrários ou `dark:` com cores cruas.
- **SEMPRE** use os tokens semânticos do design system:
   - Fundos/superfícies: `bg-background`, `bg-card`, `bg-popover`, `bg-muted`, `bg-secondary`, `bg-accent`, `bg-primary`, `bg-destructive`.
   - Textos: `text-foreground`, `text-muted-foreground`, `text-card-foreground`, `text-primary`, `text-primary-foreground`, `text-secondary-foreground`, `text-destructive-foreground`.
   - Bordas/inputs/foco: `border-border`, `border-input`, `ring-ring`.
   - Raio: `rounded-lg/md/sm` (derivam de `--radius`).
   - Opacidade quando precisar de variação: use o modificador do token (ex.: `bg-primary/10`, `text-muted-foreground/70`), nunca uma cor nova.
- **NÃO edite** `frontend/src/index.css` — ele é imutável para a IA. Apenas crie/edite componentes usando os tokens acima.
- Componentes ShadCN em `frontend/src/components/ui/` já consomem esses tokens; prefira reaproveitá-los.

## Fluxo de Desenvolvimento e Gestão de Tarefas (OBRIGATÓRIO)
1. **NUNCA implemente ou crie código sem planejar e registrar tarefas**: Toda criação de feature, refatoração ou correção deve ser planejada e dividida em tarefas menores (micro-tarefas) primeiro.
2. **Registro de Tarefas**: Antes de tocar no código, use a tool `add_task` para criar cada tarefa separadamente no Kanban do projeto. Organize o trabalho em etapas claras para que o usuário acompanhe o progresso detalhadamente.
3. **Fluxo de Execução**:
   - Sempre chame a tool `get_next_task` antes de iniciar a implementação (ela trará os detalhes e moverá a tarefa para a coluna 'executing').
   - Após terminar a implementação e testes daquela tarefa específica (garantindo que não passe de 200 linhas por arquivo), chame a tool `move_to_review` enviando um resumo do que foi feito no campo `ai_notes`.
   - Só depois disso chame `get_next_task` para pegar a próxima tarefa pendente.
4. **Ideias e Sugestões**: Se você ou o usuário tiverem ideias, hipóteses ou sugestões de melhorias durante a conversa, utilize a tool `add_idea` para adicioná-las diretamente na coluna de Ideias do Kanban. O usuário poderá revisá-las e aprová-las arrastando-as manualmente para a coluna Pendente posteriormente.
