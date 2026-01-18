# 🗺️ Configurar Google Maps API

## 📋 Passos para Configurar

### 1. Obter API Key do Google Cloud

1. Acesse: https://console.cloud.google.com/
2. Crie um novo projeto (ou selecione um existente)
3. Ative a API "Places API":
   - Vá em "APIs & Services" > "Library"
   - Procure por "Places API"
   - Clique em "Enable"
4. Crie uma API Key:
   - Vá em "APIs & Services" > "Credentials"
   - Clique em "Create Credentials" > "API Key"
   - Copie a chave gerada

### 2. Configurar no Projeto

#### Opção 1: Usar variável de ambiente (Recomendado)

1. Crie um arquivo `.env` na pasta `mobile/`:
```bash
cd mobile
echo "GOOGLE_MAPS_API_KEY=sua_chave_aqui" > .env
```

2. Instale o pacote para ler variáveis de ambiente:
```bash
npm install react-native-dotenv
```

3. Atualize `babel.config.js`:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }]
    ],
  };
};
```

4. Atualize `mobile/src/config/maps.js`:
```javascript
import { GOOGLE_MAPS_API_KEY } from '@env';

const GOOGLE_MAPS_CONFIG = {
  API_KEY: GOOGLE_MAPS_API_KEY || 'SUA_API_KEY_AQUI',
  language: 'pt-BR',
  region: 'BR',
};
```

#### Opção 2: Configurar diretamente no código (Rápido para testes)

Edite `mobile/src/config/maps.js` e substitua `'SUA_API_KEY_AQUI'` pela sua chave:

```javascript
const GOOGLE_MAPS_CONFIG = {
  API_KEY: 'AIzaSyBK7C7316fc5jZAcVFHe_wEdefuZ5fwGqk', // Sua chave aqui
  language: 'pt-BR',
  region: 'BR',
};
```

### 3. Restringir a API Key (Segurança)

1. No Google Cloud Console, vá em "Credentials"
2. Clique na sua API Key
3. Em "API restrictions", selecione "Restrict key"
4. Escolha apenas "Places API"
5. Em "Application restrictions", configure conforme necessário

### 4. Verificar se está funcionando

Após configurar, teste no app:
1. Abra a tela de cadastro profissional
2. No campo "Endereço Completo", você deve ver sugestões do Google Places
3. Se não aparecer, verifique se a API Key está correta

## ⚠️ Importante

- **Nunca commite a API Key no Git** se ela não estiver restrita
- Use variáveis de ambiente para produção
- Restrinja a API Key no Google Cloud Console
- Monitore o uso no Google Cloud Console para evitar custos inesperados

## 📝 Nota

A API Key do projeto `lacos` está em:
- Arquivo: `/home/darley/lacos/src/config/maps.js`
- Chave: `AIzaSyBK7C7316fc5jZAcVFHe_wEdefuZ5fwGqk`

Você pode usar a mesma chave se ela estiver configurada para aceitar múltiplos projetos, ou criar uma nova.

