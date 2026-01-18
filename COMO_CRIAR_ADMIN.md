# Como Criar Usuário Administrador na Produção

## Método 1: Usando o Comando Artisan (Recomendado)

### Tornar um usuário existente admin:
```bash
php artisan admin:create seu@email.com --make-existing
```

### Criar novo usuário admin:
```bash
php artisan admin:create admin@rentroupa.com
```

O comando irá perguntar:
- Nome do usuário
- Senha (se for novo)
- Tipo de usuário

## Método 2: Usando o Script Shell

```bash
./criar-admin.sh
```

O script irá perguntar se você quer:
1. Tornar um usuário existente admin
2. Criar novo usuário admin

## Método 3: Direto no Tinker (Linha por linha)

```bash
php artisan tinker
```

Depois execute **uma linha por vez**:

```php
$user = \App\Models\User::where('email', 'seu@email.com')->first();
```

Se retornar um usuário (não null):

```php
$user->is_admin = true;
$user->is_blocked = false;
$user->save();
```

Verificar:

```php
$user->is_admin;
```

## Método 4: SQL Direto (se tiver acesso ao banco)

```sql
UPDATE users SET is_admin = 1, is_blocked = 0 WHERE email = 'seu@email.com';
```

## Verificar se funcionou

Teste fazendo login no painel admin com o email e senha do usuário.

