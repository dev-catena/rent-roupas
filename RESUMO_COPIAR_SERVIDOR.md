# 📋 Resumo: Copiar Arquivos para o Servidor

## ⚠️ O erro 404 acontece porque os arquivos ainda não foram copiados para o servidor!

## Execute estes comandos no seu COMPUTADOR LOCAL:

```bash
cd /home/darley/rent-roupa

# 1. Migrations (3 arquivos)
scp -P 63022 database/migrations/2025_01_18_000001_create_clothing_categories_table.php darley@72.61.34.177:/home/darley/vestme-api/database/migrations/
scp -P 63022 database/migrations/2025_01_18_000002_create_clothing_category_attributes_table.php darley@72.61.34.177:/home/darley/vestme-api/database/migrations/
scp -P 63022 database/migrations/2025_01_18_000003_update_clothing_items_add_category_foreign_key.php darley@72.61.34.177:/home/darley/vestme-api/database/migrations/

# 2. Seeder
scp -P 63022 database/seeders/ClothingCategoriesSeeder.php darley@72.61.34.177:/home/darley/vestme-api/database/seeders/

# 3. Models (3 arquivos)
scp -P 63022 app/Models/ClothingCategory.php darley@72.61.34.177:/home/darley/vestme-api/app/Models/
scp -P 63022 app/Models/ClothingCategoryAttribute.php darley@72.61.34.177:/home/darley/vestme-api/app/Models/
scp -P 63022 app/Models/ClothingItem.php darley@72.61.34.177:/home/darley/vestme-api/app/Models/

# 4. Controllers (2 arquivos)
scp -P 63022 app/Http/Controllers/Api/ClothingCategoryController.php darley@72.61.34.177:/home/darley/vestme-api/app/Http/Controllers/Api/
scp -P 63022 app/Http/Controllers/Api/ClothingItemController.php darley@72.61.34.177:/home/darley/vestme-api/app/Http/Controllers/Api/

# 5. Rotas (IMPORTANTE - sem isso o endpoint não funciona!)
scp -P 63022 routes/api.php darley@72.61.34.177:/home/darley/vestme-api/routes/
```

## Depois de copiar, execute no SERVIDOR:

```bash
ssh -p 63022 darley@72.61.34.177
cd /home/darley/vestme-api

# Limpar cache (IMPORTANTE!)
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# Executar migrations
php artisan migrate

# Executar seeder
php artisan db:seed --class=ClothingCategoriesSeeder

# Verificar se as rotas foram carregadas
php artisan route:list | grep clothing-categories
```

## Verificar se funcionou:

```bash
# No servidor, testar o endpoint:
curl https://api.vestme.cloud/api/clothing-categories
```

Se retornar JSON com as categorias, está funcionando! ✅

## Arquivos mais importantes:

1. **routes/api.php** - Sem isso, o endpoint não existe (404)
2. **ClothingCategoryController.php** - Controller que processa a requisição
3. **Migrations** - Cria as tabelas no banco
4. **Seeder** - Popula as categorias

