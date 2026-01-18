#!/bin/bash

# Script para criar usuário administrador na produção

echo "=========================================="
echo "  Criar Usuário Administrador - Rent Roupa"
echo "=========================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "artisan" ]; then
    echo "❌ Erro: Execute este script no diretório raiz do projeto Laravel"
    exit 1
fi

echo "Opções:"
echo "1. Tornar um usuário existente administrador"
echo "2. Criar novo usuário administrador"
echo ""
read -p "Escolha uma opção (1 ou 2): " opcao

if [ "$opcao" = "1" ]; then
    read -p "Digite o email do usuário existente: " email
    php artisan admin:create "$email" --make-existing
elif [ "$opcao" = "2" ]; then
    read -p "Digite o email do novo usuário: " email
    php artisan admin:create "$email"
else
    echo "❌ Opção inválida!"
    exit 1
fi

echo ""
echo "✅ Concluído!"

