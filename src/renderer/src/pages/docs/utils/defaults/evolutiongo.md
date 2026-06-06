# Documentação Evolution GO

> [!NOTE]
> Caso queira a documentação completa de outros endpoints, você pode acessar a collection oficial do Postman: [Evolution GO Collection](https://www.postman.com/agenciadgcode/evolution-api/collection/nk736ze/evolution-go).

Esta documentação descreve as principais rotas da **Evolution GO** para integrações de WhatsApp de alto desempenho escritas em Go.

---

## 🔑 Autenticação e Configuração Base

*   **URL Base (`host`):** É o domínio onde o seu servidor da Evolution GO está rodando (ex: `https://api-go.meudominio.com`).
*   **Token Admin (`adminToken`):** Chave mestra configurada nas variáveis de ambiente da sua API, utilizada para rotas globais de gerenciamento de instâncias (criar, buscar ou deletar instâncias). Deve ser enviada no cabeçalho `apikey`.
*   **Token da Instância (`token`):** Chave gerada na criação da instância. Usada para todas as rotas operacionais que afetam diretamente o número conectado (enviar mensagens, apagar, download de mídias, etc.). Deve ser enviada no cabeçalho `apikey`.

### Cabeçalhos Padrão (Headers)
```http
apikey: SEU_TOKEN_AQUI
Content-Type: application/json
```

---

## 🔴 1. Gerenciamento de Instâncias e Conexão

### Criar Instância
Cria um novo container/sessão na Evolution GO.
*   **Rota:** `POST {{host}}/instance/create`
*   **Autenticação:** Usar a chave de administrador (`adminToken`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/instance/create" \
  -H "apikey: SEU_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "minha-instancia-go",
    "token": "TOKEN_SEGURO_DA_INSTANCIA"
  }'
```

---

### Buscar Todas as Instâncias
Lista todas as sessões criadas no servidor da Evolution GO.
*   **Rota:** `GET {{host}}/instance/all`
*   **Autenticação:** Usar a chave de administrador (`adminToken`) no header.

```bash
curl -X GET "https://api-go.meudominio.com/instance/all" \
  -H "apikey: SEU_ADMIN_TOKEN"
```

---

### Buscar Detalhes de Instância
Retorna informações específicas sobre uma sessão informada pelo seu ID.
*   **Rota:** `GET {{host}}/instance/info/:instanceId`
*   **Autenticação:** Usar a chave de administrador (`adminToken`) no header.

```bash
curl -X GET "https://api-go.meudominio.com/instance/info/minha-instancia-go" \
  -H "apikey: SEU_ADMIN_TOKEN"
```

---

### Deletar Instância
Exclui permanentemente a sessão informada pelo seu ID.
*   **Rota:** `DELETE {{host}}/instance/delete/:instanceId`
*   **Autenticação:** Usar a chave de administrador (`adminToken`) no header.

```bash
curl -X DELETE "https://api-go.meudominio.com/instance/delete/minha-instancia-go" \
  -H "apikey: SEU_ADMIN_TOKEN"
```

---

### Conectar Instância (Configurar Webhook e Iniciar)
Inicia a sessão, ativa a escuta e configura a rota para envio de eventos (Webhook).
*   **Rota:** `POST {{host}}/instance/connect`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/instance/connect" \
  -H "apikey: TOKEN_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "subscribe": [
      "ALL"
    ],
    "webhookUrl": "https://meuservidor.com/webhook/receber"
  }'
```

---

### Buscar Status da Conexão
Consulta se a instância está conectada ao WhatsApp.
*   **Rota:** `GET {{host}}/instance/status`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X GET "https://api-go.meudominio.com/instance/status" \
  -H "apikey: TOKEN_DA_INSTANCIA"
```

---

### Buscar QR Code
Obtém o QR Code atual para leitura da sessão.
*   **Rota:** `GET {{host}}/instance/qr`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X GET "https://api-go.meudominio.com/instance/qr" \
  -H "apikey: TOKEN_DA_INSTANCIA"
```

---

### Pairing Code (Código de Pareamento)
Gera um código de 8 dígitos para conectar digitando-o no WhatsApp do celular (útil em caso de câmera danificada).
*   **Rota:** `POST {{host}}/instance/pair`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/instance/pair" \
  -H "apikey: TOKEN_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+5511999999999"
  }'
```

---

### Desconectar Instância (Disconnect)
Desliga a conexão do WhatsApp com a API sem remover as credenciais salvas.
*   **Rota:** `POST {{host}}/instance/disconnect`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/instance/disconnect" \
  -H "apikey: TOKEN_DA_INSTANCIA"
```

---

### Reconectar Instância
Tenta reconectar o chip ao servidor da API.
*   **Rota:** `POST {{host}}/instance/reconnect`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/instance/reconnect" \
  -H "apikey: TOKEN_DA_INSTANCIA"
```

---

### Logout
Desvincula o número e apaga o pareamento no celular.
*   **Rota:** `DELETE {{host}}/instance/logout`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X DELETE "https://api-go.meudominio.com/instance/logout" \
  -H "apikey: TOKEN_DA_INSTANCIA"
```

---

## ✉️ 2. Envio de Mensagens

### Enviar Texto
Envia uma mensagem de texto simples.
*   **Rota:** `POST {{host}}/send/text`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/send/text" \
  -H "apikey: TOKEN_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "text": "Mensagem enviada via Evolution GO!",
    "delay": 1000
  }'
```

---

### Enviar Mídia via URL (ou Base64)
Envia imagens, vídeos ou documentos via link ou arquivo codificado em base64.
*   **Rota:** `POST {{host}}/send/media`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/send/media" \
  -H "apikey: TOKEN_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "url": "https://meudominio.com/documento.pdf",
    "filename": "documento.pdf",
    "type": "document",
    "caption": "Segue o arquivo em anexo",
    "delay": 1000
  }'
```
> *Nota: No campo `url`, se a string não começar com `http://` ou `https://`, a Evolution GO tentará interpretá-la e decodificá-la automaticamente como Base64.*

---

### Enviar Enquete (Poll)
Envia uma enquete com opções de respostas clicáveis.
*   **Rota:** `POST {{host}}/send/poll`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/send/poll" \
  -H "apikey: TOKEN_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "question": "Deseja confirmar a consulta?",
    "maxAnswer": 1,
    "options": [
      "Sim, confirmar",
      "Não, reagendar"
    ],
    "delay": 1000
  }'
```

---

### Enviar Botões (Whatsmeow)
Envia botões clicáveis de ação rápida ou call-to-action (URL, Copiar Código, Pix).
*   **Rota:** `POST {{host}}/send/button`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/send/button" \
  -H "apikey: TOKEN_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "title": "Aviso Importante",
    "description": "Selecione uma ação rápida",
    "footer": "Clique nos botões abaixo",
    "buttons": [
      {
        "type": "reply",
        "displayText": "Voltar ao Início",
        "id": "action_menu_start"
      },
      {
        "type": "url",
        "displayText": "Acessar Painel",
        "url": "https://meudominio.com"
      }
    ],
    "delay": 1000
  }'
```

---

### Enviar Lista
Envia um menu com múltiplas seções e linhas de opções clicáveis.
*   **Rota:** `POST {{host}}/send/list`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/send/list" \
  -H "apikey: TOKEN_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "title": "Menu Principal",
    "description": "Escolha um setor de atendimento",
    "buttonText": "Abrir Opções",
    "footerText": "Selecione para prosseguir",
    "sections": [
      {
        "title": "Setores",
        "rows": [
          {
            "title": "Suporte Técnico",
            "description": "Fale com nossos técnicos",
            "rowId": "suporte_01"
          },
          {
            "title": "Faturamento",
            "description": "Segunda via de boletos e notas",
            "rowId": "financeiro_02"
          }
        ]
      }
    ],
    "delay": 1000
  }'
```

---

### Enviar Carrossel
Envia uma mensagem de carrossel contendo múltiplos cards com imagens e botões dinâmicos (excelente para catálogos).
*   **Rota:** `POST {{host}}/send/carousel`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/send/carousel" \
  -H "apikey: TOKEN_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "text": "Veja as ofertas de hoje:",
    "cards": [
      {
        "image": "https://meudominio.com/imagens/produto1.jpg",
        "text": "Produto Premium #1",
        "footer": "R$ 99,90",
        "buttons": [
          {
            "type": "reply",
            "displayText": "Comprar Agora",
            "id": "buy_prod_1"
          }
        ]
      },
      {
        "image": "https://meudominio.com/imagens/produto2.jpg",
        "text": "Produto Standard #2",
        "footer": "R$ 49,90",
        "buttons": [
          {
            "type": "reply",
            "displayText": "Comprar Agora",
            "id": "buy_prod_2"
          }
        ]
      }
    ],
    "delay": 1000
  }'
```

---

## 💬 3. Validação e Perfis de Usuários

### Verificar se Número Existe (Check User)
Consulta se um ou mais números possuem conta do WhatsApp ativa.
*   **Rota:** `POST {{host}}/user/check`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/user/check" \
  -H "apikey: TOKEN_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "number": [
      "5511999999999"
    ]
  }'
```

---

### Buscar Foto de Perfil (Get Avatar)
Recupera a URL pública da foto de perfil (avatar) do contato.
*   **Rota:** `POST {{host}}/user/avatar`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/user/avatar" \
  -H "apikey: TOKEN_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "preview": false
  }'
```

---

## 📁 4. Mensagens e Mídias Recebidas

### Download de Mídia Recebida
Baixa e extrai dados brutos de mensagens de mídia recebidas que estão nas estruturas do Whatsmeow.
*   **Rota:** `POST {{host}}/message/downloadmedia`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/message/downloadmedia" \
  -H "apikey: TOKEN_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "imageMessage": {
        "URL": "https://mmg.whatsapp.net/o1/v/...",
        "directPath": "/o1/v/...",
        "mediaKey": "wbFx7x7ou9z3BKjCN8lmf...",
        "mimetype": "image/jpeg",
        "fileEncSHA256": "PBHUgEC4XUQHO...",
        "fileSHA256": "1QUQbJE44Xr...",
        "fileLength": 13596
      }
    }
  }'
```

---

### Deletar Mensagem (Apagar para Todos)
Exclui uma mensagem enviada pela conta no chat.
*   **Rota:** `POST {{host}}/message/delete`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/message/delete" \
  -H "apikey: TOKEN_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "chat": "5511999999999@s.whatsapp.net",
    "messageId": "3EB0078FCA3E48FC70D761"
  }'
```

---

## 👥 5. Gestão de Grupos

### Criar Grupo
Gera um novo grupo contendo membros convidados.
*   **Rota:** `POST {{host}}/group/create`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/group/create" \
  -H "apikey: TOKEN_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "groupName": "Grupo Whatsmeow",
    "participants": [
      "5511988888888"
    ]
  }'
```

---

### Alterar Participante (Membro/Admin)
Gerencia a filiação e cargos de membros em um grupo ativo.
*   **Rota:** `POST {{host}}/group/participant`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/group/participant" \
  -H "apikey: TOKEN_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "groupJid": "120363332413160732@g.us",
    "participants": [
      "5511988888888"
    ],
    "action": "promote"
  }'
```
> *Nota: Use no campo `action` as opções: `add` (adicionar), `remove` (remover), `promote` (admin) ou `demote` (rebaixar).*

---

### Obter Link de Convite do Grupo
Retorna o link público para entrada rápida no grupo.
*   **Rota:** `POST {{host}}/group/invitelink`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X POST "https://api-go.meudominio.com/group/invitelink" \
  -H "apikey: TOKEN_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "groupJid": "120363281584341832@g.us"
  }'
```

---

### Listar Grupos Ativos
Obtém todos os dados resumidos dos grupos do chip conectado.
*   **Rota:** `GET {{host}}/group/list`
*   **Autenticação:** Usar o token da própria instância (`token`) no header.

```bash
curl -X GET "https://api-go.meudominio.com/group/list" \
  -H "apikey: TOKEN_DA_INSTANCIA"
```
