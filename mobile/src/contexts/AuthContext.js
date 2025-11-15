import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../config/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData() {
    try {
      const storedUser = await AsyncStorage.getItem('@rent_roupa:user');
      const storedToken = await AsyncStorage.getItem('@rent_roupa:token');

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
      const response = await api.post('/login', { email, password });

      if (response.data.success) {
        const { user: userData, token } = response.data.data;

        await AsyncStorage.setItem('@rent_roupa:user', JSON.stringify(userData));
        await AsyncStorage.setItem('@rent_roupa:token', token);

        setUser(userData);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      return { success: false, message };
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

        await AsyncStorage.setItem('@rent_roupa:user', JSON.stringify(newUser));
        await AsyncStorage.setItem('@rent_roupa:token', token);

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
      await AsyncStorage.removeItem('@rent_roupa:user');
      await AsyncStorage.removeItem('@rent_roupa:token');
      setUser(null);
    }
  }

  async function updateUser(userData) {
    setUser(userData);
    await AsyncStorage.setItem('@rent_roupa:user', JSON.stringify(userData));
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

