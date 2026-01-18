# 🔧 Comando para Corrigir Permissões

## ⚠️ Problema
O erro mostra que os diretórios `storage` e `bootstrap/cache` não têm permissões de escrita.

## ✅ Solução: Use o usuário ROOT (recomendado)

Como o `sudo` precisa de senha quando executado via SSH em um comando único, a melhor solução é usar o usuário `root` que não precisa de `sudo`:

```bash
ssh -p 63022 root@72.61.34.177 'cd /home/darley/vestme-api && mkdir -p storage/logs storage/framework/{cache,sessions,views} bootstrap/cache && chown -R darley:www-data storage bootstrap/cache && chmod -R 775 storage bootstrap/cache && touch storage/logs/laravel.log && chown darley:www-data storage/logs/laravel.log && chmod 664 storage/logs/laravel.log && composer install --no-dev --optimize-autoloader && php artisan migrate --force && php artisan config:clear && php artisan route:clear && php artisan cache:clear && php artisan config:cache && php artisan route:cache && systemctl reload nginx'
```

**Nota:** Este comando usa `darley:www-data` como dono:grupo, permitindo que tanto darley quanto www-data escrevam nos arquivos.

## 📝 Ou faça passo a passo (conectando ao servidor):

### Opção 1: Como root (sem sudo)

1. **Conecte ao servidor:**
```bash
ssh -p 63022 root@72.61.34.177
```

2. **Execute os comandos:**
```bash
cd /home/darley/vestme-api

# Criar diretórios
mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache

# Corrigir permissões (darley como dono, www-data como grupo - permite ambos escreverem)
chown -R darley:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
touch storage/logs/laravel.log
chown darley:www-data storage/logs/laravel.log
chmod 664 storage/logs/laravel.log

# Instalar dependências e atualizar
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache

# Recarregar Nginx
systemctl reload nginx
```

### Opção 2: Como usuário darley (SOLUÇÃO CORRETA)

**⚠️ IMPORTANTE:** O problema é que `darley` executa os comandos, mas os diretórios pertencem a `www-data`. 
Solução: adicionar `darley` ao grupo `www-data` OU mudar o dono para `darley:www-data`.

1. **Conecte ao servidor:**
```bash
ssh -p 63022 darley@72.61.34.177
```

2. **Adicione darley ao grupo www-data:**
```bash
sudo usermod -a -G www-data darley
newgrp www-data  # Aplicar mudanças sem fazer logout
```

3. **Execute os comandos:**
```bash
cd /home/darley/vestme-api

# Criar diretórios
mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache

# Corrigir permissões (darley como dono, www-data como grupo)
sudo chown -R darley:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
sudo touch storage/logs/laravel.log
sudo chown darley:www-data storage/logs/laravel.log
sudo chmod 664 storage/logs/laravel.log

# Agora os comandos funcionarão (darley pode escrever)
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache

# Recarregar Nginx
sudo systemctl reload nginx
```

**Nota:** Se `newgrp` não funcionar, faça logout e login novamente para aplicar as mudanças do grupo.

## 🎯 Recomendação

**Use o usuário `root`** para evitar problemas com sudo em comandos remotos. É mais simples e direto.
