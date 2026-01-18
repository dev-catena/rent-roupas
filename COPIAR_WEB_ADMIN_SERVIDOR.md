# Instruções para Copiar Web Admin para o Servidor

## 1. Copiar a Migration

```bash
# Do seu computador local
scp -P 63022 database/migrations/2026_01_18_014218_add_is_admin_to_users_table.php darley@72.61.34.177:/home/darley/vestme-api/database/migrations/
```

## 2. Verificar se o campo is_blocked já existe

Antes de executar a migration, verifique se o campo `is_blocked` já existe na tabela `users`:

```bash
ssh -p 63022 darley@72.61.34.177
cd /home/darley/vestme-api
php artisan tinker
```

No tinker, execute:
```php
Schema::hasColumn('users', 'is_blocked');
Schema::hasColumn('users', 'is_admin');
```

Se `is_blocked` já existir, você pode precisar ajustar a migration para não tentar criar novamente.

## 3. Copiar o AdminController

```bash
# Do seu computador local
scp -P 63022 app/Http/Controllers/Api/AdminController.php darley@72.61.34.177:/home/darley/vestme-api/app/Http/Controllers/Api/
```

## 4. Atualizar o Model User

```bash
# Do seu computador local
scp -P 63022 app/Models/User.php darley@72.61.34.177:/home/darley/vestme-api/app/Models/
```

## 5. Atualizar as Rotas

```bash
# Do seu computador local
scp -P 63022 routes/api.php darley@72.61.34.177:/home/darley/vestme-api/routes/
```

## 6. No Servidor - Executar Migration

```bash
ssh -p 63022 darley@72.61.34.177
cd /home/darley/vestme-api
php artisan migrate
```

## 7. Criar um Usuário Administrador

```bash
php artisan tinker
```

No tinker:
```php
// Opção 1: Tornar um usuário existente admin
$user = \App\Models\User::where('email', 'seu@email.com')->first();
if ($user) {
    $user->update(['is_admin' => true, 'is_blocked' => false]);
    echo "Usuário {$user->name} agora é administrador\n";
}

// Opção 2: Criar novo usuário admin
$admin = \App\Models\User::create([
    'name' => 'Administrador',
    'email' => 'admin@rentroupa.com',
    'password' => \Hash::make('senha_segura_aqui'),
    'user_type' => 'owner',
    'is_admin' => true,
    'is_blocked' => false,
]);
echo "Usuário admin criado: {$admin->email}\n";
```

## 8. Limpar Cache

```bash
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan route:cache
```

## 9. Testar a API

```bash
# Testar login admin
curl -X POST http://localhost:8000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@rentroupa.com","password":"senha_segura_aqui"}'
```

## Nota sobre is_blocked

Se o campo `is_blocked` já existir na tabela, você pode precisar modificar a migration para verificar antes de criar:

```php
public function up(): void
{
    Schema::table('users', function (Blueprint $table) {
        if (!Schema::hasColumn('users', 'is_admin')) {
            $table->boolean('is_admin')->default(false)->after('user_type');
        }
        if (!Schema::hasColumn('users', 'is_blocked')) {
            $table->boolean('is_blocked')->default(false)->after('is_admin');
        }
    });
}
```

