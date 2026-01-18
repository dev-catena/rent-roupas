import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FaSync, FaExclamationTriangle, FaSearch, FaTimes, FaCheckCircle, FaBan, FaTrash } from 'react-icons/fa';
import usersService from '../services/usersService';
import authService from '../services/authService';
import './UsersManagement.css';

const UsersManagement = ({ currentUser, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchText, setSearchText] = useState('');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.getAllUsers();
      setUsers(Array.isArray(data) ? data : (data.data || data.items || []));
    } catch (err) {
      const errorMessage = err.message || 'Erro ao carregar usuários. Verifique se você tem permissão de administrador.';
      setError(errorMessage);
      console.error('Erro detalhado:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    if (!window.confirm('Tem certeza que deseja bloquear este usuário? Ele não conseguirá mais fazer login.')) {
      return;
    }

    try {
      setError(null);
      await usersService.blockUser(userId);
      
      if (currentUser && currentUser.id === userId) {
        alert('Você bloqueou sua própria conta. Você será desconectado agora.');
        if (onLogout) {
          onLogout();
        } else {
          authService.logout();
          window.location.reload();
        }
        return;
      }
      
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Erro ao bloquear usuário');
    }
  };

  const handleUnblockUser = async (userId) => {
    if (!window.confirm('Tem certeza que deseja desbloquear este usuário?')) {
      return;
    }

    try {
      setError(null);
      await usersService.unblockUser(userId);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Erro ao desbloquear usuário');
    }
  };

  const handleDeleteUser = async (userId) => {
    const user = users.find(u => u.id === userId);
    const userName = user?.name || 'este usuário';
    
    if (!window.confirm(`ATENÇÃO: Tem certeza que deseja EXCLUIR permanentemente ${userName}?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    if (!window.confirm(`Confirma a exclusão permanente de ${userName}?`)) {
      return;
    }

    try {
      setError(null);
      
      if (currentUser && currentUser.id === userId) {
        alert('Você não pode excluir sua própria conta.');
        return;
      }

      await usersService.deleteUser(userId);
      alert('Usuário excluído com sucesso!');
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Erro ao excluir usuário');
    }
  };

  const getUserTypeLabel = useCallback((userType) => {
    const types = {
      'renter': 'Locatário',
      'owner': 'Proprietário',
      'professional': 'Profissional',
      'both': 'Proprietário e Locatário',
    };
    return types[userType] || userType || 'N/A';
  }, []);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return '⇅';
    }
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const filteredAndSortedUsers = useMemo(() => {
    let result = users.filter((user) => {
      if (filter === 'blocked' && !user.is_blocked) return false;
      if (filter === 'active' && user.is_blocked) return false;
      
      if (searchText.trim()) {
        const searchLower = searchText.toLowerCase().trim();
        const userName = (user.name || '').toLowerCase();
        if (!userName.includes(searchLower)) return false;
      }
      
      return true;
    });

    result.sort((a, b) => {
      let aValue, bValue;

      switch (sortColumn) {
        case 'id':
          aValue = a.id || 0;
          bValue = b.id || 0;
          break;
        case 'name':
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
          break;
        case 'email':
          aValue = (a.email || '').toLowerCase();
          bValue = (b.email || '').toLowerCase();
          break;
        case 'user_type':
          aValue = getUserTypeLabel(a.user_type);
          bValue = getUserTypeLabel(b.user_type);
          break;
        case 'status':
          aValue = a.is_blocked ? 1 : 0;
          bValue = b.is_blocked ? 1 : 0;
          break;
        default:
          aValue = (a.name || '').toLowerCase();
          bValue = (b.name || '').toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [users, filter, searchText, sortColumn, sortDirection, getUserTypeLabel]);

  if (loading) {
    return (
      <div className="users-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="users-management">
      <header className="section-header">
        <div>
          <h1>Gestão de Usuários</h1>
          <p className="subtitle">
            Gerencie os usuários da plataforma. Usuários bloqueados verão "Acesso negado" ao tentar fazer login.
          </p>
        </div>
        <button className="refresh-button" onClick={loadUsers}>
          <FaSync style={{ marginRight: '0.5rem' }} />
          Atualizar
        </button>
      </header>

      {error && (
        <div className="error-banner">
          <FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
          <span>{error}</span>
        </div>
      )}

      <div className="search-container">
        <div style={{ position: 'relative', width: '100%' }}>
          <FaSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--vt-c-text-light-2)', zIndex: 1 }} />
          <input
            type="text"
            className="search-input"
            placeholder="Buscar por nome..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
          {searchText && (
            <button
              className="clear-search-btn"
              onClick={() => setSearchText('')}
              title="Limpar busca"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      <div className="filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos ({users.length})
        </button>
        <button
          className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
        >
          Ativos ({users.filter(u => !u.is_blocked).length})
        </button>
        <button
          className={`filter-btn ${filter === 'blocked' ? 'active' : ''}`}
          onClick={() => setFilter('blocked')}
        >
          Bloqueados ({users.filter(u => u.is_blocked).length})
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <button
                  className="sortable-header"
                  onClick={() => handleSort('id')}
                  title="Ordenar por ID"
                >
                  ID {getSortIcon('id')}
                </button>
              </th>
              <th>
                <button
                  className="sortable-header"
                  onClick={() => handleSort('name')}
                  title="Ordenar por Nome"
                >
                  Nome {getSortIcon('name')}
                </button>
              </th>
              <th>
                <button
                  className="sortable-header"
                  onClick={() => handleSort('email')}
                  title="Ordenar por Email"
                >
                  Email {getSortIcon('email')}
                </button>
              </th>
              <th>
                <button
                  className="sortable-header"
                  onClick={() => handleSort('user_type')}
                  title="Ordenar por Tipo"
                >
                  Tipo {getSortIcon('user_type')}
                </button>
              </th>
              <th>
                <button
                  className="sortable-header"
                  onClick={() => handleSort('status')}
                  title="Ordenar por Status"
                >
                  Status {getSortIcon('status')}
                </button>
              </th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedUsers.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  {searchText ? `Nenhum usuário encontrado com "${searchText}"` : 'Nenhum usuário encontrado'}
                </td>
              </tr>
            ) : (
              filteredAndSortedUsers.map((user) => (
                <tr key={user.id} className={user.is_blocked ? 'blocked' : ''}>
                  <td>{user.id}</td>
                  <td>
                    <div className="user-info">
                      <strong>{user.name || 'Sem nome'}</strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className="type-badge">
                      {getUserTypeLabel(user.user_type)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_blocked ? 'blocked' : 'active'}`}>
                      {user.is_blocked ? (
                        <>
                          <FaBan style={{ marginRight: '0.25rem' }} />
                          Bloqueado
                        </>
                      ) : (
                        <>
                          <FaCheckCircle style={{ marginRight: '0.25rem' }} />
                          Ativo
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {user.is_blocked ? (
                        <button
                          className="action-btn unblock-btn"
                          onClick={() => handleUnblockUser(user.id)}
                          title="Desbloquear usuário"
                        >
                          Desbloquear
                        </button>
                      ) : (
                        <button
                          className="action-btn block-btn"
                          onClick={() => handleBlockUser(user.id)}
                          title="Bloquear usuário"
                        >
                          Bloquear
                        </button>
                      )}
                      <button
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Excluir usuário permanentemente"
                      >
                        <FaTrash style={{ marginRight: '0.25rem' }} />
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersManagement;

