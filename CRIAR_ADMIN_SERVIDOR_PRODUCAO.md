# 🔐 Criar Usuário Admin no Servidor de Produção

## Problema
O web-admin agora está usando o servidor de produção (`https://api.vestme.cloud/api`), mas o email que você está tentando usar não existe no banco de dados do servidor de produção.

## Solução: Criar/Tornar Usuário Admin no Servidor

### Opção 1: Tornar um usuário existente admin (Recomendado)

Se você já tem um usuário no servidor de produção que quer tornar admin:

```bash
# Conecte no servidor
ssh -p 63022 darley@72.61.34.177
cd /home/darley/vestme-api

# Execute o comando
php artisan admin:create seu@email.com --make-existing
```

O comando irá:
- Verificar se o usuário existe
- Tornar ele admin (`is_admin = true`)
- Desbloquear se estiver bloqueado

### Opção 2: Criar novo usuário admin

```bash
# No servidor
ssh -p 63022 darley@72.61.34.177
cd /home/darley/vestme-api

# Execute o comando
php artisan admin:create admin@vestme.com.br
```

O comando irá perguntar:
- Nome do usuário
- Senha
- Tipo de usuário

### Opção 3: Usar Tinker (Mais controle)

```bash
# No servidor
ssh -p 63022 darley@72.61.34.177
cd /home/darley/vestme-api
php artisan tinker
```

Depois execute **uma linha por vez**:

**Para tornar usuário existente admin:**
```php
$user = \App\Models\User::where('email', 'seu@email.com')->first();
$user->is_admin = true;
$user->is_blocked = false;
$user->save();
$user->is_admin; // Verificar (deve retornar true)
```

**Para criar novo usuário admin:**
```php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

$admin = new User();
$admin->name = 'Administrador';
$admin->email = 'admin@vestme.com.br';
$admin->password = Hash::make('senha_segura_123');
$admin->user_type = 'owner';
$admin->is_admin = true;
$admin->is_blocked = false;
$admin->email_verified_at = now();
$admin->save();

echo "✅ Usuário criado: {$admin->email}\n";
```

### Opção 4: Usar o Seeder (Cria usuário padrão)

```bash
# No servidor
ssh -p 63022 darley@72.61.34.177
cd /home/darley/vestme-api
php artisan db:seed --class=DefaultUserSeeder
```

Isso criará:
- **Email:** `admin@vestme.com.br`
- **Senha:** `admin123`
- **Tipo:** Admin

## Verificar Usuários Existentes

Para ver quais usuários existem no servidor:

```bash
php artisan tinker
```

```php
\App\Models\User::select('id', 'name', 'email', 'is_admin', 'is_blocked')->get();
```

## Testar Login

Após criar/tornar admin, teste o login no web-admin:
1. Recarregue a página do web-admin
2. Use o email e senha do usuário admin
3. Deve funcionar!

## Nota Importante

O web-admin agora usa **sempre** o servidor de produção. Se você tinha um usuário admin apenas no banco local, ele não funcionará mais. Você precisa criar/tornar admin no servidor de produção.

