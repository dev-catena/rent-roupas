// Serviço para gerenciar profissionais via API
import { API_BASE_URL } from '../config/api';

const cleanJsonResponse = async (response) => {
  try {
    const text = await response.text();
    
    if (!text || text.trim() === '') {
      return {};
    }
    
    const firstBrace = text.indexOf('{');
    const firstBracket = text.indexOf('[');
    
    let cleanedText = text;
    
    if (firstBrace !== -1 || firstBracket !== -1) {
      const startIndex = firstBrace !== -1 && firstBracket !== -1
        ? Math.min(firstBrace, firstBracket)
        : firstBrace !== -1 ? firstBrace : firstBracket;
      
      if (startIndex > 0) {
        cleanedText = text.substring(startIndex);
      }
    }
    
    try {
      return JSON.parse(cleanedText);
    } catch (parseError) {
      const jsonMatch = cleanedText.match(/(\{.*\}|\[.*\])/s);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          throw new Error(`Erro ao processar resposta do servidor: ${parseError.message}`);
        }
      }
      throw new Error(`Erro ao processar resposta do servidor: ${parseError.message}`);
    }
  } catch (error) {
    console.error('❌ Erro em cleanJsonResponse:', error);
    throw error;
  }
};

class ProfessionalsService {
  constructor() {
    this.token = localStorage.getItem('@rent-roupa:token');
  }

  getHeaders() {
    const token = localStorage.getItem('@rent-roupa:token');
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async getPendingProfessionals() {
    try {
      const headers = this.getHeaders();
      const token = localStorage.getItem('@rent-roupa:token');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }

      const response = await fetch(`${API_BASE_URL}/admin/professionals/pending`, {
        method: 'GET',
        headers: headers,
      });

      if (response.status === 401) {
        throw new Error('Não autenticado. Faça login novamente.');
      }

      if (response.status === 403) {
        throw new Error('Acesso negado. Você precisa ter permissão de administrador.');
      }

      if (!response.ok) {
        const errorData = await cleanJsonResponse(response).catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await cleanJsonResponse(response);
      if (Array.isArray(data)) {
        return data;
      }
      return data.data || data;
    } catch (error) {
      console.error('Erro ao buscar profissionais pendentes:', error);
      throw error;
    }
  }

  async getAllProfessionals() {
    try {
      const headers = this.getHeaders();
      const token = localStorage.getItem('@rent-roupa:token');
      
      if (!token) {
        throw new Error('Token de autenticação não encontrado. Faça login novamente.');
      }

      const response = await fetch(`${API_BASE_URL}/admin/professionals`, {
        method: 'GET',
        headers: headers,
      });

      if (response.status === 401) {
        throw new Error('Não autenticado. Faça login novamente.');
      }

      if (response.status === 403) {
        throw new Error('Acesso negado. Você precisa ter permissão de administrador.');
      }

      if (!response.ok) {
        const errorData = await cleanJsonResponse(response).catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      const data = await cleanJsonResponse(response);
      if (Array.isArray(data)) {
        return data;
      }
      return data.data || data;
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      throw error;
    }
  }

  async verifyProfessional(professionalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/professionals/${professionalId}/verify`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await cleanJsonResponse(response);
        throw new Error(error.message || 'Erro ao verificar profissional');
      }

      return await cleanJsonResponse(response);
    } catch (error) {
      console.error('Erro ao verificar profissional:', error);
      throw error;
    }
  }

  async rejectProfessional(professionalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/professionals/${professionalId}/reject`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await cleanJsonResponse(response);
        throw new Error(error.message || 'Erro ao rejeitar profissional');
      }

      return await cleanJsonResponse(response);
    } catch (error) {
      console.error('Erro ao rejeitar profissional:', error);
      throw error;
    }
  }

  async blockProfessional(professionalId) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/professionals/${professionalId}/block`, {
        method: 'POST',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await cleanJsonResponse(response);
        throw new Error(error.message || 'Erro ao bloquear profissional');
      }

      return await cleanJsonResponse(response);
    } catch (error) {
      console.error('Erro ao bloquear profissional:', error);
      throw error;
    }
  }
}

export default new ProfessionalsService();

