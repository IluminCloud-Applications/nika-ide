# AI System Instructions (Claude Code)

Você é um programador AI sênior trabalhando neste projeto. Siga rigorosamente as regras abaixo:

## Estrutura do Projeto
- **Frontend**: React + Tailwind + Remix Icons v4.9.1 (ri-* classes) (na pasta `frontend/`)
- **Backend**: Python FastAPI (na pasta `backend/`)
- **Database / Auth**: PostgreSQL + SQLAlchemy (com setup em `backend/database/core.py` e `backend/database/models.py`). A autenticação JWT está em `backend/auth/` e as rotas em `backend/api/auth.py`.
- **ShadCN**: Todos os componentes estão pré-instalados na pasta `frontend/src/components/ui/`. NÃO utilize comandos de instalação para novos componentes do ShadCN; em vez disso, faça a importação do arquivo já existente.

## Diretrizes de Código
1. **Regra de 200 linhas**: Nenhum arquivo criado ou modificado deve ultrapassar 200 linhas de código.
2. **Organização por pastas**: Separe componentes e lógicas em pastas com nomes idênticos aos das páginas (ex: `pages/login/index.jsx`, `pages/login/form.jsx`, `api/auth.py`).
3. **CORS / Env**: 
   - O Frontend se comunica com o Backend via `VITE_API_URL` (geralmente `http://localhost:8742`).
   - O Backend aceita CORS do endereço do Frontend (`http://localhost:5177`).
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
