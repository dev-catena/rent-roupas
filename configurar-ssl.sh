#!/bin/bash

# Script para configurar SSL/HTTPS no servidor api.vestme.cloud
# Execute este script no servidor VPS

echo "🔒 Configurando SSL/HTTPS para api.vestme.cloud..."

# 1. Instalar Certbot (Let's Encrypt)
echo "📦 Instalando Certbot..."
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# 2. Verificar se o domínio está apontando para o servidor
echo "🌐 Verificando DNS..."
echo "Certifique-se de que api.vestme.cloud está apontando para o IP 72.61.34.177"
read -p "Pressione Enter quando o DNS estiver configurado..."

# 3. Obter certificado SSL
echo "🔐 Obtendo certificado SSL..."
sudo certbot --nginx -d api.vestme.cloud

# 4. Verificar renovação automática
echo "✅ Testando renovação automática..."
sudo certbot renew --dry-run

# 5. Recarregar Nginx
echo "🔄 Recarregando Nginx..."
sudo nginx -t
sudo systemctl reload nginx

echo "✅ SSL configurado com sucesso!"
echo "🌐 Acesse: https://api.vestme.cloud/api"

