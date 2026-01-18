# Instruções para Adicionar os Logos Oficiais

## Arquivos de Logo Necessários

Você precisa adicionar os seguintes arquivos na pasta `mobile/assets/`:

1. **`logo-vestme-full.png`** - Logo completo "VestMe" (com texto)
   - Use este logo nas telas de boas-vindas, login e outras telas principais
   - Dimensões recomendadas: 300x100px ou proporcional

2. **`logo-vestme-icon.png`** - Logo apenas com o "V" estilizado
   - Use este logo como ícone em headers, navegação, etc.
   - Dimensões recomendadas: 100x100px ou proporcional

3. **`logo-vestme-splash.png`** - Logo para splash screen
   - Versão otimizada para a tela de inicialização
   - Dimensões recomendadas: 512x512px ou proporcional

4. **`logo-vestme-adaptive.png`** - Logo para ícone adaptativo Android
   - Versão do logo para o ícone do app no Android
   - Dimensões recomendadas: 1024x1024px

## Onde os Logos Serão Usados

### 1. WelcomeScreen (Tela de Boas-Vindas)
- Logo completo no topo
- Substitui o emoji 👗 atual

### 2. LoginScreen (Tela de Login)
- Logo completo ou ícone no header
- Mantém a identidade visual

### 3. HomeScreen (Tela Inicial)
- Logo ícone no header
- Identificação da marca

### 4. ProfileScreen (Tela de Perfil)
- Logo ícone no header
- Identificação consistente

### 5. Splash Screen
- Logo completo centralizado
- Primeira impressão do app

### 6. App Icon
- Logo adaptativo para Android/iOS
- Ícone do app na tela inicial do dispositivo

## Após Adicionar os Arquivos

Execute:
```bash
cd mobile
npx expo prebuild --clean
```

Ou simplesmente reinicie o servidor de desenvolvimento:
```bash
npx expo start --clear
```

