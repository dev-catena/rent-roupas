# Solução para Erro nas Rotas

O erro "Object of class Closure could not be converted to string" ocorre porque o arquivo `routes/api.php` no servidor ainda tem o closure em vez do middleware 'admin'.

## Solução Rápida

No servidor, edite o arquivo `routes/api.php` e substitua a linha 102:

**ANTES (errado):**
```php
Route::middleware(function ($request, $next) {
    $user = $request->user();
    if (!$user || !$user->is_admin) {
        return response()->json([
            'success' => false,
            'message' => 'Acesso negado. Você precisa ter permissão de administrador.'
        ], 403);
    }
    return $next($request);
})->prefix('admin')->group(function () {
```

**DEPOIS (correto):**
```php
Route::middleware('admin')->prefix('admin')->group(function () {
```

## Ou copie o arquivo correto do local:

Do seu computador local:
```bash
cd /home/darley/rent-roupa
scp -P 63022 routes/api.php darley@72.61.34.177:/home/darley/vestme-api/routes/
```

## Verificar se o middleware está registrado

No servidor, verifique se o arquivo `bootstrap/app.php` tem:

```php
$middleware->alias([
    'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
    'jwt.auth' => \App\Http\Middleware\JwtMiddleware::class,
    'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
]);
```

Se não tiver, copie do local:
```bash
scp -P 63022 bootstrap/app.php darley@72.61.34.177:/home/darley/vestme-api/bootstrap/
```

## Verificar se o middleware existe

No servidor:
```bash
ls -la app/Http/Middleware/EnsureUserIsAdmin.php
```

Se não existir, copie do local:
```bash
scp -P 63022 app/Http/Middleware/EnsureUserIsAdmin.php darley@72.61.34.177:/home/darley/vestme-api/app/Http/Middleware/
```

## Depois de corrigir, limpar cache:

```bash
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan route:cache
```

## Para criar o usuário admin (depois de copiar o comando):

```bash
# Copiar o comando do local:
scp -P 63022 app/Console/Commands/CreateAdminUser.php darley@72.61.34.177:/home/darley/vestme-api/app/Console/Commands/

# Depois executar:
php artisan admin:create seu@email.com --make-existing
```

