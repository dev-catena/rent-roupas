# 📱 Guia: Usar Expo Go

## ✅ Pré-requisitos

1. **Instalar Expo Go no seu celular:**
   - Android: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)

2. **Instalar dependências (se ainda não instalou):**
   ```bash
   cd mobile
   npm install
   ```

## 🚀 Executar o App

### 1. Iniciar o Expo

```bash
cd mobile
npm start
# ou
npx expo start
```

### 2. Escanear o QR Code

- **Android:** Abra o Expo Go e toque em "Scan QR Code" ou use a câmera
- **iOS:** Use a câmera do iPhone (abre automaticamente o Expo Go)

### 3. Opções no Terminal

Quando o Expo iniciar, você verá opções no terminal:

- Pressione `a` para abrir no Android Emulator
- Pressione `i` para abrir no iOS Simulator
- Pressione `w` para abrir no navegador web
- Pressione `r` para recarregar o app
- Pressione `m` para abrir o menu de desenvolvedor

## 📱 Conectar no Dispositivo Físico

### Opção 1: Mesma Rede Wi-Fi (Recomendado)

1. Certifique-se de que seu computador e celular estão na **mesma rede Wi-Fi**
2. Inicie o Expo: `npm start`
3. Escaneie o QR Code com o Expo Go

### Opção 2: Tunnel (Funciona em redes diferentes)

```bash
cd mobile
npx expo start --tunnel
```

**Nota:** O tunnel pode ser mais lento, mas funciona mesmo em redes diferentes.

## 🔧 Configuração Atual

- ✅ API configurada: `https://api.vestme.cloud/api`
- ✅ Backend funcionando
- ✅ HTTPS configurado

## 🧪 Testar Conexão com Backend

Após abrir o app no Expo Go:

1. Tente fazer login com:
   - Email: `vestme@vestme.com`
   - Senha: `vestme`

2. Se funcionar, o backend está conectado corretamente!

## 🐛 Troubleshooting

### Erro: "Unable to connect to Metro"

**Solução:**
```bash
# Limpar cache e reiniciar
cd mobile
npx expo start --clear
```

### Erro: "Network request failed"

**Verifique:**
- Se o celular e computador estão na mesma rede Wi-Fi
- Se o firewall não está bloqueando a porta
- Tente usar `--tunnel`:
  ```bash
  npx expo start --tunnel
  ```

### App não carrega

**Solução:**
```bash
# Parar o Expo (Ctrl+C)
# Limpar cache
cd mobile
rm -rf node_modules
npm install
npx expo start --clear
```

### Mudanças não aparecem

- Agite o celular para abrir o menu do desenvolvedor
- Toque em "Reload" ou pressione `r` no terminal

## 📝 Comandos Úteis

```bash
# Iniciar Expo
cd mobile
npm start

# Iniciar com tunnel
npx expo start --tunnel

# Limpar cache e iniciar
npx expo start --clear

# Ver logs
# (os logs aparecem automaticamente no terminal)
```

## 🎯 Próximos Passos

1. ✅ Instalar Expo Go no celular
2. ✅ Executar `npm start` na pasta mobile
3. ✅ Escanear QR Code
4. ✅ Testar login no app
5. ✅ Desenvolver e testar funcionalidades

---

**Dica:** Mantenha o terminal do Expo aberto enquanto desenvolve. Ele mostra logs e erros em tempo real!

