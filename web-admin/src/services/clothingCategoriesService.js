// Serviço para gerenciar categorias de roupas via API
import { API_BASE_URL } from '../config/api';

// Função auxiliar para processar texto já lido
const parseJsonFromText = (text) => {
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
};

const cleanJsonResponse = async (response) => {
  try {
    const text = await response.text();
    return parseJsonFromText(text);
  } catch (error) {
    console.error('❌ Erro em cleanJsonResponse:', error);
    throw error;
  }
};

class ClothingCategoriesService {
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

  async getAllCategories() {
    try {
      const url = `${API_BASE_URL}/admin/clothing-categories`;
      const headers = this.getHeaders();
      
      console.log('🌐 Fazendo requisição para:', url);
      console.log('🔑 Headers:', { ...headers, Authorization: headers.Authorization ? 'Bearer ***' : 'none' });
      
      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 Resposta recebida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.status === 401) {
        throw new Error('Não autenticado. Faça login novamente.');
      }

      if (response.status === 403) {
        throw new Error('Acesso negado. Você precisa ter permissão de administrador.');
      }

      if (!response.ok) {
        const errorData = await cleanJsonResponse(response).catch(() => ({}));
        console.error('❌ Erro na resposta:', errorData);
        throw new Error(errorData.message || errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }

      // Lê o texto apenas uma vez
      const rawText = await response.text();
      console.log('📄 Resposta raw (primeiros 500 chars):', rawText.substring(0, 500));
      
      // Processa o texto já lido usando a função auxiliar
      const data = parseJsonFromText(rawText);
      
      console.log('📦 Dados parseados:', data);
      console.log('📦 Tipo:', typeof data);
      console.log('📦 É array?', Array.isArray(data));
      
      if (Array.isArray(data)) {
        console.log('✅ Retornando array direto:', data.length, 'itens');
        return data;
      }
      
      if (data && data.data) {
        console.log('✅ Retornando data.data:', Array.isArray(data.data) ? data.data.length : 'não é array');
        return data.data;
      }
      
      if (data && data.success && data.data) {
        console.log('✅ Retornando data.data (com success):', Array.isArray(data.data) ? data.data.length : 'não é array');
        return data.data;
      }
      
      console.log('⚠️ Retornando data direto:', data);
      return data;
    } catch (error) {
      console.error('❌ Erro ao buscar categorias:', error);
      console.error('❌ Stack:', error.stack);
      throw error;
    }
  }

  async createCategory(categoryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/clothing-categories`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const error = await cleanJsonResponse(response);
        throw new Error(error.message || 'Erro ao criar categoria');
      }

      return await cleanJsonResponse(response);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      throw error;
    }
  }

  async updateCategory(categoryId, categoryData) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/clothing-categories/${categoryId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const error = await cleanJsonResponse(response);
        throw new Error(error.message || 'Erro ao atualizar categoria');
      }

      return await cleanJsonResponse(response);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      throw error;
    }
  }

  async deleteCategory(categoryId) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/clothing-categories/${categoryId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const error = await cleanJsonResponse(response);
        throw new Error(error.message || error.error || 'Erro ao excluir categoria');
      }

      return await cleanJsonResponse(response);
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      throw error;
    }
  }
}

export default new ClothingCategoriesService();

