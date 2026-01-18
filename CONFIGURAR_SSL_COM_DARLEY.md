# 🔒 Configurar SSL com usuário darley

## ✅ Passo a Passo Completo

### 1. Conectar ao servidor como darley

```bash
ssh -p 63022 darley@72.61.34.177
```

### 2. Instalar Certbot

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### 3. Verificar se o DNS está configurado

Antes de continuar, certifique-se de que `api.vestme.cloud` está apontando para `72.61.34.177`:

```bash
nslookup api.vestme.cloud
# ou
dig api.vestme.cloud
```

O resultado deve mostrar o IP `72.61.34.177`.

### 4. Verificar configuração do Nginx

Certifique-se de que o Nginx está configurado para o domínio:

```bash
sudo nginx -t
sudo cat /etc/nginx/sites-available/api.vestme.cloud
```

Se o arquivo não existir ou não estiver configurado corretamente, você pode usar o arquivo `nginx-ssl-config.conf` do projeto.

### 5. Obter certificado SSL

```bash
sudo certbot --nginx -d api.vestme.cloud
```

**Durante a execução, o Certbot irá:**
- Solicitar seu email (para notificações de renovação)
- Perguntar se concorda com os termos
- Perguntar se quer compartilhar email com EFF (opcional)
- **Automaticamente configurar o Nginx** com os certificados
- Configurar renovação automática

### 6. Verificar se está funcionando

```bash
# Testar HTTPS
curl https://api.vestme.cloud/api

# Ou testar login
curl https://api.vestme.cloud/api/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"vestme@vestme.com","password":"vestme"}'
```

### 7. Verificar renovação automática

```bash
# Testar renovação (dry-run)
sudo certbot renew --dry-run
```

### 8. Verificar status do certificado

```bash
sudo certbot certificates
```

## 🛠️ Troubleshooting

### Erro: "Failed to obtain certificate"

**Causa comum:** DNS não está apontando corretamente ou porta 80 bloqueada.

**Solução:**
```bash
# Verificar DNS
nslookup api.vestme.cloud

# Verificar se porta 80 está aberta
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Erro: "Address already in use"

**Solução:**
```bash
# Verificar o que está usando as portas
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### Verificar Logs

```bash
# Logs do Certbot
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 📝 Checklist

- [ ] DNS configurado (api.vestme.cloud → 72.61.34.177)
- [ ] Certbot instalado
- [ ] Nginx configurado para api.vestme.cloud
- [ ] Porta 80 aberta no firewall
- [ ] Certificado SSL obtido
- [ ] HTTPS funcionando (teste com curl)
- [ ] Renovação automática configurada

## 🎯 Comandos Rápidos (Copy-Paste)

```bash
# 1. Instalar Certbot
sudo apt update && sudo apt install -y certbot python3-certbot-nginx

# 2. Obter certificado (configura automaticamente)
sudo certbot --nginx -d api.vestme.cloud

# 3. Testar renovação
sudo certbot renew --dry-run

# 4. Verificar status
sudo certbot certificates
sudo nginx -t
sudo systemctl status nginx
```

