# 🔒 Guia: Configurar SSL/HTTPS para api.vestme.cloud

## ✅ O que já foi feito

- ✅ Código do app atualizado para usar `https://api.vestme.cloud/api`
- ✅ Script de configuração criado (`configurar-ssl.sh`)
- ✅ Configuração do Nginx com SSL preparada (`nginx-ssl-config.conf`)

## 📋 Passos para Configurar SSL no Servidor

### 1. Conectar ao Servidor VPS

```bash
# Use o usuário darley (com sudo quando necessário)
ssh -p 63022 darley@72.61.34.177
```

### 2. Verificar se o DNS está configurado

Antes de continuar, certifique-se de que o domínio `api.vestme.cloud` está apontando para o IP `72.61.34.177`.

**Teste o DNS:**
```bash
nslookup api.vestme.cloud
# ou
dig api.vestme.cloud
```

O resultado deve mostrar o IP `72.61.34.177`.

### 3. Instalar Certbot (Let's Encrypt)

**⚠️ IMPORTANTE:** Use `sudo` para todos os comandos administrativos.

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### 4. Atualizar Configuração do Nginx

**Opção A: Usar o arquivo preparado (recomendado)**

```bash
# Copiar a configuração SSL para o Nginx
sudo cp /home/darley/vestme-api/nginx-ssl-config.conf /etc/nginx/sites-available/api.vestme.cloud

# Ou se estiver no diretório do projeto:
cd /home/darley/rent-roupa
sudo cp nginx-ssl-config.conf /etc/nginx/sites-available/api.vestme.cloud
```

**Opção B: Editar manualmente**

```bash
sudo nano /etc/nginx/sites-available/api.vestme.cloud
```

Cole o conteúdo do arquivo `nginx-ssl-config.conf` (mas **NÃO** descomente as linhas do certificado ainda - o Certbot fará isso).

### 5. Habilitar o Site (se ainda não estiver)

```bash
sudo ln -s /etc/nginx/sites-available/api.vestme.cloud /etc/nginx/sites-enabled/
```

### 6. Testar Configuração do Nginx

```bash
sudo nginx -t
```

Se tudo estiver OK, você verá:
```
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 7. Recarregar Nginx

```bash
sudo systemctl reload nginx
```

### 8. Obter Certificado SSL

**⚠️ IMPORTANTE:** Este comando precisa de privilégios de root (use sudo).

```bash
sudo certbot --nginx -d api.vestme.cloud
```

**Durante a execução:**
- Vai pedir seu email (para notificações)
- Vai perguntar se concorda com os termos
- Vai perguntar se quer compartilhar email (opcional)
- **Automaticamente configura o Nginx** com os certificados

**Durante a execução, o Certbot irá:**
- Solicitar seu email (para notificações de renovação)
- Perguntar se concorda com os termos
- Perguntar se quer compartilhar email com EFF (opcional)
- **Automaticamente configurar o Nginx** com os certificados
- Configurar renovação automática

### 9. Verificar Renovação Automática

```bash
# Testar renovação (dry-run)
sudo certbot renew --dry-run
```

### 10. Verificar se HTTPS está funcionando

```bash
# Testar a API
curl https://api.vestme.cloud/api/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"vestme@vestme.com","password":"vestme"}'
```

Ou acesse no navegador: `https://api.vestme.cloud/api`

### 11. Verificar Status do Certificado

```bash
sudo certbot certificates
```

## 🔄 Renovação Automática

O Certbot configura automaticamente um timer do systemd para renovar os certificados. Verifique:

```bash
sudo systemctl status certbot.timer
```

Os certificados do Let's Encrypt expiram a cada 90 dias, mas são renovados automaticamente.

## 🛠️ Troubleshooting

### Erro: "Failed to obtain certificate"

**Causa comum:** DNS não está apontando corretamente ou porta 80 bloqueada.

**Solução:**
1. Verifique o DNS: `nslookup api.vestme.cloud`
2. Verifique se a porta 80 está aberta: `sudo ufw status`
3. Se necessário, abra a porta: `sudo ufw allow 80/tcp`

### Erro: "Address already in use"

**Solução:**
```bash
# Verificar o que está usando a porta
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Parar serviços conflitantes se necessário
```

### Verificar Logs do Certbot

```bash
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Verificar Logs do Nginx

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 📝 Checklist Final

- [ ] DNS configurado (api.vestme.cloud → 72.61.34.177)
- [ ] Certbot instalado
- [ ] Configuração do Nginx atualizada
- [ ] Certificado SSL obtido
- [ ] HTTPS funcionando (teste com curl)
- [ ] Renovação automática configurada
- [ ] App mobile atualizado (já feito ✅)

## 🚀 Comandos Rápidos (Copy-Paste)

```bash
# 1. Instalar Certbot
sudo apt update && sudo apt install -y certbot python3-certbot-nginx

# 2. Obter certificado (o Certbot configura automaticamente)
sudo certbot --nginx -d api.vestme.cloud

# 3. Testar renovação
sudo certbot renew --dry-run

# 4. Verificar status
sudo certbot certificates
sudo nginx -t
sudo systemctl status nginx
```

## 📞 Próximos Passos

Após configurar o SSL:

1. ✅ **App já está configurado** para usar `https://api.vestme.cloud/api`
2. 🔄 **Gere novo build do APK** se necessário:
   ```bash
   cd mobile
   eas build --platform android --profile preview
   ```
3. 🧪 **Teste o app** para garantir que está conectando via HTTPS

---

**Nota:** O certificado Let's Encrypt é gratuito e válido por 90 dias, renovando automaticamente.

