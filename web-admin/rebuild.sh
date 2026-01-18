#!/bin/bash

echo "=========================================="
echo "  Rebuild da Aplicação Web Admin"
echo "=========================================="
echo ""

cd "$(dirname "$0")"

# Parar servidor anterior
echo "1. Parando servidor anterior..."
pkill -f "vite.*5173" 2>/dev/null
sleep 2

# Limpar cache
echo "2. Limpando cache..."
rm -rf node_modules/.vite
rm -rf dist

# Verificar dependências
echo "3. Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo "   Instalando dependências..."
    npm install
fi

# Rebuild
echo "4. Iniciando servidor de desenvolvimento..."
echo ""
echo "✅ Servidor iniciando em http://localhost:5173"
echo ""
npm run dev

