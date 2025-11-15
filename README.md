# 👗 Rent Roupa

Sistema completo de aluguel de roupas e sapatos para eventos e festas, conectando pessoas que precisam de roupas com quem pode emprestar e com profissionais que podem ajustar.

## 📋 Sobre o Projeto

O Rent Roupa é uma plataforma que facilita o aluguel de roupas para eventos, oferecendo:

- **Matching Inteligente**: Algoritmo que recomenda peças baseado nas medidas corporais do usuário
- **Geolocalização**: Encontra peças e profissionais mais próximos
- **Rede de Profissionais**: Conecta com alfaiates e costureiros para ajustes
- **Negociação Facilitada**: Sistema de chat para negociar valores e condições
- **Gestão Completa**: Acompanhamento de todo o ciclo do aluguel

## 🏗️ Arquitetura

### Backend (Laravel 11 + MySQL)

```
/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php
│   │   │       ├── UserController.php
│   │   │       ├── ClothingItemController.php
│   │   │       ├── MatchingController.php
│   │   │       ├── RentalController.php
│   │   │       ├── ProfessionalController.php
│   │   │       └── NegotiationController.php
│   │   └── Middleware/
│   ├── Models/
│   │   ├── User.php
│   │   ├── UserMeasurement.php
│   │   ├── ClothingItem.php
│   │   ├── ClothingPhoto.php
│   │   ├── Professional.php
│   │   ├── Rental.php
│   │   ├── Negotiation.php
│   │   └── NegotiationMessage.php
│   └── Services/
│       └── MatchingService.php
├── database/
│   └── migrations/
├── routes/
│   └── api.php
└── config/
```

### Frontend (React Native + Expo)

```
mobile/
├── src/
│   ├── config/
│   │   └── api.js
│   ├── contexts/
│   │   └── AuthContext.js
│   ├── navigation/
│   │   ├── RootNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── AppNavigator.js
│   └── screens/
│       ├── Auth/
│       │   ├── WelcomeScreen.js
│       │   ├── LoginScreen.js
│       │   └── RegisterScreen.js
│       ├── Home/
│       │   └── HomeScreen.js
│       ├── Search/
│       │   └── SearchScreen.js
│       ├── Item/
│       │   └── ItemDetailScreen.js
│       ├── MyItems/
│       │   ├── MyItemsScreen.js
│       │   └── AddItemScreen.js
│       ├── Profile/
│       │   ├── ProfileScreen.js
│       │   └── MeasurementsScreen.js
│       ├── Rentals/
│       │   └── RentalsScreen.js
│       └── Chat/
│           ├── ChatsScreen.js
│           └── ChatDetailScreen.js
├── App.js
├── app.json
└── package.json
```

## 🚀 Instalação e Configuração

### Pré-requisitos

- PHP 8.2+
- Composer
- MySQL 8.0+
- Node.js 18+
- Expo CLI
- Android Studio / Xcode (para desenvolvimento mobile)

### Backend (Laravel)

1. **Clone o repositório e navegue até o diretório**

```bash
cd /home/darley/rent-roupa
```

2. **Instale as dependências do PHP**

```bash
composer install
```

3. **Configure o arquivo .env**

```bash
cp .env.example .env
```

Edite o `.env` e configure:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rent_roupa
DB_USERNAME=root
DB_PASSWORD=sua_senha
```

4. **Gere a chave da aplicação**

```bash
php artisan key:generate
```

5. **Execute as migrations**

```bash
php artisan migrate
```

6. **Crie o link simbólico para storage**

```bash
php artisan storage:link
```

7. **Inicie o servidor**

```bash
php artisan serve
```

A API estará disponível em `http://localhost:8000`

### Frontend (React Native)

1. **Navegue até o diretório mobile**

```bash
cd mobile
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure a URL da API**

Edite `src/config/api.js` e ajuste a URL da API:

```javascript
const API_URL = 'http://seu-ip:8000/api';
```

Para Android Emulator use: `http://10.0.2.2:8000/api`
Para dispositivo físico use o IP da sua máquina na rede local

4. **Inicie o Expo**

```bash
npm start
```

5. **Execute no dispositivo/emulador**

- Pressione `a` para Android
- Pressione `i` para iOS
- Escaneie o QR Code com o app Expo Go (dispositivo físico)

## 📱 Funcionalidades

### Para Usuários que Alugam

- ✅ Cadastro com medidas biométricas completas
- ✅ Busca inteligente de peças por compatibilidade de medidas
- ✅ Visualização de peças próximas geograficamente
- ✅ Negociação direta com proprietários
- ✅ Solicitação de ajustes com profissionais
- ✅ Acompanhamento do status do aluguel
- ✅ Sistema de avaliações

### Para Proprietários

- ✅ Cadastro de peças com múltiplas fotos
- ✅ Definição de medidas detalhadas das peças
- ✅ Gerenciamento de disponibilidade
- ✅ Chat com interessados
- ✅ Controle de aluguéis ativos
- ✅ Histórico de transações

### Para Profissionais (Alfaiates/Costureiros)

- ✅ Cadastro como profissional
- ✅ Definição de especialidades e preços
- ✅ Geolocalização do ateliê
- ✅ Recebimento de solicitações de ajustes
- ✅ Sistema de avaliações

## 🔧 Algoritmo de Matching

O sistema utiliza um algoritmo inteligente que calcula a compatibilidade entre usuário e peça baseado em:

### Parâmetros de Compatibilidade

1. **Medidas Corporais (60% do score)**
   - Ombros
   - Busto/Peitoral
   - Cintura
   - Quadril
   - Entrepernas
   - Número do sapato

2. **Proximidade Geográfica (40% do score)**
   - 0-5 km: 40 pontos
   - 5-10 km: 30 pontos
   - 10-20 km: 20 pontos
   - 20-50 km: 10 pontos

3. **Bônus Adicionais**
   - Avaliação da peça (até 10 pontos)
   - Popularidade (até 5 pontos)

## 📊 Banco de Dados

### Principais Tabelas

- **users**: Dados dos usuários
- **user_measurements**: Medidas biométricas
- **clothing_items**: Peças de roupa
- **clothing_photos**: Fotos das peças
- **professionals**: Dados dos profissionais
- **rentals**: Aluguéis
- **negotiations**: Negociações
- **negotiation_messages**: Mensagens
- **professional_reviews**: Avaliações de profissionais

## 🔐 Autenticação

O sistema utiliza Laravel Sanctum para autenticação baseada em tokens:

- Registro de usuário
- Login
- Logout
- Refresh token
- Proteção de rotas

## 🌐 Endpoints da API

### Autenticação
```
POST   /api/register
POST   /api/login
POST   /api/logout
GET    /api/me
```

### Usuário
```
GET    /api/user/profile
PUT    /api/user/profile
PUT    /api/user/measurements
POST   /api/user/avatar
```

### Peças de Roupa
```
GET    /api/clothing-items
GET    /api/clothing-items/{id}
POST   /api/clothing-items
PUT    /api/clothing-items/{id}
DELETE /api/clothing-items/{id}
POST   /api/clothing-items/{id}/photos
GET    /api/my-items
```

### Matching
```
POST   /api/matching/search
GET    /api/matching/recommendations
```

### Aluguéis
```
GET    /api/rentals
POST   /api/rentals
GET    /api/rentals/{id}
PUT    /api/rentals/{id}/status
GET    /api/my-rentals
GET    /api/my-lendings
```

### Profissionais
```
GET    /api/professionals
POST   /api/professionals/register
PUT    /api/professionals/profile
GET    /api/professionals/{id}
```

### Negociações
```
GET    /api/negotiations
POST   /api/negotiations
GET    /api/negotiations/{id}
POST   /api/negotiations/{id}/messages
PUT    /api/negotiations/{id}/accept
PUT    /api/negotiations/{id}/reject
```

## 🎨 Design e UX

O aplicativo mobile utiliza:

- Design moderno e limpo
- Paleta de cores principal: Indigo (#6366f1)
- Navegação por tabs
- Feedback visual em todas as ações
- Loading states
- Estados vazios informativos

## 🧪 Testes

```bash
# Backend
php artisan test

# Frontend
npm test
```

## 📦 Deploy

### Backend

1. Configure o servidor com PHP 8.2+, MySQL e Composer
2. Clone o repositório
3. Configure o `.env` para produção
4. Execute as migrations
5. Configure o web server (Nginx/Apache)

### Frontend

```bash
# Build para Android
expo build:android

# Build para iOS
expo build:ios
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Desenvolvido com ❤️ para facilitar o acesso a roupas para eventos e festas.

## 📞 Suporte

Para suporte, entre em contato através do email: suporte@rentroupa.com.br

---

**Nota**: Este é um projeto em desenvolvimento. Algumas funcionalidades podem estar em fase de implementação.

