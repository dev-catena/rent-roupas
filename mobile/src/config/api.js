import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure o endereço da sua API aqui
// Domínio: api.vestme.cloud (produção com HTTPS)

const API_URL = __DEV__ 
  ? 'https://api.vestme.cloud/api'  // Desenvolvimento
  : 'https://api.vestme.cloud/api'; // Produção

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para adicionar token às requisições
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@vestme:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      await AsyncStorage.removeItem('@vestme:token');
      await AsyncStorage.removeItem('@vestme:user');
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
