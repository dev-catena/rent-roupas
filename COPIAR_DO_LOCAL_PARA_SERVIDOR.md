# 📤 Copiar Arquivos do Computador Local para o Servidor

## ⚠️ IMPORTANTE: Execute estes comandos no seu COMPUTADOR LOCAL, não no servidor!

## Passo 1: No seu computador local

Abra um terminal no seu computador local e execute:

```bash
cd /home/darley/rent-roupa

# Copiar migrations
scp -P 63022 database/migrations/2025_01_18_000001_create_clothing_categories_table.php darley@72.61.34.177:/home/darley/vestme-api/database/migrations/
scp -P 63022 database/migrations/2025_01_18_000002_create_clothing_category_attributes_table.php darley@72.61.34.177:/home/darley/vestme-api/database/migrations/
scp -P 63022 database/migrations/2025_01_18_000003_update_clothing_items_add_category_foreign_key.php darley@72.61.34.177:/home/darley/vestme-api/database/migrations/

# Copiar seeder
scp -P 63022 database/seeders/ClothingCategoriesSeeder.php darley@72.61.34.177:/home/darley/vestme-api/database/seeders/

# Copiar models
scp -P 63022 app/Models/ClothingCategory.php darley@72.61.34.177:/home/darley/vestme-api/app/Models/
scp -P 63022 app/Models/ClothingCategoryAttribute.php darley@72.61.34.177:/home/darley/vestme-api/app/Models/

# Copiar controller
scp -P 63022 app/Http/Controllers/Api/ClothingCategoryController.php darley@72.61.34.177:/home/darley/vestme-api/app/Http/Controllers/Api/

# Copiar arquivos atualizados
scp -P 63022 app/Models/ClothingItem.php darley@72.61.34.177:/home/darley/vestme-api/app/Models/
scp -P 63022 app/Http/Controllers/Api/ClothingItemController.php darley@72.61.34.177:/home/darley/vestme-api/app/Http/Controllers/Api/
scp -P 63022 routes/api.php darley@72.61.34.177:/home/darley/vestme-api/routes/
```

## Passo 2: No servidor (após copiar)

Depois de copiar todos os arquivos, conecte no servidor:

```bash
ssh -p 63022 darley@72.61.34.177
cd /home/darley/vestme-api

# Limpar cache
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# Executar migrations
php artisan migrate

# Executar seeder
php artisan db:seed --class=ClothingCategoriesSeeder
```

## Alternativa: Usar o script

Se você estiver no computador local, pode executar:

```bash
cd /home/darley/rent-roupa
./copiar-categorias-servidor.sh
```

Mas ainda precisará copiar os arquivos atualizados manualmente (ClothingItem.php, ClothingItemController.php, routes/api.php).

