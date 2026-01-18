#!/bin/bash

echo "=========================================="
echo "  Criando Usuários Padrão do Sistema"
echo "=========================================="
echo ""

cd "$(dirname "$0")"

# Verificar se estamos no diretório correto
if [ ! -f "artisan" ]; then
    echo "❌ Erro: Execute este script a partir do diretório raiz do projeto Laravel"
    exit 1
fi

echo "Executando seeder de usuários padrão..."
echo ""

php artisan db:seed --class=DefaultUserSeeder

echo ""
echo "=========================================="
echo "  Usuários criados com sucesso!"
echo "=========================================="
echo ""
echo "Credenciais de acesso:"
echo ""
echo "📱 Web Admin:"
echo "   Email: admin@vestme.com.br"
echo "   Senha: admin123"
echo ""
echo "📱 Mobile App:"
echo "   Costureira: costureira@gmail.com / 11111111"
echo "   Proprietário: owner@gmail.com / 11111111"
echo "   Cliente: cliente@gmail.com / 11111111"
echo ""

