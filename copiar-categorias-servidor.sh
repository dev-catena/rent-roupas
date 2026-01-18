#!/bin/bash

# Script para copiar arquivos de categorias para o servidor
# Uso: ./copiar-categorias-servidor.sh

SERVER="darley@72.61.34.177"
PORT="63022"
SERVER_PATH="/home/darley/vestme-api"

echo "📤 Copiando arquivos para o servidor..."

# Migrations
echo "📋 Copiando migrations..."
scp -P $PORT database/migrations/2025_01_18_000001_create_clothing_categories_table.php $SERVER:$SERVER_PATH/database/migrations/
scp -P $PORT database/migrations/2025_01_18_000002_create_clothing_category_attributes_table.php $SERVER:$SERVER_PATH/database/migrations/
scp -P $PORT database/migrations/2025_01_18_000003_update_clothing_items_add_category_foreign_key.php $SERVER:$SERVER_PATH/database/migrations/

# Seeder
echo "🌱 Copiando seeder..."
scp -P $PORT database/seeders/ClothingCategoriesSeeder.php $SERVER:$SERVER_PATH/database/seeders/

# Models
echo "📦 Copiando models..."
scp -P $PORT app/Models/ClothingCategory.php $SERVER:$SERVER_PATH/app/Models/
scp -P $PORT app/Models/ClothingCategoryAttribute.php $SERVER:$SERVER_PATH/app/Models/

# Controller
echo "🎮 Copiando controller..."
scp -P $PORT app/Http/Controllers/Api/ClothingCategoryController.php $SERVER:$SERVER_PATH/app/Http/Controllers/Api/

echo "✅ Arquivos copiados com sucesso!"
echo ""
echo "📝 Próximos passos no servidor:"
echo "   ssh -p $PORT $SERVER"
echo "   cd $SERVER_PATH"
echo "   php artisan migrate"
echo "   php artisan db:seed --class=ClothingCategoriesSeeder"

