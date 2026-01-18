# 🚀 Guia de Instalação - Vestme

Este guia fornece instruções detalhadas para configurar o projeto Vestme em seu ambiente de desenvolvimento.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

### Backend
- **PHP**: versão 8.2 ou superior
- **Composer**: gerenciador de dependências do PHP
- **MySQL**: versão 8.0 ou superior
- **Git**: para clonar o repositório

### Frontend
- **Node.js**: versão 18 ou superior
- **npm** ou **yarn**: gerenciador de pacotes
- **Expo CLI**: `npm install -g expo-cli`

### Mobile Development (Opcional)
- **Android Studio**: para desenvolvimento Android
- **Xcode**: para desenvolvimento iOS (apenas macOS)
- **Expo Go**: app para testar em dispositivo físico

## 🔧 Instalação do Backend

### Passo 1: Preparar o Ambiente

```bash
# Verificar versão do PHP
php -v

# Verificar se o Composer está instalado
composer -v

# Verificar MySQL
mysql --version
```

### Passo 2: Criar o Banco de Dados

```bash
# Acessar o MySQL
mysql -u root -p

# Criar o banco de dados
CREATE DATABASE rent_roupa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Criar usuário (opcional)
CREATE USER 'rent_roupa'@'localhost' IDENTIFIED BY 'senha_segura';
GRANT ALL PRIVILEGES ON rent_roupa.* TO 'rent_roupa'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Passo 3: Configurar o Laravel

```bash
# Navegar até o diretório do projeto
cd /home/darley/rent-roupa

# Instalar dependências do Composer
composer install

# Copiar arquivo de ambiente
cp .env.example .env

# Editar o .env e configurar o banco de dados
nano .env
```

Configure as seguintes variáveis no `.env`:

```env
APP_NAME="Vestme"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rent_roupa
DB_USERNAME=root
DB_PASSWORD=sua_senha
```

### Passo 4: Configurar a Aplicação

```bash
# Gerar chave da aplicação
php artisan key:generate

# Executar as migrations
php artisan migrate

# Criar link simbólico para storage
php artisan storage:link

# Dar permissões (Linux/Mac)
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### Passo 5: Iniciar o Servidor

```bash
# Iniciar o servidor de desenvolvimento
php artisan serve

# Ou especificar host e porta
php artisan serve --host=0.0.0.0 --port=8000
```

A API estará disponível em: `http://localhost:8000`

### Teste da API

```bash
# Testar endpoint de status
curl http://localhost:8000/api

# Deve retornar:
# {"app":"Vestme API","version":"1.0.0","status":"running"}
```

## 📱 Instalação do Frontend Mobile

### Passo 1: Preparar o Ambiente

```bash
# Verificar Node.js
node -v

# Verificar npm
npm -v

# Instalar Expo CLI globalmente (se ainda não tiver)
npm install -g expo-cli

# Verificar instalação do Expo
expo --version
```

### Passo 2: Instalar Dependências

```bash
# Navegar até o diretório mobile
cd mobile

# Instalar dependências
npm install

# Ou usar yarn
yarn install
```

### Passo 3: Configurar a API

Edite o arquivo `src/config/api.js`:

```javascript
// Para Android Emulator
const API_URL = 'http://10.0.2.2:8000/api';

// Para iOS Simulator
const API_URL = 'http://localhost:8000/api';

// Para dispositivo físico (substitua pelo IP da sua máquina)
const API_URL = 'http://192.168.1.100:8000/api';
```

Para descobrir o IP da sua máquina:

**Linux/Mac:**
```bash
ifconfig | grep "inet "
```

**Windows:**
```bash
ipconfig
```

### Passo 4: Iniciar o Expo

```bash
# Iniciar o servidor Expo
npm start

# Ou
expo start
```

### Passo 5: Executar o App

**Opção 1: Android Emulator**
```bash
# Pressione 'a' no terminal do Expo
# Ou execute:
npm run android
```

**Opção 2: iOS Simulator (apenas macOS)**
```bash
# Pressione 'i' no terminal do Expo
# Ou execute:
npm run ios
```

**Opção 3: Dispositivo Físico**
1. Instale o app "Expo Go" no seu smartphone:
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Escaneie o QR Code que aparece no terminal
   - Android: use o próprio Expo Go para escanear
   - iOS: use a câmera do iPhone

## 🔍 Verificação da Instalação

### Backend

1. Acesse: `http://localhost:8000/api`
2. Você deve ver a resposta JSON com informações da API

### Frontend

1. O app deve abrir no emulador/dispositivo
2. Você deve ver a tela de boas-vindas
3. Teste o fluxo de registro:
   - Clique em "Criar Conta"
   - Preencha os dados
   - Obtenha localização (permitir permissões)
   - Finalize o cadastro

## 🐛 Solução de Problemas

### Backend

**Erro: Class 'PDO' not found**
```bash
# Ubuntu/Debian
sudo apt-get install php8.2-mysql

# macOS (com Homebrew)
brew install php@8.2
```

**Erro: permission denied no storage**
```bash
sudo chown -R www-data:www-data storage
sudo chown -R www-data:www-data bootstrap/cache
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

**Erro: SQLSTATE[HY000] [2002] Connection refused**
- Verifique se o MySQL está rodando: `sudo service mysql status`
- Verifique as credenciais no `.env`

### Frontend

**Erro: Unable to resolve module**
```bash
# Limpar cache e reinstalar
rm -rf node_modules
npm install
expo start -c
```

**Erro: Network request failed**
- Verifique se a API está rodando
- Verifique o IP configurado em `api.js`
- Certifique-se de que dispositivo e computador estão na mesma rede

**Erro: Expo Go não consegue conectar**
- Desative VPN se estiver usando
- Verifique firewall
- Use conexão via túnel: `expo start --tunnel`

## 📚 Próximos Passos

Após a instalação bem-sucedida:

1. **Crie um usuário de teste**: Use o app mobile para registrar
2. **Cadastre suas medidas**: Acesse Perfil > Minhas Medidas
3. **Adicione uma peça**: Navegue até "Minhas Peças"
4. **Explore o matching**: Veja as recomendações na tela inicial

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs:
   - Laravel: `storage/logs/laravel.log`
   - Expo: Terminal onde o Metro Bundler está rodando

2. Consulte a documentação:
   - [Laravel Documentation](https://laravel.com/docs)
   - [Expo Documentation](https://docs.expo.dev)
   - [React Native Documentation](https://reactnative.dev)

3. Issues conhecidas: Verifique o arquivo README.md

## ✅ Checklist de Instalação

- [ ] PHP 8.2+ instalado
- [ ] Composer instalado
- [ ] MySQL configurado
- [ ] Banco de dados criado
- [ ] Dependências do Laravel instaladas
- [ ] Arquivo .env configurado
- [ ] Migrations executadas
- [ ] API funcionando
- [ ] Node.js instalado
- [ ] Expo CLI instalado
- [ ] Dependências do React Native instaladas
- [ ] URL da API configurada
- [ ] App mobile funcionando

Parabéns! 🎉 Seu ambiente está configurado e pronto para desenvolvimento!

