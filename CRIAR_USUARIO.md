# 👤 Criar Usuário para Acesso ao Projeto

## ✅ Usuário Padrão Existente

Já existe um usuário padrão configurado:

- **Email:** `vestme@vestme.com`
- **Senha:** `vestme`
- **Tipo:** `both` (pode alugar e emprestar)

## 🔧 Criar/Atualizar Usuário Padrão

### Opção 1: Usar Comando Artisan (MAIS SIMPLES - Recomendado)

No servidor ou localmente:

```bash
cd /home/darley/vestme-api  # ou caminho do projeto
php artisan user:create-default
```

Este comando criará ou atualizará o usuário padrão automaticamente.

### Opção 2: Usar o Seeder

```bash
cd /home/darley/vestme-api
php artisan db:seed --class=DefaultUserSeeder
```

### Opção 3: Usar Tinker (Mais Flexível)

```bash
cd /home/darley/vestme-api
php artisan tinker
```

Depois execute:

```php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Criar ou atualizar usuário
$user = User::firstOrCreate(
    ['email' => 'vestme@vestme.com'],
    [
        'name' => 'VestMe Admin',
        'password' => Hash::make('vestme'),
        'user_type' => 'both',
        'email_verified_at' => now(),
    ]
);

// Se o usuário já existir, atualizar senha
if (!$user->wasRecentlyCreated) {
    $user->password = Hash::make('vestme');
    $user->save();
}

echo "✅ Usuário: vestme@vestme.com\n";
echo "✅ Senha: vestme\n";
exit
```

### Opção 4: Criar Novo Usuário de Teste

```bash
cd /home/darley/vestme-api
php artisan tinker
```

```php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Criar novo usuário
$user = User::create([
    'name' => 'Usuário Teste',
    'email' => 'teste@vestme.com',
    'password' => Hash::make('senha123'),
    'user_type' => 'both', // ou 'renter', 'owner', 'professional'
    'email_verified_at' => now(),
]);

echo "✅ Usuário criado!\n";
echo "Email: {$user->email}\n";
echo "Senha: senha123\n";
exit
```

## 📱 Testar Login no App

Após criar o usuário, você pode testar no app mobile:

1. Abra o app no Expo Go
2. Na tela de login, use:
   - **Email:** `vestme@vestme.com`
   - **Senha:** `vestme`

## 🧪 Testar Login via API

```bash
curl https://api.vestme.cloud/api/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"vestme@vestme.com","password":"vestme"}'
```

## 📋 Tipos de Usuário

- `renter` - Apenas aluga roupas
- `owner` - Apenas empresta roupas
- `professional` - Profissional (alfaiate/costureiro)
- `both` - Pode alugar e emprestar

## 🔐 Alterar Senha do Usuário

```bash
cd /home/darley/vestme-api
php artisan tinker
```

```php
use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::where('email', 'vestme@vestme.com')->first();
$user->password = Hash::make('nova_senha_aqui');
$user->save();

echo "✅ Senha alterada!\n";
exit
```

## 📝 Listar Todos os Usuários

```bash
cd /home/darley/vestme-api
php artisan tinker
```

```php
use App\Models\User;

$users = User::all(['id', 'name', 'email', 'user_type']);
foreach ($users as $user) {
    echo "ID: {$user->id} | {$user->name} | {$user->email} | Tipo: {$user->user_type}\n";
}
exit
```

## 🚀 Comando Rápido (Copy-Paste)

Para criar/atualizar o usuário padrão no servidor:

```bash
# Opção mais simples (usando comando artisan)
ssh -p 63022 darley@72.61.34.177 'cd /home/darley/vestme-api && php artisan user:create-default'

# Ou usando tinker (mais verboso)
ssh -p 63022 darley@72.61.34.177 'cd /home/darley/vestme-api && php artisan tinker << EOF
use App\Models\User;
use Illuminate\Support\Facades\Hash;
\$user = User::firstOrCreate(
    ["email" => "vestme@vestme.com"],
    [
        "name" => "VestMe Admin",
        "password" => Hash::make("vestme"),
        "user_type" => "both",
        "email_verified_at" => now(),
    ]
);
if (!\$user->wasRecentlyCreated) {
    \$user->password = Hash::make("vestme");
    \$user->save();
}
echo "✅ Usuário: vestme@vestme.com\n";
echo "✅ Senha: vestme\n";
exit
EOF'
```

---

**Nota:** O usuário padrão já foi testado e está funcionando. Você pode usar essas credenciais para acessar o app.

