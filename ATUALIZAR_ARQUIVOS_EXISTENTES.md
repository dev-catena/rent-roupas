# 🔄 Atualizar Arquivos Existentes no Servidor

Além de copiar os novos arquivos, você precisa atualizar alguns arquivos existentes no servidor.

## Arquivos que precisam ser atualizados:

### 1. `app/Models/ClothingItem.php`

Adicionar no `$fillable`:
```php
'clothing_category_id',  // Substituir 'category'
```

Adicionar relacionamento:
```php
public function category()
{
    return $this->belongsTo(ClothingCategory::class, 'clothing_category_id');
}
```

Atualizar scope:
```php
public function scopeByCategory($query, $categoryId)
{
    return $query->where('clothing_category_id', $categoryId);
}
```

### 2. `app/Http/Controllers/Api/ClothingItemController.php`

Adicionar import:
```php
use App\Models\ClothingCategory;
```

No método `index()`, atualizar:
```php
if ($request->has('category')) {
    $query->where('clothing_category_id', $request->category);
}
```

No método `store()`, atualizar validação:
```php
'clothing_category_id' => 'required|exists:clothing_categories,id',
// Remover: 'category' => 'required|in:dress,suit,...'
```

No método `update()`, atualizar validação:
```php
'clothing_category_id' => 'sometimes|exists:clothing_categories,id',
// Remover: 'category' => 'sometimes|in:dress,suit,...'
```

### 3. `routes/api.php`

Adicionar import:
```php
use App\Http\Controllers\Api\ClothingCategoryController;
```

Adicionar rotas (após as rotas públicas):
```php
Route::get('/clothing-categories', [ClothingCategoryController::class, 'index']);
Route::get('/clothing-categories/{id}', [ClothingCategoryController::class, 'show']);
```

## Opção: Copiar arquivos atualizados

Se preferir, você pode copiar os arquivos atualizados do projeto local:

```bash
# Models
scp -P 63022 app/Models/ClothingItem.php darley@72.61.34.177:/home/darley/vestme-api/app/Models/

# Controller
scp -P 63022 app/Http/Controllers/Api/ClothingItemController.php darley@72.61.34.177:/home/darley/vestme-api/app/Http/Controllers/Api/

# Rotas
scp -P 63022 routes/api.php darley@72.61.34.177:/home/darley/vestme-api/routes/
```

## Depois de atualizar:

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

