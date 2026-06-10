# AI System Instructions (Antigravity CLI)

Você é um programador AI sênior trabalhando neste projeto. Siga rigorosamente as regras abaixo:

## Estrutura do Projeto
- **Frontend**: React + Tailwind + Remix Icons v4.9.1 (ri-* classes) (na pasta `frontend/`)
- **Backend**: Python FastAPI (na pasta `backend/`)
- **Database / Auth**: PostgreSQL + SQLAlchemy (com setup em `backend/database/core.py` e `backend/database/models.py`). A autenticação JWT está em `backend/auth/` e as rotas em `backend/api/auth.py`.
- **ShadCN**: Todos os componentes estão pré-instalados na pasta `frontend/src/components/ui/`. NÃO utilize comandos de instalação para novos componentes do ShadCN; em vez disso, faça a importação do arquivo já existente.

## Tipo de Projeto: White Label / Self-Hosted (Instância Única)
Este é um template de **instância única** (como WordPress, n8n ou Mautic). Regras específicas:
- **Usuário único**: NÃO existe cadastro público. A única conta é criada na tela de **Setup** (`frontend/src/pages/setup/` + `backend/api/setup.py`) no primeiro acesso. O endpoint `POST /api/setup` é bloqueado depois que o admin existe.
- **Fluxo de acesso**: `frontend/src/App.jsx` consulta `GET /api/setup/status`. Sem setup → tela de Setup. Com setup e sem login → Login. Logado → Dashboard.
- **Mesma origem (sem CORS, sem ENV de frontend)**: o frontend SEMPRE chama o backend por caminhos relativos `/api/...`. NÃO use `VITE_API_URL` e NÃO adicione middleware de CORS. Em dev o Vite faz proxy de `/api` para o backend; em produção o backend serve o frontend.
- **Imagem única**: o `Dockerfile` na raiz é multi-stage (builda o frontend e o serve estaticamente via FastAPI em `backend/static`). Resultado: UMA imagem com frontend em `/` e API em `/api`.

## Diretrizes de Código
1. **Regra de 200 linhas**: Nenhum arquivo criado ou modificado deve ultrapassar 200 linhas de código.
2. **Organização por pastas**: Separe componentes e lógicas em pastas com nomes idênticos aos das páginas (ex: `pages/login/index.jsx`, `pages/login/form.jsx`, `api/auth.py`).
3. **Comunicação Frontend ↔ Backend (sem CORS)**: 
   - O Frontend chama o Backend SEMPRE por caminhos relativos `/api/...` (ex.: `fetch('/api/auth/login')`). NÃO use `VITE_API_URL` nem URLs absolutas.
   - O proxy de `/api` está configurado em `frontend/vite.config.js` para o dev. NÃO adicione CORS no backend.
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
