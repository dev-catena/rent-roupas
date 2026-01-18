# Rent Roupa - Painel Administrativo

Plataforma web de administração para gerenciar usuários, profissionais e tipos de roupas do sistema Rent Roupa.

## 🔐 Credenciais de Acesso (Root/Admin)

**Usuário Administrador:**
- **Email:** `admin@vestme.com.br`
- **Senha:** `admin123`
- **Tipo:** Administrador (acesso completo ao painel web-admin)

> **Nota:** Estas credenciais são criadas automaticamente ao executar `php artisan db:seed --class=DefaultUserSeeder` no servidor de produção.

## Funcionalidades

### 1. Login Administrativo
- Autenticação via email e senha
- Apenas usuários com `is_admin = true` podem acessar

### 2. Gestão de Usuários
- Visualizar todos os usuários cadastrados
- Buscar usuários por nome
- Filtrar por status (Todos, Ativos, Bloqueados)
- Ordenar por diferentes colunas
- Bloquear/Desbloquear usuários
- Excluir usuários

### 3. Gestão de Profissionais
- Visualizar profissionais pendentes de verificação
- Verificar profissionais (aprovar)
- Rejeitar profissionais
- Bloquear profissionais
- Visualizar profissionais verificados e bloqueados

### 4. Gestão de Tipos de Roupas (CRUD)
- Criar novos tipos de roupas
- Editar tipos existentes
- Excluir tipos de roupas
- Ativar/Desativar tipos
- Definir ordem de exibição
- Adicionar ícones e descrições

## Instalação

### Pré-requisitos
- Node.js 18+ e npm
- Backend Laravel configurado e rodando

### Passos

1. Instalar dependências:
```bash
cd web-admin
npm install
```

2. Configurar a URL da API em `src/config/api.js` (ajustar conforme necessário)

3. Executar em desenvolvimento:
```bash
npm run dev
```

4. Build para produção:
```bash
npm run build
```

## Configuração do Backend

### 1. Executar a migration para adicionar campos administrativos:
```bash
php artisan migrate
```

### 2. Criar usuários padrão do sistema:
```bash
php artisan db:seed --class=DefaultUserSeeder
```

Este comando criará os seguintes usuários padrão:

#### Credenciais de Acesso

**Administrador (Web Admin) - Root:**
- Email: `admin@vestme.com.br`
- Senha: `admin123`
- Tipo: Administrador (acesso completo ao painel web-admin)

**Usuários de Teste (Mobile App):**

1. **Costureira (Profissional):**
   - Email: `costureira@gmail.com`
   - Senha: `11111111`
   - Tipo: Profissional (costureira verificada)

2. **Proprietário (Owner):**
   - Email: `owner@gmail.com`
   - Senha: `11111111`
   - Tipo: Proprietário (pode oferecer roupas para aluguel)

3. **Cliente (Renter):**
   - Email: `cliente@gmail.com`
   - Senha: `11111111`
   - Tipo: Cliente (pode alugar roupas)

> **Nota:** O seeder verifica se os usuários já existem antes de criá-los. Se existirem, apenas atualiza as senhas e informações básicas.

## Estrutura do Projeto

```
web-admin/
├── src/
│   ├── components/          # Componentes React
│   │   ├── LoginScreen.jsx
│   │   ├── MainLayout.jsx
│   │   ├── UsersManagement.jsx
│   │   ├── ProfessionalsManagement.jsx
│   │   └── ClothingCategoriesManagement.jsx
│   ├── services/            # Serviços de API
│   │   ├── authService.js
│   │   ├── usersService.js
│   │   ├── professionalsService.js
│   │   └── clothingCategoriesService.js
│   ├── config/             # Configurações
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
└── vite.config.js
```

## Rotas da API

### Autenticação
- `POST /api/admin/login` - Login administrativo

### Usuários (requer autenticação + is_admin)
- `GET /api/admin/users` - Listar todos os usuários
- `POST /api/admin/users/{id}/block` - Bloquear usuário
- `POST /api/admin/users/{id}/unblock` - Desbloquear usuário
- `DELETE /api/admin/users/{id}` - Excluir usuário

### Profissionais (requer autenticação + is_admin)
- `GET /api/admin/professionals/pending` - Listar profissionais pendentes
- `GET /api/admin/professionals` - Listar todos os profissionais
- `POST /api/admin/professionals/{id}/verify` - Verificar profissional
- `POST /api/admin/professionals/{id}/reject` - Rejeitar profissional
- `POST /api/admin/professionals/{id}/block` - Bloquear profissional

### Categorias de Roupas (requer autenticação + is_admin)
- `GET /api/admin/clothing-categories` - Listar todas as categorias
- `POST /api/admin/clothing-categories` - Criar categoria
- `PUT /api/admin/clothing-categories/{id}` - Atualizar categoria
- `DELETE /api/admin/clothing-categories/{id}` - Excluir categoria

## Estilos

O projeto utiliza a mesma paleta de cores e estilos do projeto de referência (Laços), mantendo consistência visual:
- Cores principais: Tons de cinza azulado (#536173)
- Layout: Sidebar fixo à esquerda com menu de navegação
- Componentes: Cards, modais, tabelas com design moderno

## Desenvolvimento

O projeto utiliza:
- **React 18** - Biblioteca de UI
- **Vite** - Build tool e dev server
- **CSS puro** - Sem frameworks CSS adicionais

## Notas

- As categorias de roupas criadas aqui aparecerão automaticamente na tela de cadastro de peças do app mobile
- As categorias também aparecem nos filtros da tela de busca
- Profissionais verificados podem aparecer nas listas de profissionais disponíveis
- Usuários bloqueados não conseguem fazer login no app mobile

