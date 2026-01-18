# 📤 Copiar Funcionalidade de Vendas para o Servidor

## ⚠️ IMPORTANTE: Execute estes comandos no seu COMPUTADOR LOCAL, não no servidor!

## Passo 1: No seu computador local

Abra um terminal no seu computador local e execute:

```bash
cd /home/darley/rent-roupa

# 1. Copiar migrations (2 arquivos)
scp -P 63022 database/migrations/2026_01_18_093301_add_sale_fields_to_clothing_items_table.php darley@72.61.34.177:/home/darley/vestme-api/database/migrations/
scp -P 63022 database/migrations/2026_01_18_093320_create_sales_table.php darley@72.61.34.177:/home/darley/vestme-api/database/migrations/

# 2. Copiar modelo Sale
scp -P 63022 app/Models/Sale.php darley@72.61.34.177:/home/darley/vestme-api/app/Models/

# 3. Copiar SaleController
scp -P 63022 app/Http/Controllers/Api/SaleController.php darley@72.61.34.177:/home/darley/vestme-api/app/Http/Controllers/Api/

# 4. Atualizar ClothingItem (modelo e controller)
scp -P 63022 app/Models/ClothingItem.php darley@72.61.34.177:/home/darley/vestme-api/app/Models/
scp -P 63022 app/Http/Controllers/Api/ClothingItemController.php darley@72.61.34.177:/home/darley/vestme-api/app/Http/Controllers/Api/

# 5. Atualizar rotas
scp -P 63022 routes/api.php darley@72.61.34.177:/home/darley/vestme-api/routes/
```

## Passo 2: No servidor (após copiar)

Depois de copiar todos os arquivos, conecte no servidor:

```bash
ssh -p 63022 darley@72.61.34.177
cd /home/darley/vestme-api

# Limpar cache (IMPORTANTE!)
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# Executar migrations
php artisan migrate

# Verificar se as rotas foram carregadas
php artisan route:list | grep sales
```

## Arquivos copiados:

✅ **Migrations:**
- `2026_01_18_093301_add_sale_fields_to_clothing_items_table.php`
- `2026_01_18_093320_create_sales_table.php`

✅ **Models:**
- `Sale.php` (novo)
- `ClothingItem.php` (atualizado)

✅ **Controllers:**
- `SaleController.php` (novo)
- `ClothingItemController.php` (atualizado)

✅ **Rotas:**
- `routes/api.php` (atualizado)

## Verificação

Após executar as migrations, você pode verificar se tudo está funcionando:

```bash
# Verificar se a tabela sales foi criada
php artisan tinker
>>> Schema::hasTable('sales')
=> true

# Verificar se os campos foram adicionados em clothing_items
>>> Schema::hasColumn('clothing_items', 'is_for_sale')
=> true
>>> Schema::hasColumn('clothing_items', 'sale_price')
=> true
```

