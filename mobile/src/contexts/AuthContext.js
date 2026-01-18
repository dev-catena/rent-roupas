import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { API_URL } from '../config/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const storedUser = await AsyncStorage.getItem('@vestme:user');
      const storedToken = await AsyncStorage.getItem('@vestme:token');

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erro ao carregar dados do storage:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    try {
      console.log('🔐 [LOGIN] Iniciando login...');
      console.log('📧 [LOGIN] Email:', email);
      
      const response = await api.post('/login', { email, password });
      
      console.log('✅ [LOGIN] Resposta recebida:', JSON.stringify(response.data, null, 2));

      if (response.data.success) {
        const { user: userData, token } = response.data.data;

        console.log('💾 [LOGIN] Salvando usuário e token...');
        await AsyncStorage.setItem('@vestme:user', JSON.stringify(userData));
        await AsyncStorage.setItem('@vestme:token', token);

        console.log('🔄 [LOGIN] Atualizando estado do usuário...');
        setUser(userData);
        console.log('✅ [LOGIN] Login bem-sucedido!');
        return { success: true };
      } else {
        console.log('❌ [LOGIN] Resposta não foi sucesso:', response.data);
        const errorMessage = response.data.message || 
                            response.data.details || 
                            'Erro ao fazer login';
        return { 
          success: false, 
          message: errorMessage,
          errorCode: response.data.error_code,
          details: response.data.details
        };
      }
    } catch (error) {
      console.error('❌ [LOGIN] Erro completo:', error);
      console.error('📡 [LOGIN] Status:', error.response?.status);
      console.error('📄 [LOGIN] Dados da resposta:', JSON.stringify(error.response?.data, null, 2));
      
      let message = 'Erro ao fazer login';
      let errorCode = 'UNKNOWN_ERROR';
      let details = '';
      
      if (error.response) {
        const data = error.response.data;
        message = data.message || 
                 data.details || 
                 `Erro ${error.response.status}: ${error.response.statusText}`;
        errorCode = data.error_code || `HTTP_${error.response.status}`;
        details = data.details || '';
        
        if (error.response.status === 401) {
          if (data.error_code === 'EMAIL_NOT_FOUND') {
            message = 'Email não encontrado';
            details = 'O email informado não está cadastrado no sistema.';
          } else if (data.error_code === 'INVALID_PASSWORD') {
            message = 'Senha incorreta';
            details = 'A senha informada está incorreta. Verifique e tente novamente.';
          } else {
            message = 'Credenciais inválidas';
            details = 'Email ou senha incorretos. Verifique suas credenciais.';
          }
        } else if (error.response.status === 422) {
          message = 'Dados inválidos';
          details = data.errors ? Object.values(data.errors).flat().join(', ') : 'Verifique os dados informados.';
        } else if (error.response.status === 500) {
          message = 'Erro no servidor';
          details = 'Ocorreu um erro no servidor. Tente novamente mais tarde.';
        }
      } else if (error.request) {
        message = 'Erro de conexão';
        errorCode = 'NETWORK_ERROR';
        details = `Não foi possível conectar ao servidor (${API_URL}). Verifique:\n- Sua conexão com a internet\n- Se o servidor está acessível\n- Se a URL da API está correta`;
      } else {
        message = error.message || 'Erro desconhecido';
        details = 'Ocorreu um erro inesperado.';
      }
      
      return { 
        success: false, 
        message,
        errorCode,
        details
      };
    }
  }

  async function signUp(userData) {
    try {
      console.log('Enviando dados de registro:', userData);
      const response = await api.post('/register', userData);
      console.log('Resposta do servidor:', response.data);

      if (response.data.success) {
        const { user: newUser, token } = response.data.data;
        
        console.log('Salvando usuário:', newUser);
        console.log('Salvando token:', token);

        await AsyncStorage.setItem('@vestme:user', JSON.stringify(newUser));
        await AsyncStorage.setItem('@vestme:token', token);

        console.log('Dados salvos! Atualizando estado...');
        setUser(newUser);
        console.log('Estado atualizado! signed deve ser:', !!newUser);
        
        return { success: true };
      } else {
        console.log('Resposta não foi sucesso:', response.data);
        return { success: false, message: response.data.message || 'Erro desconhecido' };
      }
    } catch (error) {
      console.log('Erro completo:', error);
      console.log('Resposta de erro:', error.response?.data);
      const message = error.response?.data?.message || 'Erro ao criar conta';
      const errors = error.response?.data?.errors || {};
      return { success: false, message, errors };
    }
  }

  async function signOut() {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      await AsyncStorage.removeItem('@vestme:user');
      await AsyncStorage.removeItem('@vestme:token');
      setUser(null);
    }
  }

  async function updateUser(userData) {
    setUser(userData);
    await AsyncStorage.setItem('@vestme:user', JSON.stringify(userData));
  }

  return (
    <AuthContext.Provider
      value={{
        signed: !!user,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export default AuthContext;

