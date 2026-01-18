#!/bin/bash

# Script para copiar arquivos do admin para o servidor de produção
# Execute este script do diretório raiz do projeto rent-roupa

SERVER="darley@72.61.34.177"
PORT="63022"
REMOTE_PATH="/home/darley/vestme-api"

echo "=========================================="
echo "  Copiando arquivos admin para servidor"
echo "=========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "artisan" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto Laravel"
    exit 1
fi

echo "📦 Copiando arquivos..."
echo ""

# 1. Comando CreateAdminUser
echo "1. Copiando CreateAdminUser.php..."
scp -P $PORT app/Console/Commands/CreateAdminUser.php $SERVER:$REMOTE_PATH/app/Console/Commands/
if [ $? -eq 0 ]; then
    echo "   ✅ CreateAdminUser.php copiado"
else
    echo "   ❌ Erro ao copiar CreateAdminUser.php"
fi

# 2. Middleware EnsureUserIsAdmin
echo "2. Copiando EnsureUserIsAdmin.php..."
scp -P $PORT app/Http/Middleware/EnsureUserIsAdmin.php $SERVER:$REMOTE_PATH/app/Http/Middleware/
if [ $? -eq 0 ]; then
    echo "   ✅ EnsureUserIsAdmin.php copiado"
else
    echo "   ❌ Erro ao copiar EnsureUserIsAdmin.php"
fi

# 3. Script shell
echo "3. Copiando criar-admin.sh..."
scp -P $PORT criar-admin.sh $SERVER:$REMOTE_PATH/
if [ $? -eq 0 ]; then
    echo "   ✅ criar-admin.sh copiado"
else
    echo "   ❌ Erro ao copiar criar-admin.sh"
fi

# 4. bootstrap/app.php
echo "4. Copiando bootstrap/app.php..."
scp -P $PORT bootstrap/app.php $SERVER:$REMOTE_PATH/bootstrap/
if [ $? -eq 0 ]; then
    echo "   ✅ bootstrap/app.php copiado"
else
    echo "   ❌ Erro ao copiar bootstrap/app.php"
fi

# 5. routes/api.php
echo "5. Copiando routes/api.php..."
scp -P $PORT routes/api.php $SERVER:$REMOTE_PATH/routes/
if [ $? -eq 0 ]; then
    echo "   ✅ routes/api.php copiado"
else
    echo "   ❌ Erro ao copiar routes/api.php"
fi

# 6. AdminController
echo "6. Copiando AdminController.php..."
scp -P $PORT app/Http/Controllers/Api/AdminController.php $SERVER:$REMOTE_PATH/app/Http/Controllers/Api/
if [ $? -eq 0 ]; then
    echo "   ✅ AdminController.php copiado"
else
    echo "   ❌ Erro ao copiar AdminController.php"
fi

# 7. Model User
echo "7. Copiando User.php..."
scp -P $PORT app/Models/User.php $SERVER:$REMOTE_PATH/app/Models/
if [ $? -eq 0 ]; then
    echo "   ✅ User.php copiado"
else
    echo "   ❌ Erro ao copiar User.php"
fi

# 8. Migration
echo "8. Copiando migration..."
scp -P $PORT database/migrations/2026_01_18_014218_add_is_admin_to_users_table.php $SERVER:$REMOTE_PATH/database/migrations/
if [ $? -eq 0 ]; then
    echo "   ✅ Migration copiada"
else
    echo "   ❌ Erro ao copiar migration"
fi

echo ""
echo "=========================================="
echo "✅ Arquivos copiados!"
echo ""
echo "Próximos passos no servidor:"
echo "1. ssh -p $PORT $SERVER"
echo "2. cd $REMOTE_PATH"
echo "3. php artisan migrate"
echo "4. php artisan admin:create seu@email.com --make-existing"
echo "5. php artisan route:clear && php artisan config:clear && php artisan cache:clear && php artisan route:cache"
echo "=========================================="

