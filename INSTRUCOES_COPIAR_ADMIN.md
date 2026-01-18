# Instruções para Copiar Arquivos Admin para o Servidor

## Opção 1: Usar o Script Automático (Recomendado)

Do seu computador local (onde está o projeto rent-roupa):

```bash
cd /home/darley/rent-roupa
./copiar-admin-servidor.sh
```

O script irá copiar todos os arquivos necessários automaticamente.

## Opção 2: Copiar Manualmente (um por um)

Do seu computador local (onde está o projeto rent-roupa):

```bash
cd /home/darley/rent-roupa

# 1. Comando CreateAdminUser
scp -P 63022 app/Console/Commands/CreateAdminUser.php darley@72.61.34.177:/home/darley/vestme-api/app/Console/Commands/

# 2. Middleware EnsureUserIsAdmin
scp -P 63022 app/Http/Middleware/EnsureUserIsAdmin.php darley@72.61.34.177:/home/darley/vestme-api/app/Http/Middleware/

# 3. Script shell
scp -P 63022 criar-admin.sh darley@72.61.34.177:/home/darley/vestme-api/

# 4. bootstrap/app.php
scp -P 63022 bootstrap/app.php darley@72.61.34.177:/home/darley/vestme-api/bootstrap/

# 5. routes/api.php
scp -P 63022 routes/api.php darley@72.61.34.177:/home/darley/vestme-api/routes/

# 6. AdminController
scp -P 63022 app/Http/Controllers/Api/AdminController.php darley@72.61.34.177:/home/darley/vestme-api/app/Http/Controllers/Api/

# 7. Model User
scp -P 63022 app/Models/User.php darley@72.61.34.177:/home/darley/vestme-api/app/Models/

# 8. Migration
scp -P 63022 database/migrations/2026_01_18_014218_add_is_admin_to_users_table.php darley@72.61.34.177:/home/darley/vestme-api/database/migrations/
```

## Depois, no Servidor

```bash
ssh -p 63022 darley@72.61.34.177
cd /home/darley/vestme-api

# 1. Executar migration
php artisan migrate

# 2. Criar/tornar usuário admin
php artisan admin:create seu@email.com --make-existing

# OU criar novo admin
php artisan admin:create admin@rentroupa.com

# 3. Limpar cache
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan route:cache
```

## Verificar se funcionou

Teste fazendo login no painel admin web com o email e senha do usuário admin.

