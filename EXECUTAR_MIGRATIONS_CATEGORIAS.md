# 📋 Executar Migrations e Seeders de Categorias

## Passos para Configurar

### 1. Executar as Migrations

```bash
cd /home/darley/vestme-api
php artisan migrate
```

Isso criará as tabelas:
- `clothing_categories` - Categorias de roupas (Vestido, Calça, Camisa, etc.)
- `clothing_category_attributes` - Atributos relacionados a cada categoria
- Atualizará `clothing_items` para usar `clothing_category_id` ao invés de `category`

### 2. Executar o Seeder

```bash
php artisan db:seed --class=ClothingCategoriesSeeder
```

Isso populará as categorias principais:
- 👗 Vestido
- 👖 Calça
- 👔 Camisa
- 👠 Sapato
- 👗 Saia
- 🧥 Blazer
- 🤵 Terno
- 👜 Acessório

Cada categoria terá seus atributos específicos configurados (ex: Vestido tem busto, cintura, quadril, comprimento; Sapato tem apenas número).

### 3. Verificar se Funcionou

```bash
# Verificar categorias criadas
php artisan tinker
>>> App\Models\ClothingCategory::with('attributes')->get();

# Verificar uma categoria específica
>>> App\Models\ClothingCategory::where('slug', 'dress')->with('attributes')->first();
```

## Estrutura das Tabelas

### clothing_categories
- `id` - ID da categoria
- `name` - Nome (ex: "Vestido")
- `slug` - Slug único (ex: "dress")
- `icon` - Emoji/ícone
- `description` - Descrição
- `order` - Ordem de exibição
- `is_active` - Se está ativa

### clothing_category_attributes
- `id` - ID do atributo
- `clothing_category_id` - FK para categoria
- `attribute_name` - Nome do campo (ex: "chest", "shoe_size")
- `label` - Label para exibição (ex: "Busto", "Número do Sapato")
- `type` - Tipo: "decimal", "string", "integer"
- `unit` - Unidade (ex: "cm", null)
- `placeholder` - Placeholder do campo
- `order` - Ordem de exibição
- `is_required` - Se é obrigatório

## Endpoints da API

### Listar Categorias
```
GET /api/clothing-categories
```

Resposta:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Vestido",
      "slug": "dress",
      "icon": "👗",
      "attributes": [
        {
          "id": 1,
          "attribute_name": "size",
          "label": "Tamanho",
          "type": "string",
          "unit": null,
          "placeholder": "P, M, G, GG"
        },
        {
          "id": 2,
          "attribute_name": "chest",
          "label": "Busto",
          "type": "decimal",
          "unit": "cm",
          "placeholder": "90"
        }
      ]
    }
  ]
}
```

### Obter Categoria Específica
```
GET /api/clothing-categories/{id}
```

## Como Funciona no App

1. **Usuário seleciona categoria**: Ao selecionar uma categoria (ex: Vestido), o app busca os atributos relacionados
2. **Campos aparecem dinamicamente**: Apenas os campos relevantes aparecem (ex: Vestido não mostra "Número do Sapato")
3. **Validação no backend**: O backend valida que os campos enviados correspondem aos atributos da categoria

## Notas Importantes

- ⚠️ Se já existirem dados na tabela `clothing_items`, a migration adiciona `clothing_category_id` como nullable
- ⚠️ Você precisará migrar os dados antigos manualmente se necessário
- ✅ Novos itens sempre precisarão de uma categoria selecionada

