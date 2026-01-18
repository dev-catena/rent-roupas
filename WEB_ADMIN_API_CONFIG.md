# 🔧 Configuração da API no Web-Admin

## Problema Identificado

O web-admin estava usando o servidor **local** (`http://10.102.0.103:8000/api`), enquanto o app mobile usa o servidor de **produção** (`https://api.vestme.cloud/api`).

Isso causava:
- Categorias criadas no web-admin apareciam apenas localmente
- O app mobile não via as categorias criadas no web-admin
- Dados diferentes entre web-admin e app mobile

## Solução Aplicada

O web-admin agora usa **sempre o servidor de produção** (`https://api.vestme.cloud/api`), o mesmo que o app mobile.

## Como Funciona Agora

1. **Por padrão**: Web-admin usa `https://api.vestme.cloud/api`
2. **Configuração manual**: Você pode sobrescrever configurando no localStorage do navegador

## Configurar URL Manualmente (Opcional)

Se você precisar usar um servidor diferente temporariamente:

1. Abra o console do navegador (F12)
2. Execute:
```javascript
// Para usar servidor local
localStorage.setItem('@rent-roupa:api-url', 'http://localhost:8000/api')

// Para usar servidor de produção (padrão)
localStorage.setItem('@rent-roupa:api-url', 'https://api.vestme.cloud/api')

// Para remover configuração manual e voltar ao padrão
localStorage.removeItem('@rent-roupa:api-url')
```

3. Recarregue a página

## Verificar Qual URL Está Sendo Usada

No console do navegador, você verá:
```
🌐 API Base URL configurada: https://api.vestme.cloud/api
```

## Benefícios

✅ Web-admin e app mobile usam o mesmo servidor
✅ Categorias criadas no web-admin aparecem no app
✅ Dados sincronizados entre web-admin e app
✅ Não há mais confusão entre dados locais e de produção

## Nota Importante

Se você estava desenvolvendo localmente e criou categorias no banco local, essas categorias **não aparecerão** no web-admin agora, pois ele está usando o servidor de produção.

Para ver as categorias locais novamente, você precisaria:
1. Configurar manualmente para usar o servidor local (veja acima)
2. Ou migrar as categorias locais para o servidor de produção

