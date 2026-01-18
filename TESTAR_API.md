# 🧪 Testar API - Comandos

## ✅ O que está funcionando

- ✅ HTTPS configurado e funcionando
- ✅ Certificado SSL válido
- ✅ Nginx configurado corretamente
- ✅ Laravel rodando

## 🧪 Testar Rotas Específicas

O Laravel não tem uma rota para `/api` sozinho. Você precisa testar rotas específicas:

### 1. Testar Health Check (se existir)

```bash
curl https://api.vestme.cloud/up
```

### 2. Testar Rota de Login (pública)

```bash
curl https://api.vestme.cloud/api/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"vestme@vestme.com","password":"vestme"}'
```

### 3. Testar Listar Peças (pública)

```bash
curl https://api.vestme.cloud/api/clothing-items
```

### 4. Verificar Rotas Disponíveis

No servidor, execute:

```bash
cd /home/darley/vestme-api
php artisan route:list | grep api
```

Isso mostrará todas as rotas da API disponíveis.

### 5. Testar com Verbose (para ver detalhes)

```bash
curl -v https://api.vestme.cloud/api/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"vestme@vestme.com","password":"vestme"}'
```

## 🔍 Verificar Logs se Houver Erro

```bash
# Logs do Laravel
tail -50 /home/darley/vestme-api/storage/logs/laravel.log

# Logs do Nginx
sudo tail -50 /var/log/nginx/error.log
sudo tail -50 /var/log/nginx/access.log
```

## 📝 Resumo

- `/api` sozinho retorna 404 (normal, não há rota definida)
- `/api/login` deve funcionar
- `/api/register` deve funcionar
- `/api/clothing-items` deve funcionar

