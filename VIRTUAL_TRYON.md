# 🎨 Virtual Try-On (Experimentação Virtual)

## 📋 O que foi implementado

Funcionalidade completa de **Virtual Try-On** usando IA (Replicate.ai) para experimentar roupas virtualmente!

### ✨ Recursos

1. **Backend (Laravel):**
   - Endpoint `/api/virtual-try-on` para iniciar processamento
   - Endpoint `/api/virtual-try-on/status/{id}` para verificar progresso
   - Endpoint `/api/virtual-try-on/history` para ver histórico
   - Integração com Replicate.ai (modelo IDM-VTON)
   - Armazenamento local de resultados

2. **Frontend (React Native):**
   - Tela completa de Virtual Try-On
   - Captura ou seleção de foto do usuário
   - Processamento em tempo real com feedback visual
   - Exibição do resultado
   - Salvamento na galeria
   - Botão integrado na tela de detalhes de peças

---

## 🚀 Como Usar

### 1️⃣ No App Mobile

1. **Acesse uma peça:**
   - Vá para "Início" ou "Buscar"
   - Clique em uma peça de roupa

2. **Inicie o Virtual Try-On:**
   - Clique no botão **"✨ Experimentar Virtualmente"**
   - Escolha entre:
     - 📷 **Tirar Foto** (câmera)
     - 🖼️ **Escolher da Galeria**

3. **Tire/Escolha sua foto:**
   - Foto de corpo inteiro
   - De frente
   - Boa iluminação
   - Fundo neutro (recomendado)

4. **Processe:**
   - Clique em **"✨ Experimentar Virtualmente"**
   - Aguarde 30s a 2min (depende da API)
   - Veja o progresso na tela

5. **Resultado:**
   - Veja você vestindo a peça! 🎉
   - Salve na galeria com **"💾 Salvar na Galeria"**
   - Tente novamente com outra foto

---

## 💰 Custos da API

### Replicate.ai Pricing

- **$0.01 por imagem processada**
- **100 experimentações = $1**
- **1000 experimentações = $10**

### Sua API Key

**Configure no arquivo `.env`:**

```bash
# .env
REPLICATE_API_KEY=sua_chave_aqui
```

O controller já está configurado para usar a variável de ambiente:

```php
private $replicateApiKey;

public function __construct()
{
    $this->replicateApiKey = env('REPLICATE_API_KEY');
}
```

**⚠️ IMPORTANTE:** 
- NUNCA commite a API Key no código
- Adicione sua chave real no arquivo `.env`
- O arquivo `.env` está no `.gitignore` e não será enviado ao GitHub

---

## 🔧 Arquivos Modificados/Criados

### Backend

✅ **CRIADO:** `app/Http/Controllers/Api/VirtualTryOnController.php`
- Controller completo com 3 métodos:
  - `tryOn()` - Inicia processamento
  - `checkStatus()` - Verifica progresso
  - `history()` - Histórico de experimentações

✅ **MODIFICADO:** `routes/api.php`
- Adicionadas 3 rotas:
  - `POST /api/virtual-try-on`
  - `GET /api/virtual-try-on/status/{predictionId}`
  - `GET /api/virtual-try-on/history`

### Frontend

✅ **CRIADO:** `mobile/src/screens/VirtualTryOn/VirtualTryOnScreen.js`
- Tela completa de Virtual Try-On
- Interface intuitiva
- Feedback em tempo real

✅ **MODIFICADO:** `mobile/src/screens/Item/ItemDetailScreen.js`
- Adicionado botão "✨ Experimentar Virtualmente"

✅ **MODIFICADO:** `mobile/src/navigation/AppNavigator.js`
- Adicionada rota `VirtualTryOn` nos stacks Home e Search

✅ **INSTALADO:** `expo-media-library`
- Para salvar imagens na galeria

---

## 📸 Como Funciona (Técnico)

### Fluxo Completo

1. **Usuário seleciona foto:**
   ```javascript
   // React Native - ImagePicker
   const result = await ImagePicker.launchImageLibraryAsync({
     mediaTypes: ImagePicker.MediaTypeOptions.Images,
     allowsEditing: true,
     aspect: [3, 4],
     quality: 1,
   });
   ```

2. **Upload para backend:**
   ```javascript
   const formData = new FormData();
   formData.append('clothing_item_id', item.id);
   formData.append('user_photo', {
     uri: userPhoto.uri,
     type: 'image/jpeg',
     name: 'user_photo.jpg',
   });
   
   const response = await api.post('/virtual-try-on', formData);
   ```

3. **Backend processa:**
   ```php
   // Salva foto do usuário
   $userPhotoPath = $request->file('user_photo')->store('virtual-tryon/users', 'public');
   
   // Chama API Replicate
   $response = Http::withHeaders([
       'Authorization' => 'Token ' . $this->replicateApiKey,
   ])->post($this->replicateApiUrl, [
       'version' => 'c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4',
       'input' => [
           'human_img' => $userPhotoUrl,
           'garm_img' => $clothingPhotoUrl,
           'garment_des' => $item->title,
       ]
   ]);
   ```

4. **Polling para status:**
   ```javascript
   // Frontend verifica status a cada 2s
   async function checkPredictionStatus(predId) {
     const response = await api.get(`/virtual-try-on/status/${predId}`);
     
     if (status === 'succeeded') {
       setResultImage(local_url);
     } else if (status === 'processing') {
       setTimeout(() => checkPredictionStatus(predId), 2000);
     }
   }
   ```

5. **Resultado exibido:**
   - Backend baixa imagem gerada do Replicate
   - Salva localmente em `storage/app/public/virtual-tryon/results/`
   - Retorna URL local
   - Frontend exibe imagem

---

## 🧪 Testando

### 1. Certifique-se que o servidor está rodando

```bash
cd /home/darley/rent-roupa
php artisan serve --host=0.0.0.0 --port=8000
```

### 2. No app mobile

```bash
cd /home/darley/rent-roupa/mobile
npx expo start
```

### 3. Teste o fluxo

1. Escolha uma peça
2. Clique em "Experimentar Virtualmente"
3. Tire/escolha uma foto
4. Aguarde processamento
5. Veja o resultado! 🎉

---

## 📊 Monitoramento de Uso

Para monitorar quanto você está gastando na API:

1. **Acesse:** https://replicate.com/account/api-tokens
2. **Veja:** Usage & Billing
3. **Monitore:** Quantas predições foram feitas

---

## 🎯 Dicas para Melhores Resultados

### Foto do Usuário
✅ **BOM:**
- Corpo inteiro visível
- De frente para câmera
- Braços ao lado do corpo
- Fundo neutro/limpo
- Boa iluminação

❌ **EVITE:**
- Foto de lado ou de costas
- Foto cortada (faltando partes do corpo)
- Fundo muito poluído
- Pouca iluminação
- Roupas muito volumosas

### Foto da Roupa
✅ **BOM:**
- Roupa em fundo branco/neutro
- Toda a peça visível
- Boa resolução
- Bem iluminada

---

## 🔒 Segurança (Para Produção)

### 1. Mover API Key para .env

```bash
# .env
REPLICATE_API_KEY=sua_chave_replicate_aqui
```

### 2. Limitar taxa de uso

Adicione rate limiting:

```php
// routes/api.php
Route::middleware(['auth:sanctum', 'throttle:10,1'])->group(function () {
    Route::post('/virtual-try-on', [VirtualTryOnController::class, 'tryOn']);
});
```

### 3. Validar imagens

Já implementado:
- Max 10MB
- Apenas JPEG/PNG/JPG

### 4. Limpar imagens antigas

Crie um comando artisan para limpar:

```php
// app/Console/Commands/CleanVirtualTryOnImages.php
public function handle()
{
    // Deleta imagens com mais de 7 dias
    $files = Storage::disk('public')->files('virtual-tryon/results');
    foreach ($files as $file) {
        if (Storage::disk('public')->lastModified($file) < now()->subDays(7)->timestamp) {
            Storage::disk('public')->delete($file);
        }
    }
}
```

---

## 🎉 Próximos Passos (Opcional)

### 1. Histórico de Experimentações
- Salvar no banco de dados
- Associar ao usuário
- Mostrar em tela dedicada

### 2. Compartilhamento
- Compartilhar resultado em redes sociais
- Enviar para amigos

### 3. Comparação
- Experimentar múltiplas peças
- Ver lado a lado

### 4. Melhorias de IA
- Ajuste de cor
- Ajuste de tamanho
- Múltiplos ângulos

---

## 📞 Suporte

Se houver problemas:

1. **Verifique logs do Laravel:**
```bash
tail -f storage/logs/laravel.log
```

2. **Verifique logs do Expo:**
- Console no terminal onde rodou `npx expo start`

3. **Verifique API Replicate:**
- Status: https://replicate.com/status
- Documentação: https://replicate.com/docs

---

## 🎊 Resultado Final

Você agora tem uma funcionalidade completa de **Virtual Try-On** no seu app! 

Os usuários podem:
- ✅ Experimentar roupas virtualmente
- ✅ Ver como ficaria antes de alugar
- ✅ Salvar resultados
- ✅ Tomar decisões mais informadas

**Isso vai aumentar MUITO as conversões de aluguel!** 🚀

