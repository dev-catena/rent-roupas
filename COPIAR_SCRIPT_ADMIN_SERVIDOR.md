# 📤 Copiar Script de Admin para o Servidor

## Passo 1: Copiar o Script

Execute no seu computador local:

```bash
cd /home/darley/rent-roupa
scp -P 63022 criar-admin-producao.sh darley@72.61.34.177:/home/darley/vestme-api/
```

Você será solicitado a digitar a senha do servidor.

## Passo 2: Dar Permissão de Execução

Conecte no servidor e dê permissão:

```bash
ssh -p 63022 darley@72.61.34.177
cd /home/darley/vestme-api
chmod +x criar-admin-producao.sh
```

## Passo 3: Executar o Script

Ainda no servidor:

```bash
./criar-admin-producao.sh
```

O script oferecerá 3 opções:
1. Executar seeder (cria admin@vestme.com.br / admin123)
2. Tornar usuário existente admin
3. Criar novo usuário admin

## Alternativa: Executar Diretamente sem Script

Se preferir não copiar o script, você pode executar diretamente no servidor:

```bash
ssh -p 63022 darley@72.61.34.177
cd /home/darley/vestme-api

# Opção 1: Executar seeder (mais rápido)
php artisan db:seed --class=DefaultUserSeeder

# Isso criará:
# Email: admin@vestme.com.br
# Senha: admin123
```

## Depois de Criar o Admin

1. Volte ao web-admin
2. Recarregue a página (Ctrl+F5)
3. Faça login com o email e senha criados

