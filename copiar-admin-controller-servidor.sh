#!/bin/bash

# Script para copiar AdminController atualizado para o servidor
# Execute este script do diretório raiz do projeto rent-roupa

SERVER="darley@72.61.34.177"
PORT="63022"
REMOTE_PATH="/home/darley/vestme-api"

echo "=========================================="
echo "  Copiando AdminController para servidor"
echo "=========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "artisan" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto Laravel"
    exit 1
fi

echo "📦 Copiando AdminController.php..."
scp -P $PORT app/Http/Controllers/Api/AdminController.php $SERVER:$REMOTE_PATH/app/Http/Controllers/Api/
if [ $? -eq 0 ]; then
    echo "   ✅ AdminController.php copiado"
else
    echo "   ❌ Erro ao copiar AdminController.php"
    exit 1
fi

echo ""
echo "=========================================="
echo "  ✅ Cópia concluída!"
echo "=========================================="
echo ""
echo "Próximos passos no servidor:"
echo "1. ssh -p $PORT $SERVER"
echo "2. cd $REMOTE_PATH"
echo "3. php artisan config:clear"
echo "4. php artisan route:clear"
echo "5. php artisan cache:clear"
echo ""
echo "Para verificar se há categorias no banco:"
echo "php artisan tinker"
echo ">>> App\Models\ClothingCategory::count()"
echo ""

