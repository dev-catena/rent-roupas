#!/bin/bash

# Script para corrigir os problemas no servidor

SERVER="darley@72.61.34.177"
PORT="63022"
REMOTE_PATH="/home/darley/vestme-api"

echo "=========================================="
echo "  Corrigindo arquivos no servidor"
echo "=========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "artisan" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto Laravel"
    exit 1
fi

echo "📦 Copiando arquivos corrigidos..."
echo ""

# 1. routes/api.php (corrigir o erro do closure)
echo "1. Copiando routes/api.php (corrigido)..."
scp -P $PORT routes/api.php $SERVER:$REMOTE_PATH/routes/
if [ $? -eq 0 ]; then
    echo "   ✅ routes/api.php copiado"
else
    echo "   ❌ Erro ao copiar routes/api.php"
    exit 1
fi

# 2. bootstrap/app.php (registrar middleware)
echo "2. Copiando bootstrap/app.php..."
scp -P $PORT bootstrap/app.php $SERVER:$REMOTE_PATH/bootstrap/
if [ $? -eq 0 ]; then
    echo "   ✅ bootstrap/app.php copiado"
else
    echo "   ❌ Erro ao copiar bootstrap/app.php"
    exit 1
fi

# 3. Middleware EnsureUserIsAdmin
echo "3. Copiando EnsureUserIsAdmin.php..."
scp -P $PORT app/Http/Middleware/EnsureUserIsAdmin.php $SERVER:$REMOTE_PATH/app/Http/Middleware/
if [ $? -eq 0 ]; then
    echo "   ✅ EnsureUserIsAdmin.php copiado"
else
    echo "   ❌ Erro ao copiar EnsureUserIsAdmin.php"
    exit 1
fi

# 4. Comando CreateAdminUser
echo "4. Copiando CreateAdminUser.php..."
scp -P $PORT app/Console/Commands/CreateAdminUser.php $SERVER:$REMOTE_PATH/app/Console/Commands/
if [ $? -eq 0 ]; then
    echo "   ✅ CreateAdminUser.php copiado"
else
    echo "   ❌ Erro ao copiar CreateAdminUser.php"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ Arquivos copiados!"
echo ""
echo "Agora execute no servidor:"
echo "1. ssh -p $PORT $SERVER"
echo "2. cd $REMOTE_PATH"
echo "3. php artisan route:clear"
echo "4. php artisan config:clear"
echo "5. php artisan cache:clear"
echo "6. php artisan route:cache"
echo "7. php artisan admin:create seu@email.com --make-existing"
echo "=========================================="

