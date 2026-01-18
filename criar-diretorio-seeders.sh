#!/bin/bash

# Script para criar o diretório seeders no servidor e copiar o arquivo

echo "📁 Criando diretório seeders no servidor..."
ssh -p 63022 darley@72.61.34.177 "mkdir -p /home/darley/vestme-api/database/seeders && chmod 755 /home/darley/vestme-api/database/seeders"

echo "📤 Copiando seeder..."
scp -P 63022 database/seeders/ClothingCategoriesSeeder.php darley@72.61.34.177:/home/darley/vestme-api/database/seeders/

echo "✅ Arquivo copiado!"
echo ""
echo "📝 Agora no servidor execute:"
echo "   ssh -p 63022 darley@72.61.34.177"
echo "   cd /home/darley/vestme-api"
echo "   php artisan db:seed --class=ClothingCategoriesSeeder"

