# Documentação Evolution API - v2.3.*

> [!NOTE]
> Caso queira a documentação completa de outros endpoints, você pode acessar a collection oficial do Postman: [Evolution API v2.3.x Collection](https://www.postman.com/agenciadgcode/evolution-api/collection/nm0wqgt/evolution-api-v2-3).

Esta documentação descreve as principais rotas da **Evolution API (v2.3.*)** para integrações e automações de WhatsApp.

---

## 🔑 Autenticação e Configuração Base

*   **URL Base (`baseUrl`):** É o domínio onde a sua Evolution API está hospedada (ex: `https://api.meudominio.com`).
*   **API Key Global (`globalApikey`):** Chave mestra configurada nas variáveis de ambiente da sua API, utilizada para gerenciar instâncias (criar e deletar). Deve ser enviada no cabeçalho `apikey`.
*   **API Key da Instância (`apikey`):** Chave específica de cada instância (gerada ao criar a instância ou definida manualmente). Usada para gerenciar as rotas de envio de mensagens e chats daquela instância específica. Deve ser enviada no cabeçalho `apikey`.

### Cabeçalhos Padrão (Headers)
```http
apikey: SUAPICHAVE
Content-Type: application/json
```

---

## 🔴 1. Gerenciamento de Instâncias e Conexão

### Criar Instância
Cria uma nova sessão/instância do WhatsApp na API.
*   **Rota:** `POST {{baseUrl}}/instance/create`
*   **Autenticação:** Usar a chave mestra (`globalApikey`) no header.

```bash
curl -X POST "https://api.meudominio.com/instance/create" \
  -H "apikey: SEU_GLOBAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "minha-instancia",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }'
```

---

### Conectar Instância (Gerar QR Code)
Retorna o QR Code ativo em Base64 para escaneamento.
*   **Rota:** `GET {{baseUrl}}/instance/connect/{{instance}}`
*   **Autenticação:** Usar a chave da instância ou chave global no header.

```bash
curl -X GET "https://api.meudominio.com/instance/connect/minha-instancia" \
  -H "apikey: CHAVE_DA_INSTANCIA"
```

---

### Estado da Conexão
Consulta o status atual da conexão (ex: `open`, `connecting`, `close`).
*   **Rota:** `GET {{baseUrl}}/instance/connectionState/{{instance}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X GET "https://api.meudominio.com/instance/connectionState/minha-instancia" \
  -H "apikey: CHAVE_DA_INSTANCIA"
```

---

### Reiniciar Instância
Força a reinicialização da sessão em caso de travamentos.
*   **Rota:** `POST {{baseUrl}}/instance/restart/{{instance}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X POST "https://api.meudominio.com/instance/restart/minha-instancia" \
  -H "apikey: CHAVE_DA_INSTANCIA"
```

---

### Deslogar Instância
Desconecta a conta do WhatsApp do celular mantendo a sessão na API.
*   **Rota:** `DELETE {{baseUrl}}/instance/logout/{{instance}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X DELETE "https://api.meudominio.com/instance/logout/minha-instancia" \
  -H "apikey: CHAVE_DA_INSTANCIA"
```

---

### Deletar Instância
Remove completamente a instância e seus arquivos do servidor.
*   **Rota:** `DELETE {{baseUrl}}/instance/delete/{{instance}}`
*   **Autenticação:** Usar a chave mestra (`globalApikey`) no header.

```bash
curl -X DELETE "https://api.meudominio.com/instance/delete/minha-instancia" \
  -H "apikey: SEU_GLOBAL_API_KEY"
```

---

## ✉️ 2. Envio de Mensagens e Mídias

### Enviar Texto
Envia uma mensagem de texto simples para um número ou grupo.
*   **Rota:** `POST {{baseUrl}}/message/sendText/{{instance}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X POST "https://api.meudominio.com/message/sendText/minha-instancia" \
  -H "apikey: CHAVE_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "text": "Olá! Esta é uma mensagem de teste.",
    "delay": 1200
  }'
```

---

### Enviar Mídia via URL
Envia imagens, PDFs, vídeos ou documentos apontando para um link direto público.
*   **Rota:** `POST {{baseUrl}}/message/sendMedia/{{instance}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X POST "https://api.meudominio.com/message/sendMedia/minha-instancia" \
  -H "apikey: CHAVE_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "mediatype": "image",
    "mimetype": "image/png",
    "caption": "Legenda da imagem opcional",
    "media": "https://meudominio.com/imagens/foto.png",
    "fileName": "foto.png"
  }'
```

---

### Enviar Mídia via Arquivo (Form Data)
Faz o upload físico de um arquivo local e o envia como mensagem de mídia.
*   **Rota:** `POST {{baseUrl}}/message/sendMedia/{{instance}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X POST "https://api.meudominio.com/message/sendMedia/minha-instancia" \
  -H "apikey: CHAVE_DA_INSTANCIA" \
  -F "number=5511999999999" \
  -F "mediatype=image" \
  -F "mimetype=image/png" \
  -F "file=@/caminho/do/seu/arquivo.png" \
  -F "fileName=arquivo.png" \
  -F "caption=Envio via upload de arquivo"
```

---

### Enviar Áudio Gravado (O Whatsapp Opus)
Envia um áudio simulando que ele foi gravado no microfone na hora (microfone azul e status "gravando").
*   **Rota:** `POST {{baseUrl}}/message/sendWhatsAppAudio/{{instance}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X POST "https://api.meudominio.com/message/sendWhatsAppAudio/minha-instancia" \
  -H "apikey: CHAVE_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "audio": "https://meudominio.com/audios/mensagem.mp3",
    "delay": 1200
  }'
```

---

### Enviar Enquete (Poll)
Envia uma pergunta interativa com múltiplas opções para votação.
*   **Rota:** `POST {{baseUrl}}/message/sendPoll/{{instance}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X POST "https://api.meudominio.com/message/sendPoll/minha-instancia" \
  -H "apikey: CHAVE_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "name": "Qual setor deseja falar?",
    "selectableCount": 1,
    "values": [
      "Suporte Técnico",
      "Financeiro",
      "Comercial"
    ]
  }'
```

---

### Fake Call (Ligação Falsa)
Inicia uma ligação de voz falsa de duração específica para chamar atenção do usuário no celular.
*   **Rota:** `POST {{baseUrl}}/call/offer/{{instance}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X POST "https://api.meudominio.com/call/offer/minha-instancia" \
  -H "apikey: CHAVE_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "isVideo": false,
    "callDuration": 3
  }'
```

---

## 💬 3. Chats e Validação

### Verificar se Número é WhatsApp (Check Number)
Verifica se uma lista de números possui contas do WhatsApp ativas.
*   **Rota:** `POST {{baseUrl}}/chat/whatsappNumbers/{{instance}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X POST "https://api.meudominio.com/chat/whatsappNumbers/minha-instancia" \
  -H "apikey: CHAVE_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "numbers": [
      "5511999999999",
      "5511988888888"
    ]
  }'
```

---

### Buscar Foto de Perfil (Avatar URL)
Retorna o link da foto de perfil pública do número.
*   **Rota:** `POST {{baseUrl}}/chat/fetchProfilePictureUrl/{{instance}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X POST "https://api.meudominio.com/chat/fetchProfilePictureUrl/minha-instancia" \
  -H "apikey: CHAVE_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999"
  }'
```

---

### Obter Base64 de Mídia Recebida
Extrai o arquivo em base64 diretamente a partir do ID de uma mensagem de mídia recebida no banco de dados.
*   **Rota:** `POST {{baseUrl}}/chat/getBase64FromMediaMessage/{{instance}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X POST "https://api.meudominio.com/chat/getBase64FromMediaMessage/minha-instancia" \
  -H "apikey: CHAVE_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "key": {
        "id": "3EB0F4A1F841F02958FB74"
      }
    },
    "convertToMp4": false
  }'
```

---

### Deletar Mensagem (Apagar para Todos)
Apaga uma mensagem enviada anteriormente usando o ID da mensagem.
*   **Rota:** `DELETE {{baseUrl}}/chat/deleteMessageForEveryone/{{instance}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X DELETE "https://api.meudominio.com/chat/deleteMessageForEveryone/minha-instancia" \
  -H "apikey: CHAVE_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "3EB00E86C964FE604AF39A",
    "remoteJid": "5511999999999@s.whatsapp.net",
    "fromMe": true
  }'
```

---

## 👥 4. Gestão de Grupos

### Criar Grupo
Cria um novo grupo de WhatsApp adicionando membros.
*   **Rota:** `POST {{baseUrl}}/group/create/{{instance}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X POST "https://api.meudominio.com/group/create/minha-instancia" \
  -H "apikey: CHAVE_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Grupo de Teste",
    "description": "Descrição do grupo opcional",
    "participants": [
      "5511999999999",
      "5511988888888"
    ]
  }'
```

---

### Alterar Participante (Adicionar/Remover/Promover)
Modifica as permissões ou membros dentro de um grupo.
*   **Rota:** `POST {{baseUrl}}/group/updateParticipant/{{instance}}?groupJid={{groupJid}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X POST "https://api.meudominio.com/group/updateParticipant/minha-instancia?groupJid=120363332413160732@g.us" \
  -H "apikey: CHAVE_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "add", 
    "participants": [
      "5511977777777"
    ]
  }'
```
> *Nota: No campo `action`, utilize: `add` (adicionar), `remove` (remover), `promote` (tornar administrador) ou `demote` (rebaixar a membro comum).*

---

### Buscar Link de Convite do Grupo
Obtém o link de convite oficial (`https://chat.whatsapp.com/...`) de um grupo administrado pela conta.
*   **Rota:** `GET {{baseUrl}}/group/inviteCode/{{instance}}?groupJid={{groupJid}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X GET "https://api.meudominio.com/group/inviteCode/minha-instancia?groupJid=120363332413160732@g.us" \
  -H "apikey: CHAVE_DA_INSTANCIA"
```

---

### Listar Todos os Grupos
Lista os dados e JIDs de todos os grupos em que a conta atual participa.
*   **Rota:** `GET {{baseUrl}}/group/fetchAllGroups/{{instance}}?getParticipants=false`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X GET "https://api.meudominio.com/group/fetchAllGroups/minha-instancia?getParticipants=false" \
  -H "apikey: CHAVE_DA_INSTANCIA"
```

---

## 🔗 5. Configuração de Recebimento (Webhook)

### Definir Webhook (Set Webhook)
Configura a URL de escuta (Webhook) para envio de eventos da instância.
*   **Rota:** `POST {{baseUrl}}/webhook/set/{{instance}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X POST "https://api.meudominio.com/webhook/set/minha-instancia" \
  -H "apikey: CHAVE_DA_INSTANCIA" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": {
      "enabled": true,
      "url": "https://meuservidor.com/webhook/receber",
      "headers": {
        "Content-Type": "application/json"
      },
      "byEvents": false,
      "base64": false,
      "events": [
        "MESSAGES_UPSERT",
        "CONNECTION_UPDATE"
      ]
    }
  }'
```

---

### Buscar Webhook (Find Webhook)
Consulta as configurações do webhook configuradas atualmente para a instância.
*   **Rota:** `GET {{baseUrl}}/webhook/find/{{instance}}`
*   **Autenticação:** Usar a chave da instância no header.

```bash
curl -X GET "https://api.meudominio.com/webhook/find/minha-instancia" \
  -H "apikey: CHAVE_DA_INSTANCIA"
```
