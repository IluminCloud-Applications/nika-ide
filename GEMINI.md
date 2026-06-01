Você é um desenvolvedor de Apps para sistemas Windows/Linux/MacOS, criando um aplicativo em Electron, com 100% do código no computador do usuário (não haverá servidor/backend).

# Aplicativo

Nome: Nika IDE
Porque Nika IDE: Inspirado em One Piece, a ideia de liberdade para criar do Deus do Sol, criatividade, inspiração, facilidade, simplicidade, livrar do antigo modo escravizado (como era com programadores) para algo livre (com inteligência artificial).

A ideia é simples: Um aplicativo similar ao VSCode/Lovable/Cursor porém, extremamente low code, com códigos prefixos para construção rápida.

Por exemplo, ao invés de construir componentes, iremos baixar todos os componentes do shadcn e deixar no código, e a AI ao invés de criar o código do componente, ele vai apenas importar o componente já existente do shadcn.

Além de a interface ser visual/editor para visualizar o que estamos criando em tempo real, e separar o frontend/backend, frontend em React e Backend em python.

E também terá recursos como prompts prontos, instructions também, e agentes.

Vou dizer o que está na minha mente abaixo para entender, mas conforme formos criando pode ser modificado.

1. o usuário instala o app, e inicia o tutorial básico de bem vindo.
2. o usuário clica em um + e clica em criar novo projeto e seleciona o nome, descrição, icon se quiser + pasta do projeto, talvez até uma cor para o projeto, ou o icon ser uma logo, ele faz o upload da image selecionando internamente, talvez seja mais interessante, e depois podemos até copiar para frontend/public/favicon.png/webp e etc que seria o favicon/logo do app.
3. ao confirmar o projeto, ele vai "fazer uma cópia" da estrutura ideal + system instructions e etc para o projeto, dentro da pasta que ele escolheu já vamos fazer um build da estrutura ideal nossa.
4. o usuário vai abrir o terminal internamente (quero 2 buttons, 1 para abrir o Claude e outro para abrir o Gemini CLI, quando ele clicar já abre o terminal na lateral, como se fosse dropdown, não terá agente interno, será utilizado via terminal dentro da pasta do projeto existente, é só abrir o terminal com o comando claude por exemplo. além disso, precisa ter uma boa organização de terminal com nomeclação, o usuário poder renomear, visualizar, e ser tipo uma drawer ou sidebar, ele clica abre, depois pode até minimizar, bem similar a uma sidebar, porém, essa sidebar de terminal seria na direita e não na esquerda).
5. Precisamos também visualizar na esquerda a pasta/arquivo que está sendo criado, e ao clicar em cima, abrir o modal com as informações do arquivo, bem similar ao que acontece com VSCode, basta lembrar que vão ter 2 pastas, frontend e backend.
6. o backend será docker, pois pode necessitar instalar o Redis/PostgreSQL e etc. o frontend javascript (inicie com npm run dev e mostre a URL para o usuário ver).
7. precisa ser visual, ou seja, o usuário constroi pedindo para a AI, mas já conforme vai modificando o browser vai atualizar porque vai tá no localhost npm run dev.
8. deve ter um botão de iniciar que vai fazer o run build, vai npm run dev, o backend docker compose up --build e etc. 
9. ter alguma opção de agente, design, backend, frontend, banco de dados e etc. E cada vez que alterar, vai atualizar o arquivo GEMINI.md e CLAUDE.md (arquivos que o terminal aberto do claude code ou gemini cli utilizam para ser sua system instructions, ou seja, para a gente dizer a system instructions a ser utilizada, basta modificar esse arquivo GEMINI.md e CLAUDE.md)

# Design
Bonito, dark, compacto, profissional, minimalista. Use Lucide Icons + Tailwind + ShadCN ou o que precisar.
Lembre-se, backend que a AI vai construir é python, e frontend em javascript.
Talvez seja interessante ter um env em cada, o frontend apontando para onde é o backend que deve fazer os requests, e o backend apontando para onde deve receber o frontend (CORS), lembrando que isso é no instructions.


# Organização
Faça uma organização no código com os arquivos, pastas e subpastas como sugerido a seguir.

Preciso que cada arquivo tenha no **máximo 200 linhas de código** e que seja com bons nomes e bem organizado.

Exemplo de uma boa organização para uma página de login. 

## Exemplo
### Frontend
Se o app for frontend (React) seria mais ou menos assim dentro de pages/
pages/login/
pages/login/index.tsx
pages/login/form.tsx
pages/login/components/modalForgot.tsx
etc.

A ideia é, separar os arquivos de acordo ao que cada um faz, ao invés de ser apenas 1 para a página inteira, e também a slug da página ser o mesmo nome da pasta, que nesse caso é login.

### Backend
exemplo no backend (normalmente Python), uma API para a página de login seria mais ou menos assim:
api/
api/login/ # mesmo nome da slug da página para identificar que as APIs daqui são usadas na página login
api/login/get_user.py # api para obter usuários
api/login/forgot_password.py # api para ativar a lógica de esqueci a senha, seja enviando email ou outro tipo definido pelo dev.

Esse é só um exemplo, nem toda página de login tem essas APIs, mas é só para entender que cada arquivo é bem separado e organizado de uma maneira fácil de encontrar pra dar manutenção no código.

# Regras
- Arquivos com bons nomes para identificar (exemplo, arquivos que se eu der um tree sei exatamente o que vai ter no código, exemplo modalLogin.tsx sei que é o modal de login).
- Organizado com pastas e subpastas.
- Máximo 200 linhas de código por arquivo.
- Não precisa documentação.
- Não execute o app.
- Agora o GEMINI CLI não é mais Gemini CLI, é Antigravity CLI, o Google atualizou recentemente e você não tem esse contexto, mas é basicamente ao invés de Gemini CLI usar Antigravity CLI, e ao invés de utilizar "gemini" para iniciar, usa "agy", exemplo "agy --dangerously-skip-permissions" para iniciar pulando permissões.