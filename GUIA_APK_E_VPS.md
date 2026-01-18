# Guia Completo: Gerar APK e Atualizar VPS

## 📱 Gerar APK do App

### Pré-requisitos

1. **Conta Expo** (gratuita)
   - Acesse: https://expo.dev
   - Crie uma conta ou faça login

2. **EAS CLI instalado**
   ```bash
   npm install -g eas-cli
   ```

3. **Login no EAS**
   ```bash
   cd mobile
   eas login
   ```
   - Use suas credenciais do Expo

### Gerar APK

```bash
cd mobile
eas build --platform android --profile preview
```

**Nota:** O build é feito na nuvem (não precisa de Android Studio local).

### Verificar Status do Build e Listar Versões

```bash
cd mobile
eas build:list --platform android --limit 10
```

**Saída mostra:**
- ID do build
- Status (finished, in-progress, erro, etc.)
- Versão do app
- Data de criação
- URL de download

### Ver Última Versão Disponível

```bash
cd mobile
eas build:list --platform android --limit 1 --json
```

### Baixar APK Gerado

1. **Via terminal (copiar URL):**
   ```bash
   cd mobile
   eas build:list --platform android --limit 1
   ```
   - Copie a URL do download (ex: `https://expo.dev/artifacts/eas/...`)

2. **Via navegador:**
   - Acesse: https://expo.dev/accounts/[seu-usuario]/builds
   - Clique no build mais recente
   - Baixe o APK

3. **Download direto (se tiver URL):**
   ```bash
   wget "https://expo.dev/artifacts/eas/[ID_DO_BUILD].apk"
   ```

### Atualizar Versão do App

Edite `mobile/app.json`:
```json
{
  "expo": {
    "version": "1.0.1",  // Incremente aqui
    "android": {
      "versionCode": 2  // Incremente aqui também
    }
  }
}
```

Depois gere novo build:
```bash
cd mobile
eas build --platform android --profile preview
```

---

## 🖥️ Atualizar Software na VPS

### Informações do Servidor

- **IP:** 72.61.34.177
- **Porta SSH:** 63022
- **Usuários:** `root` ou `darley` (darley precisa de sudo)
- **Pasta:** `/home/darley/vestme-api`

### Comandos Básicos de Atualização

#### 1. Conectar ao Servidor
```bash
# Opção 1: Como root (recomendado)
ssh -p 63022 root@72.61.34.177

# Opção 2: Como usuário darley (precisa de sudo)
ssh -p 63022 darley@72.61.34.177
```

#### 2. Atualizar Código do Backend

```bash
cd /home/darley/vestme-api

# Atualizar do Git (se usar Git)
git pull origin main

# OU fazer upload manual via SCP
# (no seu computador local)
# Nota: Copie apenas os diretórios que existem no seu projeto
scp -P 63022 -r app/ root@72.61.34.177:/home/darley/vestme-api/
# Se tiver routes/ e database/:
# scp -P 63022 -r routes/ database/ root@72.61.34.177:/home/darley/vestme-api/
```

#### 3. Instalar/Atualizar Dependências

```bash
cd /home/darley/vestme-api
composer install --no-dev --optimize-autoloader
```

#### 4. Executar Migrations (se houver novas)

```bash
php artisan migrate --force
```

#### 5. Corrigir Permissões (IMPORTANTE - faça antes de limpar caches)

```bash
# Criar diretórios necessários
mkdir -p storage/logs storage/framework/{cache,sessions,views} bootstrap/cache

# Se estiver como root:
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
touch storage/logs/laravel.log
chown www-data:www-data storage/logs/laravel.log
chmod 664 storage/logs/laravel.log

# Se estiver como darley (use sudo):
# sudo chown -R www-data:www-data storage bootstrap/cache
# sudo chmod -R 775 storage bootstrap/cache
# sudo touch storage/logs/laravel.log
# sudo chown www-data:www-data storage/logs/laravel.log
# sudo chmod 664 storage/logs/laravel.log
```

#### 6. Limpar e Recriar Caches

```bash
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
```

#### 7. Recarregar Nginx

```bash
# Se estiver como root:
nginx -t  # Testar configuração
systemctl reload nginx

# Se estiver como darley (use sudo):
# sudo nginx -t
# sudo systemctl reload nginx
```

#### 7. Verificar Status dos Serviços

```bash
sudo systemctl status nginx
sudo systemctl status php8.2-fpm
```

---

## 📋 Comandos Úteis para Dia-a-Dia

### Ver Logs do Laravel

```bash
tail -50 /home/darley/vestme-api/storage/logs/laravel.log
```

### Ver Logs do Nginx

```bash
sudo tail -50 /var/log/nginx/error.log
sudo tail -50 /var/log/nginx/access.log
```

### Testar API

```bash
curl http://72.61.34.177/api/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"vestme@vestme.com","password":"vestme"}'
```

### Verificar Rotas da API

```bash
cd /home/darley/vestme-api
php artisan route:list | grep api
```

### Criar/Atualizar Usuário Padrão

```bash
cd /home/darley/vestme-api
php artisan tinker
```

```php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::firstOrCreate(
    ['email' => 'vestme@vestme.com'],
    [
        'name' => 'VestMe',
        'password' => Hash::make('vestme'),
        'user_type' => 'both',
        'email_verified_at' => now(),
    ]
);

if (!$user->wasRecentlyCreated) {
    $user->password = Hash::make('vestme');
    $user->save();
}

echo "✅ Usuário: vestme@vestme.com\n";
echo "✅ Senha: vestme\n";
exit
```

### Corrigir Permissões (se necessário)

**Opção 1: Usando root (recomendado)**
```bash
ssh -p 63022 root@72.61.34.177
cd /home/darley/vestme-api
mkdir -p storage/logs storage/framework/{cache,sessions,views} bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
touch storage/logs/laravel.log
chown www-data:www-data storage/logs/laravel.log
chmod 664 storage/logs/laravel.log
```

**Opção 2: Usando usuário darley (com sudo)**
```bash
ssh -p 63022 darley@72.61.34.177
cd /home/darley/vestme-api
mkdir -p storage/logs storage/framework/{cache,sessions,views} bootstrap/cache
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
sudo touch storage/logs/laravel.log
sudo chown www-data:www-data storage/logs/laravel.log
sudo chmod 664 storage/logs/laravel.log
```

---

## 🔄 Fluxo Completo de Atualização

### 1. Atualizar Backend na VPS

```bash
# No servidor
ssh -p 63022 root@72.61.34.177
cd /home/darley/vestme-api
git pull  # ou fazer upload manual
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:clear
php artisan route:clear
php artisan cache:clear
php artisan config:cache
php artisan route:cache
sudo systemctl reload nginx
```

### 2. Atualizar App Mobile

```bash
# No seu computador
cd mobile
# Editar app.json (incrementar version e versionCode)
eas build --platform android --profile preview
```

### 3. Baixar e Instalar Nova APK

```bash
# Listar builds
eas build:list --platform android --limit 1

# Baixar via URL ou acessar expo.dev
```

---

## 📝 Checklist de Deploy

- [ ] Código atualizado no servidor
- [ ] Dependências instaladas (`composer install`)
- [ ] Migrations executadas (se houver)
- [ ] Caches limpos e recriados
- [ ] Nginx recarregado
- [ ] API testada (`curl`)
- [ ] Permissões verificadas
- [ ] Logs verificados (sem erros)

---

## 🆘 Troubleshooting Rápido

### API retorna 404
```bash
sudo nginx -t
sudo systemctl reload nginx
```

### Erro de permissão
```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

### Erro de conexão no app
- Verificar URL em `mobile/src/config/api.js`
- Deve ser: `http://72.61.34.177/api` (ou `https://api.vestme.cloud/api` se SSL configurado)

### Build do APK falha
- Verificar `mobile/app.json` (não pode estar vazio)
- Verificar `mobile/eas.json`
- Fazer login novamente: `eas login`

---

## 📌 Comandos Rápidos (Copy-Paste)

### Atualizar VPS
# ⚠️ IMPORTANTE: Comandos com sudo não funcionam em um único comando SSH
# Use o usuário root ou conecte ao servidor primeiro

# ✅ Comando completo (como root - RECOMENDADO):
ssh -p 63022 root@72.61.34.177 'cd /home/darley/vestme-api && mkdir -p storage/logs storage/framework/{cache,sessions,views} bootstrap/cache && chown -R www-data:www-data storage bootstrap/cache && chmod -R 775 storage bootstrap/cache && touch storage/logs/laravel.log && chown www-data:www-data storage/logs/laravel.log && chmod 664 storage/logs/laravel.log && composer install --no-dev --optimize-autoloader && php artisan migrate --force && php artisan config:clear && php artisan route:clear && php artisan cache:clear && php artisan config:cache && php artisan route:cache && systemctl reload nginx'

# ⚠️ Para usuário darley: Conecte ao servidor primeiro e execute os comandos separadamente
# (sudo precisa de senha interativa)

### Gerar APK
```bash
cd mobile && eas build --platform android --profile preview
```

### Listar Builds (Últimas Versões)
```bash
cd mobile && eas build:list --platform android --limit 10
```

### Ver Apenas Builds Concluídos
```bash
cd mobile && eas build:list --platform android --limit 10 --status finished
```

### Ver Build Mais Recente com Detalhes
```bash
cd mobile && eas build:view $(eas build:list --platform android --limit 1 --json | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
```

