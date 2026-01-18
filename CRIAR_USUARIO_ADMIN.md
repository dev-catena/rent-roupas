# Como Criar um Usuário Administrador

## Opção 1: Tornar um usuário existente admin

No tinker (`php artisan tinker`), execute linha por linha:

```php
$user = \App\Models\User::where('email', 'seu@email.com')->first();
```

Se retornar um usuário, continue:

```php
$user->is_admin = true;
$user->is_blocked = false;
$user->save();
```

Verificar:

```php
$user->is_admin;
```

## Opção 2: Criar novo usuário admin

No tinker, execute:

```php
$admin = new \App\Models\User();
$admin->name = 'Administrador';
$admin->email = 'admin@rentroupa.com';
$admin->password = \Hash::make('senha_segura_123');
$admin->user_type = 'owner';
$admin->is_admin = true;
$admin->is_blocked = false;
$admin->save();
```

Verificar:

```php
$admin->is_admin;
```

## Opção 3: Usar um comando Artisan (mais seguro)

Crie um comando artisan para isso:

```bash
php artisan make:command CreateAdminUser
```

Depois edite o arquivo criado e adicione a lógica.

## Opção 4: Via SQL direto (se tiver acesso ao banco)

```sql
UPDATE users SET is_admin = 1, is_blocked = 0 WHERE email = 'seu@email.com';
```

Ou criar novo:

```sql
INSERT INTO users (name, email, password, user_type, is_admin, is_blocked, created_at, updated_at) 
VALUES ('Administrador', 'admin@rentroupa.com', '$2y$10$...', 'owner', 1, 0, NOW(), NOW());
```

(Nota: Para o INSERT, você precisa gerar o hash da senha primeiro)

