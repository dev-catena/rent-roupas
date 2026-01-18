import React, { useState, useEffect } from 'react';
import { FaSync, FaExclamationTriangle, FaClock, FaCheckCircle, FaBan, FaTimes } from 'react-icons/fa';
import professionalsService from '../services/professionalsService';
import './ProfessionalsManagement.css';

const ProfessionalsManagement = () => {
  const [professionals, setProfessionals] = useState([]);
  const [pendingProfessionals, setPendingProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadAllProfessionals();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadProfessionalsForTab();
    }
  }, [activeTab]);

  const loadAllProfessionals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [pendingData, allProfessionalsData] = await Promise.all([
        professionalsService.getPendingProfessionals().catch(() => []),
        professionalsService.getAllProfessionals().catch(() => [])
      ]);

      setPendingProfessionals(Array.isArray(pendingData) ? pendingData : (pendingData.data || pendingData.items || []));
      setProfessionals(Array.isArray(allProfessionalsData) ? allProfessionalsData : (allProfessionalsData.data || allProfessionalsData.items || []));
    } catch (err) {
      const errorMessage = err.message || 'Erro ao carregar profissionais. Verifique se você tem permissão de administrador.';
      setError(errorMessage);
      console.error('Erro detalhado:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProfessionalsForTab = async () => {
    try {
      setError(null);
      
      if (activeTab === 'pending') {
        const data = await professionalsService.getPendingProfessionals();
        setPendingProfessionals(Array.isArray(data) ? data : (data.data || data.items || []));
      } else {
        const data = await professionalsService.getAllProfessionals();
        setProfessionals(Array.isArray(data) ? data : (data.data || data.items || []));
      }
    } catch (err) {
      const errorMessage = err.message || 'Erro ao carregar profissionais. Verifique se você tem permissão de administrador.';
      setError(errorMessage);
      console.error('Erro detalhado:', err);
    }
  };

  const loadProfessionals = async () => {
    await loadAllProfessionals();
  };

  const handleVerify = async (professionalId) => {
    if (!window.confirm('Tem certeza que deseja verificar este profissional? Ele poderá aparecer nas listas.')) {
      return;
    }

    try {
      setError(null);
      await professionalsService.verifyProfessional(professionalId);
      await loadProfessionals();
    } catch (err) {
      setError(err.message || 'Erro ao verificar profissional');
    }
  };

  const handleReject = async (professionalId) => {
    if (!window.confirm('Tem certeza que deseja rejeitar este profissional? Ele não poderá fazer login.')) {
      return;
    }

    try {
      setError(null);
      await professionalsService.rejectProfessional(professionalId);
      await loadProfessionals();
    } catch (err) {
      setError(err.message || 'Erro ao rejeitar profissional');
    }
  };

  const handleBlock = async (professionalId) => {
    if (!window.confirm('Tem certeza que deseja bloquear este profissional? Ele não poderá mais fazer login.')) {
      return;
    }

    try {
      setError(null);
      await professionalsService.blockProfessional(professionalId);
      await loadProfessionals();
    } catch (err) {
      setError(err.message || 'Erro ao bloquear profissional');
    }
  };

  const getProfessionalTypeLabel = (type) => {
    const types = {
      'seamstress': 'Costureira',
      'tailor': 'Alfaiate',
      'stylist': 'Estilista',
      'designer': 'Designer',
      'other': 'Outro',
    };
    return types[type] || type || 'N/A';
  };

  if (loading) {
    return (
      <div className="professionals-management">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando profissionais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="professionals-management">
      <header className="section-header">
        <div>
          <h1>Gestão de Profissionais</h1>
          <p className="subtitle">
            Avalie e gerencie os profissionais candidatos. Verifique ou rejeite profissionais para que possam atuar na plataforma.
          </p>
        </div>
        <button className="refresh-button" onClick={loadProfessionals}>
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

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <FaClock style={{ marginRight: '0.5rem' }} />
          Pendentes ({pendingProfessionals.length})
        </button>
        <button
          className={`tab ${activeTab === 'verified' ? 'active' : ''}`}
          onClick={() => setActiveTab('verified')}
        >
          <FaCheckCircle style={{ marginRight: '0.5rem' }} />
          Verificados ({professionals.filter(p => p.is_verified).length})
        </button>
        <button
          className={`tab ${activeTab === 'blocked' ? 'active' : ''}`}
          onClick={() => setActiveTab('blocked')}
        >
          <FaBan style={{ marginRight: '0.5rem' }} />
          Bloqueados ({professionals.filter(p => p.user?.is_blocked).length})
        </button>
      </div>

      <div className="professionals-container">
        {activeTab === 'pending' && (
          <div className="professionals-list">
            {pendingProfessionals.length === 0 ? (
              <div className="empty-state">
                <p>Nenhum profissional pendente de verificação</p>
              </div>
            ) : (
              pendingProfessionals.map((professional) => (
                <div key={professional.id} className="professional-card pending">
                  <div className="professional-header">
                    <div>
                      <h3>{professional.user?.name || 'Sem nome'}</h3>
                      <p className="professional-email">{professional.user?.email}</p>
                    </div>
                    <span className="status-badge pending">
                      <FaClock style={{ marginRight: '0.25rem' }} />
                      Pendente
                    </span>
                  </div>
                  
                  <div className="professional-details">
                    <div className="detail-item">
                      <strong>Tipo:</strong> {getProfessionalTypeLabel(professional.type)}
                    </div>
                    <div className="detail-item">
                      <strong>Bio:</strong> {professional.bio || 'N/A'}
                    </div>
                    <div className="detail-item">
                      <strong>Anos de Experiência:</strong> {professional.years_experience || 'N/A'}
                    </div>
                    <div className="detail-item">
                      <strong>Preço Base:</strong> R$ {professional.base_price || '0.00'}
                    </div>
                    <div className="detail-item">
                      <strong>Data de Cadastro:</strong> {new Date(professional.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>

                  <div className="professional-actions">
                    <button
                      className="action-btn approve-btn"
                      onClick={() => handleVerify(professional.id)}
                    >
                      <FaCheckCircle style={{ marginRight: '0.25rem' }} />
                      Verificar
                    </button>
                    <button
                      className="action-btn reject-btn"
                      onClick={() => handleReject(professional.id)}
                    >
                      <FaTimes style={{ marginRight: '0.25rem' }} />
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'verified' && (
          <div className="professionals-list">
            {professionals.filter(p => p.is_verified).length === 0 ? (
              <div className="empty-state">
                <p>Nenhum profissional verificado</p>
              </div>
            ) : (
              professionals
                .filter(p => p.is_verified)
                .map((professional) => (
                  <div key={professional.id} className="professional-card approved">
                    <div className="professional-header">
                      <div>
                        <h3>{professional.user?.name || 'Sem nome'}</h3>
                        <p className="professional-email">{professional.user?.email}</p>
                      </div>
                      <span className="status-badge approved">
                        <FaCheckCircle style={{ marginRight: '0.25rem' }} />
                        Verificado
                      </span>
                    </div>
                    
                    <div className="professional-details">
                      <div className="detail-item">
                        <strong>Tipo:</strong> {getProfessionalTypeLabel(professional.type)}
                      </div>
                      <div className="detail-item">
                        <strong>Anos de Experiência:</strong> {professional.years_experience || 'N/A'}
                      </div>
                      <div className="detail-item">
                        <strong>Preço Base:</strong> R$ {professional.base_price || '0.00'}
                      </div>
                    </div>

                    <div className="professional-actions">
                      <button
                        className="action-btn block-btn"
                        onClick={() => handleBlock(professional.id)}
                      >
                        <FaBan style={{ marginRight: '0.25rem' }} />
                        Bloquear
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}

        {activeTab === 'blocked' && (
          <div className="professionals-list">
            {professionals.filter(p => p.user?.is_blocked).length === 0 ? (
              <div className="empty-state">
                <p>Nenhum profissional bloqueado</p>
              </div>
            ) : (
              professionals
                .filter(p => p.user?.is_blocked)
                .map((professional) => (
                  <div key={professional.id} className="professional-card blocked">
                    <div className="professional-header">
                      <div>
                        <h3>{professional.user?.name || 'Sem nome'}</h3>
                        <p className="professional-email">{professional.user?.email}</p>
                      </div>
                      <span className="status-badge blocked">
                        <FaBan style={{ marginRight: '0.25rem' }} />
                        Bloqueado
                      </span>
                    </div>
                    
                    <div className="professional-details">
                      <div className="detail-item">
                        <strong>Tipo:</strong> {getProfessionalTypeLabel(professional.type)}
                      </div>
                    </div>

                    <div className="professional-actions">
                      <button
                        className="action-btn approve-btn"
                        onClick={() => handleVerify(professional.id)}
                      >
                        <FaCheckCircle style={{ marginRight: '0.25rem' }} />
                        Desbloquear
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalsManagement;

