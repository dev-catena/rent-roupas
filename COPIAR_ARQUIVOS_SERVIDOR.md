# 📤 Copiar Arquivos para o Servidor

Execute os seguintes comandos para copiar os arquivos necessários para o servidor:

## 1. Copiar Migrations

```bash
scp -P 63022 database/migrations/2025_01_18_000001_create_clothing_categories_table.php root@72.61.34.177:/home/darley/vestme-api/database/migrations/
scp -P 63022 database/migrations/2025_01_18_000002_create_clothing_category_attributes_table.php root@72.61.34.177:/home/darley/vestme-api/database/migrations/
scp -P 63022 database/migrations/2025_01_18_000003_update_clothing_items_add_category_foreign_key.php root@72.61.34.177:/home/darley/vestme-api/database/migrations/
```

## 2. Copiar Seeders

```bash
scp -P 63022 database/seeders/ClothingCategoriesSeeder.php root@72.61.34.177:/home/darley/vestme-api/database/seeders/
```

## 3. Copiar Models

```bash
scp -P 63022 app/Models/ClothingCategory.php root@72.61.34.177:/home/darley/vestme-api/app/Models/
scp -P 63022 app/Models/ClothingCategoryAttribute.php root@72.61.34.177:/home/darley/vestme-api/app/Models/
```

## 4. Copiar Controller

```bash
scp -P 63022 app/Http/Controllers/Api/ClothingCategoryController.php root@72.61.34.177:/home/darley/vestme-api/app/Http/Controllers/Api/
```

## 5. Atualizar arquivos existentes no servidor

Você precisará atualizar manualmente ou copiar:
- `app/Models/ClothingItem.php` (adicionar relacionamento com categoria)
- `app/Http/Controllers/Api/ClothingItemController.php` (atualizar validações)
- `routes/api.php` (adicionar rotas de categorias)

## Comando único (mais fácil)

Execute tudo de uma vez:

```bash
# Migrations
scp -P 63022 database/migrations/2025_01_18_*.php darley@72.61.34.177:/home/darley/vestme-api/database/migrations/

# Seeder
scp -P 63022 database/seeders/ClothingCategoriesSeeder.php darley@72.61.34.177:/home/darley/vestme-api/database/seeders/

# Models
scp -P 63022 app/Models/ClothingCategory.php app/Models/ClothingCategoryAttribute.php darley@72.61.34.177:/home/darley/vestme-api/app/Models/

# Controller
scp -P 63022 app/Http/Controllers/Api/ClothingCategoryController.php darley@72.61.34.177:/home/darley/vestme-api/app/Http/Controllers/Api/
```

## Depois de copiar, no servidor:

```bash
ssh -p 63022 darley@72.61.34.177
cd /home/darley/vestme-api

# Executar migrations
php artisan migrate

# Executar seeder
php artisan db:seed --class=ClothingCategoriesSeeder
```

