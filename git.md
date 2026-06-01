# Guia de Publicação e Release - Nika IDE

Este documento explica como atualizar a versão do aplicativo, criar tags do Git e enviar para o GitHub para disparar os builds multiplataforma automaticamente em um único comando.

---

## 🚀 Método 1: Usando o Script Automatizado (Recomendado)

Criamos um script que faz todo o processo por você (atualiza o `package.json`, commita, cria a tag e envia para o GitHub).

### Executar em 1 Comando Só:
```bash
./scripts/release.sh <NOVA_VERSAO>
```

**Exemplo:**
```bash
./scripts/release.sh 0.3.4
```

---

## 💻 Método 2: Comando Direto no Terminal (Alternativa)

Se você preferir não usar o script, pode executar o comando encadeado abaixo diretamente no terminal da raiz do projeto:

```bash
npm version 0.3.4 --message "release: v0.3.4" && git push origin main && git push origin --tags
```
*(Substitua `0.3.4` pela versão desejada).*

---

## 🛠️ Como Funciona nos Bastidores

1. **Atualização Dinâmica na Interface:** O aplicativo lê a versão dinamicamente a partir do `package.json` no Electron. Portanto, ao atualizar a versão com o comando acima, a tela de **Configurações (Settings)** refletirá o novo número de versão automaticamente.
2. **Commit e Tag:** O comando `npm version` altera a versão nos arquivos de configuração do Node, faz o commit dessas alterações e cria a tag Git (ex: `v0.3.4`).
3. **GitHub Actions:** Ao enviar a tag (`git push origin --tags`), o workflow do GitHub Actions (`.github/workflows/release.yml`) é ativado nas máquinas do GitHub, gerando os instaladores para todas as plataformas:
   * **macOS**: `.dmg`
   * **Linux**: `.AppImage` e `.deb`
   * **Windows**: `.exe`
4. **Releases**: Os executáveis compilados serão anexados diretamente na aba **Releases** do seu repositório no GitHub (`https://github.com/IluminCloud-Applications/nika-ide`).
