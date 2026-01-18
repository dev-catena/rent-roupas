#!/bin/bash

# Script para corrigir permissões no servidor Laravel
# Execute este script no servidor VPS

echo "🔧 Corrigindo permissões do Laravel..."

# Navegar para o diretório do projeto
cd /home/darley/vestme-api

# Criar diretórios se não existirem
mkdir -p storage/logs
mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p bootstrap/cache

# Corrigir permissões
# Se estiver usando root, não precisa de sudo
if [ "$EUID" -eq 0 ]; then
    chown -R www-data:www-data storage bootstrap/cache
    chmod -R 775 storage bootstrap/cache
    touch storage/logs/laravel.log
    chown www-data:www-data storage/logs/laravel.log
    chmod 664 storage/logs/laravel.log
else
    sudo chown -R www-data:www-data storage bootstrap/cache
    sudo chmod -R 775 storage bootstrap/cache
    sudo touch storage/logs/laravel.log
    sudo chown www-data:www-data storage/logs/laravel.log
    sudo chmod 664 storage/logs/laravel.log
fi

echo "✅ Permissões corrigidas!"

