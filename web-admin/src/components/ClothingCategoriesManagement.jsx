import React, { useState, useEffect } from 'react';
import { FaSync, FaExclamationTriangle, FaPlus, FaEdit, FaTrash, FaCheckCircle, FaPause } from 'react-icons/fa';
import clothingCategoriesService from '../services/clothingCategoriesService';
import './ClothingCategoriesManagement.css';

const ClothingCategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '',
    description: '',
    order: 0,
    is_active: true,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  // Debug: monitora mudanças no estado categories
  useEffect(() => {
    console.log('🔄 Estado categories atualizado:', categories.length, 'itens');
    console.log('🔄 Conteúdo:', categories);
  }, [categories]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Carregando categorias...');
      
      const data = await clothingCategoriesService.getAllCategories();
      
      console.log('📦 Dados recebidos:', data);
      console.log('📦 Tipo dos dados:', typeof data);
      console.log('📦 É array?', Array.isArray(data));
      
      let categoriesArray = [];
      
      if (Array.isArray(data)) {
        categoriesArray = data;
      } else if (data && data.data && Array.isArray(data.data)) {
        categoriesArray = data.data;
      } else if (data && data.items && Array.isArray(data.items)) {
        categoriesArray = data.items;
      } else if (data && typeof data === 'object') {
        // Se for um objeto único, transforma em array
        categoriesArray = [data];
      }
      
      console.log('✅ Categorias processadas:', categoriesArray.length);
      setCategories(categoriesArray);
    } catch (err) {
      console.error('❌ Erro ao carregar categorias:', err);
      console.error('❌ Erro completo:', JSON.stringify(err, null, 2));
      
      const errorMessage = err.message || 'Erro ao carregar categorias. Verifique se você tem permissão de administrador.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      icon: '',
      description: '',
      order: categories.length + 1,
      is_active: true,
    });
    setCreateModalVisible(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      icon: category.icon || '',
      description: category.description || '',
      order: category.order || 0,
      is_active: category.is_active !== undefined ? category.is_active : true,
    });
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    try {
      setError(null);
      
      if (!formData.name.trim()) {
        setError('O nome da categoria é obrigatório');
        return;
      }

      const categoryData = {
        ...formData,
        slug: formData.slug || generateSlug(formData.name),
        order: parseInt(formData.order) || 0,
        is_active: formData.is_active === true || formData.is_active === 'true',
      };

      if (editingCategory) {
        await clothingCategoriesService.updateCategory(editingCategory.id, categoryData);
        alert('Categoria atualizada com sucesso!');
      } else {
        await clothingCategoriesService.createCategory(categoryData);
        alert('Categoria criada com sucesso!');
      }

      setEditModalVisible(false);
      setCreateModalVisible(false);
      setEditingCategory(null);
      await loadCategories();
    } catch (err) {
      setError(err.message || 'Erro ao salvar categoria');
    }
  };

  const handleDelete = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    const categoryName = category?.name || 'esta categoria';
    
    if (!window.confirm(`ATENÇÃO: Tem certeza que deseja EXCLUIR permanentemente "${categoryName}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    if (!window.confirm(`Confirma a exclusão permanente de "${categoryName}"?`)) {
      return;
    }

    try {
      setError(null);
      await clothingCategoriesService.deleteCategory(categoryId);
      alert('Categoria excluída com sucesso!');
      await loadCategories();
    } catch (err) {
      setError(err.message || 'Erro ao excluir categoria');
    }
  };

  const handleNameChange = (name) => {
    setFormData({
      ...formData,
      name,
      slug: formData.slug || generateSlug(name),
    });
  };

  if (loading) {
    return (
      <div className="clothing-categories-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando categorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="clothing-categories-management">
      <header className="section-header">
        <div>
          <h1>Gestão de Tipos de Roupas</h1>
          <p className="subtitle">
            Gerencie os tipos de roupas disponíveis na plataforma. Estas categorias aparecerão na tela de cadastro de peças e nos filtros de busca.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="refresh-button" onClick={loadCategories}>
            <FaSync style={{ marginRight: '0.5rem' }} />
            Atualizar
          </button>
          <button className="refresh-button" onClick={handleCreate} style={{ background: '#B8E6B8', color: '#2D5A2D' }}>
            <FaPlus style={{ marginRight: '0.5rem' }} />
            Nova Categoria
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
          <span>{error}</span>
        </div>
      )}

      <div className="categories-container">
        <div className="categories-list">
          {(() => {
            console.log('🎨 [RENDER] Renderizando categorias. Total:', categories.length);
            console.log('🎨 [RENDER] Categorias:', JSON.stringify(categories, null, 2));
            console.log('🎨 [RENDER] Tipo:', typeof categories);
            console.log('🎨 [RENDER] É array?', Array.isArray(categories));
            
            if (!categories || categories.length === 0) {
              console.log('⚠️ [RENDER] Nenhuma categoria para renderizar - mostrando empty state');
              return (
                <div className="empty-state">
                  <p>Nenhuma categoria cadastrada. Clique em "Nova Categoria" para criar uma.</p>
                </div>
              );
            }
            
            const sortedCategories = categories.sort((a, b) => (a.order || 0) - (b.order || 0));
            console.log('✅ [RENDER] Renderizando', sortedCategories.length, 'categorias ordenadas');
            
            return sortedCategories.map((category, index) => {
              console.log(`🎨 [RENDER] Categoria ${index + 1}/${sortedCategories.length}:`, {
                id: category.id,
                name: category.name,
                slug: category.slug,
                is_active: category.is_active
              });
              return (
                <div key={category.id} className="category-card">
                  <div className="category-header">
                    <div>
                      <h3>
                        {category.icon && <span style={{ marginRight: '0.5rem' }}>{category.icon}</span>}
                        {category.name}
                      </h3>
                      <p className="category-slug">/{category.slug}</p>
                    </div>
                    <span className={`status-badge ${category.is_active ? 'active' : 'inactive'}`}>
                      {category.is_active ? (
                        <>
                          <FaCheckCircle style={{ marginRight: '0.25rem' }} />
                          Ativa
                        </>
                      ) : (
                        <>
                          <FaPause style={{ marginRight: '0.25rem' }} />
                          Inativa
                        </>
                      )}
                    </span>
                  </div>
                  
                  <div className="category-details">
                    <div className="detail-item">
                      <strong>Descrição:</strong> {category.description || 'Sem descrição'}
                    </div>
                    <div className="detail-item">
                      <strong>Ordem:</strong> {category.order || 0}
                    </div>
                    <div className="detail-item">
                      <strong>ID:</strong> {category.id}
                    </div>
                  </div>

                  <div className="category-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => handleEdit(category)}
                    >
                      <FaEdit style={{ marginRight: '0.25rem' }} />
                      Editar
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(category.id)}
                    >
                      <FaTrash style={{ marginRight: '0.25rem' }} />
                      Excluir
                    </button>
                  </div>
                </div>
              );
              });
          })()}
        </div>
      </div>

      {/* Modal de Edição/Criação */}
      {(editModalVisible || createModalVisible) && (
        <div className="modal-overlay" onClick={() => {
          setEditModalVisible(false);
          setCreateModalVisible(false);
          setEditingCategory(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button className="modal-close" onClick={() => {
                setEditModalVisible(false);
                setCreateModalVisible(false);
                setEditingCategory(null);
              }}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Nome: *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="form-input"
                  placeholder="Ex: Vestidos"
                />
              </div>

              <div className="form-group">
                <label>Slug:</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="form-input"
                  placeholder="Ex: vestidos (gerado automaticamente)"
                />
                <small style={{ color: 'var(--vt-c-text-light-2)', fontSize: '0.875rem' }}>
                  URL amigável (gerado automaticamente se deixado em branco)
                </small>
              </div>

              <div className="form-group">
                <label>Ícone:</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="form-input"
                  placeholder="Ex: 👗 (emoji ou código de ícone)"
                />
              </div>

              <div className="form-group">
                <label>Descrição:</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-input"
                  rows="3"
                  placeholder="Descrição da categoria"
                />
              </div>

              <div className="form-group">
                <label>Ordem:</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  className="form-input"
                  placeholder="0"
                />
                <small style={{ color: 'var(--vt-c-text-light-2)', fontSize: '0.875rem' }}>
                  Ordem de exibição (menor número aparece primeiro)
                </small>
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ marginRight: '0.5rem' }}
                  />
                  Categoria ativa
                </label>
                <small style={{ color: 'var(--vt-c-text-light-2)', fontSize: '0.875rem', display: 'block', marginTop: '0.25rem' }}>
                  Categorias inativas não aparecerão nas listas
                </small>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => {
                setEditModalVisible(false);
                setCreateModalVisible(false);
                setEditingCategory(null);
              }}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSave}>
                {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClothingCategoriesManagement;

