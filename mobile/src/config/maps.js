/**
 * Configuração do Google Maps API
 * 
 * Para obter sua API Key:
 * 1. Acesse: https://console.cloud.google.com/
 * 2. Crie um novo projeto (ou selecione um existente)
 * 3. Ative a API "Places API"
 * 4. Vá em "Credenciais" e crie uma "API Key"
 * 5. Restrinja a key para "Places API" apenas
 * 6. Adicione a key no arquivo .env como GOOGLE_MAPS_API_KEY
 * 7. Cole a key abaixo ou use process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
 */

import Constants from 'expo-constants';

// API Key do projeto lacos (pode ser reutilizada se configurada corretamente)
// Para usar uma chave diferente, configure em app.json > extra > googleMapsApiKey
// ou use a variável de ambiente EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
const GOOGLE_MAPS_CONFIG = {
  // Busca a API Key do app.json ou usa a do projeto lacos como fallback
  API_KEY: Constants.expoConfig?.extra?.googleMapsApiKey || 
           process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 
           'AIzaSyBK7C7316fc5jZAcVFHe_wEdefuZ5fwGqk', // Chave do projeto lacos
  
  // Configurações opcionais
  language: 'pt-BR',
  region: 'BR', // Prioriza resultados do Brasil
};

export default GOOGLE_MAPS_CONFIG;

