# 🔍 Comparação dos Endpoints de Categorias

## Endpoints Identificados

### 1. **App Mobile** (Público)
- **Endpoint:** `GET /api/clothing-categories`
- **Controller:** `ClothingCategoryController::index`
- **Rota:** Pública (não requer autenticação)
- **Filtros:**
  - Apenas categorias **ATIVAS** (`is_active = true`)
  - Ordenado por `order`
- **Retorno:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Vestido",
      "slug": "dress",
      "icon": "👗",
      "is_active": true,
      ...
    }
  ]
}
```

### 2. **Web-Admin** (Administrativo)
- **Endpoint:** `GET /api/admin/clothing-categories`
- **Controller:** `AdminController::getAllClothingCategories`
- **Rota:** Protegida (requer autenticação + `is_admin = true`)
- **Filtros:**
  - **TODAS** as categorias (ativas e inativas)
  - Ordenado por `order`, depois por `name`
- **Retorno:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Vestido",
      "slug": "dress",
      "icon": "👗",
      "is_active": true,
      ...
    }
  ]
}
```

## Diferenças Principais

| Aspecto | App Mobile | Web-Admin |
|---------|-----------|-----------|
| **Endpoint** | `/clothing-categories` | `/admin/clothing-categories` |
| **Autenticação** | Não requer | Requer (Bearer Token + is_admin) |
| **Filtro** | Apenas ativas | Todas (ativas + inativas) |
| **Ordenação** | Por `order` | Por `order`, depois `name` |
| **Uso** | Seleção de categoria ao cadastrar peça | CRUD completo de categorias |

## Problema Identificado

O web-admin não está mostrando as categorias porque:

1. **Endpoints diferentes** - O app usa um endpoint público, o web-admin usa um endpoint admin
2. **Possível problema de autenticação** - O endpoint admin requer token válido + permissão de admin
3. **Possível problema de processamento** - O frontend pode não estar processando a resposta corretamente

## Solução

### Verificação 1: Testar o endpoint admin diretamente

```bash
# No servidor
curl -X GET "http://localhost/api/admin/clothing-categories" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Accept: application/json"
```

### Verificação 2: Verificar se há categorias no banco

```bash
php artisan tinker
>>> App\Models\ClothingCategory::count()
>>> App\Models\ClothingCategory::all()
>>> App\Models\ClothingCategory::where('is_active', true)->count()
```

### Verificação 3: Verificar autenticação no web-admin

No console do navegador (F12):
```javascript
localStorage.getItem('@rent-roupa:token')
```

### Verificação 4: Verificar se o usuário é admin

```bash
php artisan tinker
>>> $user = App\Models\User::where('email', 'seu-email@exemplo.com')->first();
>>> $user->is_admin
```

## Recomendações

1. **Usar o mesmo endpoint no web-admin** - Opcionalmente, fazer o web-admin usar o endpoint público também (mas sem filtro de ativas)
2. **Verificar logs** - Verificar se há erros 401/403 no console do navegador
3. **Testar diretamente** - Testar o endpoint admin com curl para verificar se retorna dados

