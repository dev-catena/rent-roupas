# 🔧 Solução Completa para Permissões

## ⚠️ Problema
Mesmo após corrigir as permissões, o usuário `darley` não consegue escrever nos diretórios porque eles pertencem a `www-data`.

## ✅ Solução: Adicionar darley ao grupo www-data OU dar permissões mais amplas

### Opção 1: Adicionar darley ao grupo www-data (RECOMENDADO)

Execute estes comandos no servidor:

```bash
# Adicionar darley ao grupo www-data
sudo usermod -a -G www-data darley

# Aplicar as mudanças (pode precisar fazer logout/login ou usar newgrp)
newgrp www-data

# Corrigir permissões novamente
cd /home/darley/vestme-api
sudo chown -R darley:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
sudo touch storage/logs/laravel.log
sudo chown darley:www-data storage/logs/laravel.log
sudo chmod 664 storage/logs/laravel.log

# Agora execute os comandos normalmente
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
sudo systemctl reload nginx
```

### Opção 2: Dar permissões mais amplas (menos seguro, mas funciona)

```bash
cd /home/darley/vestme-api

# Dar permissões mais amplas (darley como dono)
sudo chown -R darley:darley storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
sudo touch storage/logs/laravel.log
sudo chown darley:darley storage/logs/laravel.log
sudo chmod 664 storage/logs/laravel.log

# Mas garantir que www-data também possa escrever (adicionar ao grupo)
sudo chgrp -R www-data storage bootstrap/cache
sudo chmod -R g+w storage bootstrap/cache

# Agora execute os comandos
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
sudo systemctl reload nginx
```

### Opção 3: Usar root para tudo (MAIS SIMPLES)

Se você tem acesso root, use root para executar os comandos:

```bash
# Conecte como root
ssh -p 63022 root@72.61.34.177

cd /home/darley/vestme-api

# Criar diretórios e corrigir permissões
mkdir -p storage/logs storage/framework/{cache,sessions,views} bootstrap/cache
chown -R darley:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
touch storage/logs/laravel.log
chown darley:www-data storage/logs/laravel.log
chmod 664 storage/logs/laravel.log

# Executar comandos (como root, mas os arquivos pertencem a darley:www-data)
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
systemctl reload nginx
```

## 🎯 Recomendação Final

**Use a Opção 1** (adicionar darley ao grupo www-data). É a mais segura e permite que tanto o usuário darley quanto o servidor web (www-data) possam escrever nos arquivos.

