// Serviço de autenticação para gestão admin
import { API_BASE_URL } from '../config/api';

class AuthService {
  constructor() {
    this.token = localStorage.getItem('@rent-roupa:token');
    this.user = this.getStoredUser();
  }

  getStoredUser() {
    const userStr = localStorage.getItem('@rent-roupa:user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
    };
  }

  async login(email, password) {
    try {
      const loginUrl = `${API_BASE_URL}/admin/login`;
      console.log('🔐 Tentando login em:', loginUrl);
      console.log('🔐 API_BASE_URL:', API_BASE_URL);
      console.log('🔐 Window location:', window.location.href);
      
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        mode: 'cors',
        credentials: 'omit',
      }).catch((fetchError) => {
        console.error('❌ Erro na requisição fetch:', fetchError);
        console.error('❌ Tipo do erro:', fetchError.constructor.name);
        console.error('❌ Mensagem:', fetchError.message);
        console.error('❌ Stack:', fetchError.stack);
        
        // Verificar se é um erro de rede
        if (fetchError.message.includes('Failed to fetch') || 
            fetchError.message.includes('NetworkError') ||
            fetchError.message.includes('Network request failed') ||
            fetchError.message.includes('ERR_INTERNET_DISCONNECTED') ||
            fetchError.message.includes('ERR_CONNECTION_REFUSED') ||
            fetchError.message.includes('ERR_CONNECTION_RESET')) {
          throw new Error('Não foi possível conectar ao servidor. Verifique:\n' +
            '• Se o backend está rodando em ' + API_BASE_URL + '\n' +
            '• Sua conexão com a internet\n' +
            '• Se há bloqueio de firewall ou proxy\n' +
            '• Abra o console do navegador (F12) para mais detalhes');
        }
        throw fetchError;
      });

      let data;
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        data = {
          message: response.status === 403 
            ? 'Acesso negado. Sua conta foi bloqueada.'
            : 'Erro ao processar resposta do servidor',
          error: response.status === 403 ? 'account_blocked' : 'parse_error'
        };
      }

      if (!response.ok) {
        if (response.status === 403 && (data.error === 'account_blocked' || data.message?.includes('bloqueada'))) {
          throw new Error('Acesso negado. Sua conta foi bloqueada.');
        }
        throw new Error(data.message || data.error || `Erro ${response.status}: ${response.statusText}`);
      }

      // Salvar token e usuário
      if (data.token) {
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('@rent-roupa:token', data.token);
        localStorage.setItem('@rent-roupa:user', JSON.stringify(data.user));
      }

      return { user: data.user, token: data.token };
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  async checkAuth() {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          return false;
        }
        if (response.status === 403) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.error === 'account_blocked') {
            this.logout();
            return false;
          }
        }
        return false;
      }

      const user = await response.json();
      
      if (user && user.is_blocked) {
        this.logout();
        return false;
      }
      
      this.user = user;
      localStorage.setItem('@rent-roupa:user', JSON.stringify(user));
      return true;
    } catch (error) {
      console.warn('Erro de rede ao verificar autenticação, mantendo sessão:', error.message);
      return false;
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('@rent-roupa:token');
    localStorage.removeItem('@rent-roupa:user');
  }

  isAuthenticated() {
    return !!this.token && !!this.user;
  }

  getUser() {
    return this.user;
  }

  getToken() {
    return this.token;
  }
}

export default new AuthService();

