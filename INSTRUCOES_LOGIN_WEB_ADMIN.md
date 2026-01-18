# 🔐 Instruções para Login no Web-Admin

## Problema Atual
O web-admin está usando o servidor de produção, mas o email que você está tentando usar não existe no banco de dados do servidor.

## Solução Rápida

### No Servidor de Produção:

```bash
ssh -p 63022 darley@72.61.34.177
cd /home/darley/vestme-api
php artisan db:seed --class=DefaultUserSeeder
```

Isso criará o usuário admin padrão:
- **Email:** `admin@vestme.com.br`
- **Senha:** `admin123`

### Depois, no Web-Admin:
1. Recarregue a página
2. Faça login com:
   - Email: `admin@vestme.com.br`
   - Senha: `admin123`

## Outras Opções

### Opção 1: Usar o Script
```bash
# No servidor
./criar-admin-producao.sh
```

### Opção 2: Tornar Usuário Existente Admin
```bash
# No servidor
php artisan admin:create seu@email.com --make-existing
```

### Opção 3: Criar Novo Admin
```bash
# No servidor
php artisan admin:create novo@email.com
```

## Verificar Usuários Existentes

Para ver quais usuários existem no servidor:

```bash
php artisan tinker
```

```php
\App\Models\User::select('id', 'name', 'email', 'is_admin', 'is_blocked')->get();
```

## Importante

O web-admin agora **sempre** usa o servidor de produção (`https://api.vestme.cloud/api`). 

Se você tinha um usuário admin apenas no banco local, ele não funcionará mais. Você precisa criar/tornar admin no servidor de produção.

