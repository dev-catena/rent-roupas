import React, { useState, useEffect } from 'react';
import MainLayout from './components/MainLayout';
import LoginScreen from './components/LoginScreen';
import UsersManagement from './components/UsersManagement';
import ProfessionalsManagement from './components/ProfessionalsManagement';
import ClothingCategoriesManagement from './components/ClothingCategoriesManagement';
import authService from './services/authService';
import './App.css';
import './components/GlobalButtonStyles.css';

function App() {
  const [activeSection, setActiveSection] = useState('clothing-categories');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await authService.checkAuth();
      
      if (!authenticated && authService.getToken()) {
        const storedUser = authService.getUser();
        if (storedUser) {
          setIsAuthenticated(true);
          setUser(storedUser);
        } else {
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(authenticated);
        setUser(authService.getUser());
      }
    } catch (error) {
      if (authService.getToken() && authService.getUser()) {
        setIsAuthenticated(true);
        setUser(authService.getUser());
      } else {
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UsersManagement currentUser={user} onLogout={handleLogout} />;
      case 'professionals':
        return <ProfessionalsManagement />;
      case 'clothing-categories':
        return <ClothingCategoriesManagement />;
      default:
        return <ClothingCategoriesManagement />;
    }
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="App">
        <LoginScreen onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="App">
      <MainLayout 
        activeSection={activeSection} 
        onSectionChange={setActiveSection}
        user={user}
        onLogout={handleLogout}
      >
        {renderContent()}
      </MainLayout>
    </div>
  );
}

export default App;

