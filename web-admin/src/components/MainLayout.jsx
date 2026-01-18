import React from 'react';
import { FaUsers, FaCut, FaTshirt, FaSignOutAlt } from 'react-icons/fa';
import './MainLayout.css';

const MainLayout = ({ activeSection, onSectionChange, children, user, onLogout }) => {
  const sections = [
    { id: 'users', label: 'Usuários', icon: FaUsers },
    { id: 'professionals', label: 'Profissionais', icon: FaCut },
    { id: 'clothing-categories', label: 'Tipos de Roupas', icon: FaTshirt },
  ];

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>Rent Roupa</h1>
          <p className="subtitle">Gestão Administrativa</p>
        </div>
        <nav className="sidebar-nav">
          {sections.map((section) => {
            const IconComponent = section.icon;
            return (
              <button
                key={section.id}
                className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => onSectionChange(section.id)}
              >
                <span className="nav-icon"><IconComponent /></span>
                <span className="nav-label">{section.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{user?.name || 'Admin'}</span>
            <span className="user-email">{user?.email || ''}</span>
          </div>
          <button className="logout-button" onClick={onLogout}>
            <FaSignOutAlt style={{ marginRight: '0.5rem' }} />
            Sair
          </button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;

