import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure o endereço da sua API aqui
const API_URL = __DEV__ 
  ? 'http://10.102.0.115:8000/api'  // IP WiFi para dispositivo físico
  : 'https://api.rentroupa.com.br/api'; // Produção

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
    const token = await AsyncStorage.getItem('@rent_roupa:token');
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
      await AsyncStorage.removeItem('@rent_roupa:token');
      await AsyncStorage.removeItem('@rent_roupa:user');
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };

