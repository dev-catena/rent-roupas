#!/bin/bash

# Script para copiar criar-admin-producao.sh para o servidor
# Execute este script no seu COMPUTADOR LOCAL

SERVER="darley@72.61.34.177"
PORT="63022"
REMOTE_PATH="/home/darley/vestme-api"

echo "=========================================="
echo "  Copiando script criar-admin-producao.sh"
echo "=========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "criar-admin-producao.sh" ]; then
    echo "❌ Erro: Arquivo criar-admin-producao.sh não encontrado"
    echo "   Execute este script no diretório /home/darley/rent-roupa"
    exit 1
fi

echo "📦 Copiando criar-admin-producao.sh para o servidor..."
scp -P $PORT criar-admin-producao.sh $SERVER:$REMOTE_PATH/

if [ $? -eq 0 ]; then
    echo "   ✅ Script copiado com sucesso!"
    echo ""
    echo "📝 Agora, no servidor, execute:"
    echo "   ssh -p $PORT $SERVER"
    echo "   cd $REMOTE_PATH"
    echo "   chmod +x criar-admin-producao.sh"
    echo "   ./criar-admin-producao.sh"
else
    echo "   ❌ Erro ao copiar script"
    exit 1
fi

echo ""
echo "=========================================="
echo "  ✅ Cópia concluída!"
echo "=========================================="

