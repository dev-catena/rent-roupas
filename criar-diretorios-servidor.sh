#!/bin/bash

# Script para criar diretórios necessários no servidor

SERVER="darley@72.61.34.177"
PORT="63022"
REMOTE_PATH="/home/darley/vestme-api"

echo "=========================================="
echo "  Criando diretórios no servidor"
echo "=========================================="
echo ""

ssh -p $PORT $SERVER "mkdir -p $REMOTE_PATH/app/Console/Commands"
ssh -p $PORT $SERVER "mkdir -p $REMOTE_PATH/app/Http/Middleware"
ssh -p $PORT $SERVER "mkdir -p $REMOTE_PATH/app/Http/Controllers/Api"
ssh -p $PORT $SERVER "mkdir -p $REMOTE_PATH/app/Models"
ssh -p $PORT $SERVER "mkdir -p $REMOTE_PATH/database/migrations"
ssh -p $PORT $SERVER "mkdir -p $REMOTE_PATH/bootstrap"
ssh -p $PORT $SERVER "mkdir -p $REMOTE_PATH/routes"

echo "✅ Diretórios criados!"
echo ""
echo "Agora execute o script corrigir-servidor.sh para copiar os arquivos"

