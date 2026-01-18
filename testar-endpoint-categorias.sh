#!/bin/bash

# Script para testar os endpoints de categorias
# Execute no servidor após fazer login no web-admin e copiar o token

echo "=========================================="
echo "  Teste de Endpoints de Categorias"
echo "=========================================="
echo ""

# Endpoint público (usado pelo app)
echo "1. Testando endpoint PÚBLICO (/clothing-categories):"
echo "   curl -X GET 'http://localhost/api/clothing-categories' -H 'Accept: application/json'"
echo ""
curl -X GET "http://localhost/api/clothing-categories" \
  -H "Accept: application/json" \
  -s | jq '.' 2>/dev/null || echo "   (jq não instalado, resposta raw acima)"
echo ""

echo "2. Testando endpoint ADMIN (/admin/clothing-categories):"
echo "   (Requer token de autenticação)"
echo ""
echo "   Para testar, você precisa:"
echo "   1. Fazer login no web-admin"
echo "   2. Abrir o console do navegador (F12)"
echo "   3. Executar: localStorage.getItem('@rent-roupa:token')"
echo "   4. Copiar o token"
echo "   5. Executar:"
echo ""
echo "   curl -X GET 'http://localhost/api/admin/clothing-categories' \\"
echo "     -H 'Authorization: Bearer SEU_TOKEN_AQUI' \\"
echo "     -H 'Accept: application/json'"
echo ""

echo "3. Verificando categorias no banco de dados:"
echo "   php artisan tinker"
echo "   >>> App\Models\ClothingCategory::count()"
echo "   >>> App\Models\ClothingCategory::all()"
echo ""

