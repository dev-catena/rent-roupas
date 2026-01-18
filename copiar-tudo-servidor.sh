#!/bin/bash

# Script completo: cria diretórios e copia todos os arquivos

SERVER="darley@72.61.34.177"
PORT="63022"
REMOTE_PATH="/home/darley/vestme-api"

echo "=========================================="
echo "  Configurando servidor completo"
echo "=========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "artisan" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto Laravel"
    exit 1
fi

echo "📁 Criando diretórios..."
ssh -p $PORT $SERVER "mkdir -p $REMOTE_PATH/app/Console/Commands" 2>/dev/null
ssh -p $PORT $SERVER "mkdir -p $REMOTE_PATH/app/Http/Middleware" 2>/dev/null
ssh -p $PORT $SERVER "mkdir -p $REMOTE_PATH/app/Http/Controllers/Api" 2>/dev/null
ssh -p $PORT $SERVER "mkdir -p $REMOTE_PATH/app/Models" 2>/dev/null
ssh -p $PORT $SERVER "mkdir -p $REMOTE_PATH/database/migrations" 2>/dev/null
ssh -p $PORT $SERVER "mkdir -p $REMOTE_PATH/bootstrap" 2>/dev/null
ssh -p $PORT $SERVER "mkdir -p $REMOTE_PATH/routes" 2>/dev/null
echo "✅ Diretórios criados"
echo ""

echo "📦 Copiando arquivos..."
echo ""

# 1. Comando CreateAdminUser
echo "1. CreateAdminUser.php..."
scp -P $PORT app/Console/Commands/CreateAdminUser.php $SERVER:$REMOTE_PATH/app/Console/Commands/ 2>/dev/null
[ $? -eq 0 ] && echo "   ✅ OK" || echo "   ❌ Erro"

# 2. Middleware EnsureUserIsAdmin
echo "2. EnsureUserIsAdmin.php..."
scp -P $PORT app/Http/Middleware/EnsureUserIsAdmin.php $SERVER:$REMOTE_PATH/app/Http/Middleware/ 2>/dev/null
[ $? -eq 0 ] && echo "   ✅ OK" || echo "   ❌ Erro"

# 3. AdminController
echo "3. AdminController.php..."
scp -P $PORT app/Http/Controllers/Api/AdminController.php $SERVER:$REMOTE_PATH/app/Http/Controllers/Api/ 2>/dev/null
[ $? -eq 0 ] && echo "   ✅ OK" || echo "   ❌ Erro"

# 4. Model User
echo "4. User.php..."
scp -P $PORT app/Models/User.php $SERVER:$REMOTE_PATH/app/Models/ 2>/dev/null
[ $? -eq 0 ] && echo "   ✅ OK" || echo "   ❌ Erro"

# 5. Migration
echo "5. Migration..."
scp -P $PORT database/migrations/2026_01_18_014218_add_is_admin_to_users_table.php $SERVER:$REMOTE_PATH/database/migrations/ 2>/dev/null
[ $? -eq 0 ] && echo "   ✅ OK" || echo "   ❌ Erro"

# 6. bootstrap/app.php
echo "6. bootstrap/app.php..."
scp -P $PORT bootstrap/app.php $SERVER:$REMOTE_PATH/bootstrap/ 2>/dev/null
[ $? -eq 0 ] && echo "   ✅ OK" || echo "   ❌ Erro"

# 7. routes/api.php
echo "7. routes/api.php..."
scp -P $PORT routes/api.php $SERVER:$REMOTE_PATH/routes/ 2>/dev/null
[ $? -eq 0 ] && echo "   ✅ OK" || echo "   ❌ Erro"

# 8. Script shell
echo "8. criar-admin.sh..."
scp -P $PORT criar-admin.sh $SERVER:$REMOTE_PATH/ 2>/dev/null
[ $? -eq 0 ] && echo "   ✅ OK" || echo "   ❌ Erro"

echo ""
echo "=========================================="
echo "✅ Arquivos copiados!"
echo ""
echo "Próximos passos no servidor:"
echo "1. ssh -p $PORT $SERVER"
echo "2. cd $REMOTE_PATH"
echo "3. php artisan migrate"
echo "4. php artisan route:clear && php artisan config:clear && php artisan cache:clear && php artisan route:cache"
echo "5. php artisan admin:create seu@email.com --make-existing"
echo "=========================================="

