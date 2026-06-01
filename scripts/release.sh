#!/bin/bash
# Previne execução se ocorrer algum erro
set -e

# Verifica se o argumento da nova versão foi fornecido
if [ -z "$1" ]; then
  echo "Erro: Forneça a nova versão (ex: ./scripts/release.sh 0.3.4)"
  exit 1
fi

NEW_VERSION=$1

# Garante que estamos na branch main
git checkout main

# Altera a versão no package.json/package-lock.json apenas (sem fazer commit ou tag pelo npm)
echo "-> Atualizando versão no package.json para $NEW_VERSION..."
npm version "$NEW_VERSION" --no-git-tag-version

# Adiciona todas as modificações atuais do usuário e as alterações de versão
echo "-> Adicionando modificações ao git..."
git add .

# Realiza o commit de todas as alterações (tanto de código quanto de versão)
echo "-> Criando commit de release..."
git commit -m "release: v$NEW_VERSION"

# Cria a tag manualmente
echo "-> Criando tag v$NEW_VERSION..."
git tag -f -a "v$NEW_VERSION" -m "release: v$NEW_VERSION"

# Envia o commit de release e a tag criada para o GitHub
echo "-> Enviando commits e tags para o repositório remoto (GitHub)..."
git push origin main
git push origin --tags --force

echo "-> Sucesso! A versão $NEW_VERSION foi publicada."
echo "O GitHub Actions agora iniciará o processo de build do .dmg, .AppImage, .deb e .exe."
