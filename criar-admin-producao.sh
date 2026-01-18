#!/bin/bash

# Script para criar usuário admin no servidor de produção
# Execute este script NO SERVIDOR de produção

echo "=========================================="
echo "  Criar Usuário Admin - Servidor Produção"
echo "=========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "artisan" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto Laravel"
    echo "   cd /home/darley/vestme-api"
    exit 1
fi

echo "Opções:"
echo "1. Executar seeder (cria admin@vestme.com.br / admin123)"
echo "2. Tornar usuário existente admin"
echo "3. Criar novo usuário admin"
echo ""
read -p "Escolha uma opção (1, 2 ou 3): " opcao

if [ "$opcao" = "1" ]; then
    echo ""
    echo "Executando seeder..."
    php artisan db:seed --class=DefaultUserSeeder
    echo ""
    echo "✅ Usuário admin criado:"
    echo "   Email: admin@vestme.com.br"
    echo "   Senha: admin123"
    
elif [ "$opcao" = "2" ]; then
    read -p "Digite o email do usuário existente: " email
    if [ -z "$email" ]; then
        echo "❌ Email não pode estar vazio!"
        exit 1
    fi
    echo ""
    php artisan admin:create "$email" --make-existing
    
elif [ "$opcao" = "3" ]; then
    read -p "Digite o email do novo usuário: " email
    if [ -z "$email" ]; then
        echo "❌ Email não pode estar vazio!"
        exit 1
    fi
    echo ""
    php artisan admin:create "$email"
else
    echo "❌ Opção inválida!"
    exit 1
fi

echo ""
echo "=========================================="
echo "  ✅ Concluído!"
echo "=========================================="
echo ""
echo "Agora você pode fazer login no web-admin com:"
echo "  - Email: (o que você configurou)"
echo "  - Senha: (a que você definiu)"
echo ""

