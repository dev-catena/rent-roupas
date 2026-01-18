# 🔑 Usar a Mesma API Key do Google Maps

## ✅ Resposta Rápida

**NÃO, você não precisa de outra chave!** Você pode usar a mesma API Key do projeto `lacos`.

## 📋 Como Funciona

A API Key do Google Maps pode ser usada em múltiplos projetos/apps, desde que:

1. **A chave não esteja restrita a um único app** (ou esteja configurada para aceitar múltiplos)
2. **As APIs necessárias estejam ativadas** (Places API)

## 🔧 Configuração Atual

O projeto já está configurado para usar a mesma chave do `lacos`:

```javascript
// mobile/src/config/maps.js
API_KEY: 'AIzaSyBK7C7316fc5jZAcVFHe_wEdefuZ5fwGqk' // Chave do projeto lacos
```

## ⚙️ Verificar Restrições da API Key

Se a chave não funcionar, pode ser que ela esteja restrita. Para verificar/ajustar:

1. Acesse: https://console.cloud.google.com/
2. Vá em "APIs & Services" > "Credentials"
3. Clique na sua API Key
4. Verifique "Application restrictions":
   - **None** = Funciona em qualquer app ✅
   - **Android apps** = Precisa adicionar package name
   - **iOS apps** = Precisa adicionar bundle ID
   - **HTTP referrers** = Para web apps

## 🎯 Opções

### Opção 1: Usar a Mesma Chave (Recomendado)

Se a chave do `lacos` não tiver restrições de aplicativo, ela já funciona!

**Vantagens:**
- ✅ Não precisa criar nova chave
- ✅ Menos configuração
- ✅ Funciona imediatamente

### Opção 2: Criar Nova Chave (Se Precisar)

Só crie uma nova chave se:
- A chave atual estiver restrita a um único app
- Você quiser separar os custos/uso por projeto
- Você quiser ter controle independente

**Como criar:**
1. Acesse: https://console.cloud.google.com/
2. Vá em "APIs & Services" > "Credentials"
3. Clique em "Create Credentials" > "API Key"
4. Copie a nova chave
5. Ative "Places API" para essa chave
6. Substitua em `mobile/src/config/maps.js`

## 📝 Configurar Restrições (Opcional)

Se quiser usar a mesma chave mas com restrições:

1. No Google Cloud Console, edite a API Key
2. Em "Application restrictions", adicione:
   - **Android**: `com.vestme.app` (package do app)
   - **iOS**: `com.vestme.app` (bundle ID)
3. Salve

Assim a chave funcionará em ambos os projetos (`lacos` e `vestme`).

## ✅ Teste

Para testar se está funcionando:

1. Abra o app no Expo Go
2. Vá na tela de cadastro profissional
3. No campo "Endereço Completo", digite um endereço
4. Se aparecerem sugestões do Google Places, está funcionando! ✅

## 💡 Dica

A chave do `lacos` já está funcionando no código atual. Se você testar e não funcionar, pode ser:
- Problema de conexão
- API Key com restrições muito específicas
- Places API não ativada para essa chave

Nesses casos, você pode criar uma nova chave ou ajustar as restrições da existente.

