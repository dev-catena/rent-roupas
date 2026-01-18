# 🔍 Verificar e Corrigir Configuração do Nginx

## Problema
O HTTPS está funcionando, mas `/api` retorna 404. Isso indica que o Nginx não está processando as rotas do Laravel corretamente.

## ✅ Verificar Configuração Atual

Execute no servidor:

```bash
# 1. Ver a configuração atual do Nginx
sudo cat /etc/nginx/sites-available/api.vestme.cloud

# 2. Verificar se está habilitado
ls -la /etc/nginx/sites-enabled/ | grep api.vestme.cloud

# 3. Testar configuração
sudo nginx -t

# 4. Ver logs de erro
sudo tail -20 /var/log/nginx/error.log
```

## 🔧 Corrigir Configuração

Se a configuração estiver incorreta, execute:

```bash
# 1. Fazer backup da configuração atual
sudo cp /etc/nginx/sites-available/api.vestme.cloud /etc/nginx/sites-available/api.vestme.cloud.backup

# 2. Verificar se o fastcgi_pass está correto
sudo grep -A 5 "location ~ \.php$" /etc/nginx/sites-available/api.vestme.cloud
```

**A configuração deve ter:**
```nginx
location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    include fastcgi_params;
    fastcgi_hide_header X-Powered-By;
}
```

## 🛠️ Se o fastcgi_pass estiver faltando ou incorreto

Edite o arquivo:

```bash
sudo nano /etc/nginx/sites-available/api.vestme.cloud
```

Certifique-se de que a seção `location ~ \.php$` tenha o `fastcgi_pass` correto.

Depois:

```bash
# Testar configuração
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx

# Testar novamente
curl https://api.vestme.cloud/api
```

## 🧪 Testar Rotas Específicas

```bash
# Testar rota de health check (se existir)
curl https://api.vestme.cloud/up

# Testar rota de API
curl https://api.vestme.cloud/api

# Testar login
curl https://api.vestme.cloud/api/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"vestme@vestme.com","password":"vestme"}'
```

