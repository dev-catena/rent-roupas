#!/bin/bash

# Script para copiar arquivos de vendas para o servidor de produção
# Execute este script do diretório raiz do projeto rent-roupa

SERVER="darley@72.61.34.177"
PORT="63022"
REMOTE_PATH="/home/darley/vestme-api"

echo "=========================================="
echo "  Copiando funcionalidade de vendas"
echo "=========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "artisan" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto Laravel"
    exit 1
fi

echo "📦 Copiando arquivos..."
echo ""

# 1. Migrations
echo "1. Copiando migrations..."
scp -P $PORT database/migrations/2026_01_18_093301_add_sale_fields_to_clothing_items_table.php $SERVER:$REMOTE_PATH/database/migrations/
if [ $? -eq 0 ]; then
    echo "   ✅ Migration add_sale_fields copiada"
else
    echo "   ❌ Erro ao copiar migration add_sale_fields"
fi

scp -P $PORT database/migrations/2026_01_18_093320_create_sales_table.php $SERVER:$REMOTE_PATH/database/migrations/
if [ $? -eq 0 ]; then
    echo "   ✅ Migration create_sales_table copiada"
else
    echo "   ❌ Erro ao copiar migration create_sales_table"
fi

# 2. Model Sale
echo "2. Copiando modelo Sale.php..."
scp -P $PORT app/Models/Sale.php $SERVER:$REMOTE_PATH/app/Models/
if [ $? -eq 0 ]; then
    echo "   ✅ Sale.php copiado"
else
    echo "   ❌ Erro ao copiar Sale.php"
fi

# 3. SaleController
echo "3. Copiando SaleController.php..."
scp -P $PORT app/Http/Controllers/Api/SaleController.php $SERVER:$REMOTE_PATH/app/Http/Controllers/Api/
if [ $? -eq 0 ]; then
    echo "   ✅ SaleController.php copiado"
else
    echo "   ❌ Erro ao copiar SaleController.php"
fi

# 4. ClothingItem atualizado
echo "4. Atualizando ClothingItem.php..."
scp -P $PORT app/Models/ClothingItem.php $SERVER:$REMOTE_PATH/app/Models/
if [ $? -eq 0 ]; then
    echo "   ✅ ClothingItem.php atualizado"
else
    echo "   ❌ Erro ao atualizar ClothingItem.php"
fi

# 5. ClothingItemController atualizado
echo "5. Atualizando ClothingItemController.php..."
scp -P $PORT app/Http/Controllers/Api/ClothingItemController.php $SERVER:$REMOTE_PATH/app/Http/Controllers/Api/
if [ $? -eq 0 ]; then
    echo "   ✅ ClothingItemController.php atualizado"
else
    echo "   ❌ Erro ao atualizar ClothingItemController.php"
fi

# 6. Rotas atualizadas
echo "6. Atualizando routes/api.php..."
scp -P $PORT routes/api.php $SERVER:$REMOTE_PATH/routes/
if [ $? -eq 0 ]; then
    echo "   ✅ routes/api.php atualizado"
else
    echo "   ❌ Erro ao atualizar routes/api.php"
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
echo "6. php artisan migrate"
echo ""

