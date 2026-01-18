import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { API_BASE_URL } from '../config/api';
import './LoginScreen.css';

const LoginScreen = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [manualApiUrl, setManualApiUrl] = useState('');

  useEffect(() => {
    // Carregar URL da API configurada manualmente
    const savedUrl = localStorage.getItem('@rent-roupa:api-url');
    if (savedUrl) {
      setManualApiUrl(savedUrl);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'omit',
        body: JSON.stringify({ email, password }),
      });

      let data = {};
      const text = await response.text();
      
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Erro ao parsear JSON:', parseError);
          if (text.includes('<!DOCTYPE') || text.includes('<html')) {
            data = {
              message: response.status === 403 
                ? 'Acesso negado. Sua conta foi bloqueada.'
                : 'Erro no servidor. Tente novamente mais tarde.',
              error: response.status === 403 ? 'account_blocked' : 'server_error'
            };
          } else {
            data = {
              message: text.substring(0, 100) || (response.status === 403 
                ? 'Acesso negado. Sua conta foi bloqueada.'
                : 'Erro ao processar resposta do servidor'),
              error: response.status === 403 ? 'account_blocked' : 'parse_error'
            };
          }
        }
      }

      if (!response.ok) {
        if (response.status === 403) {
          const blockedMessage = data.message || data.error || 'Acesso negado. Sua conta foi bloqueada.';
          throw new Error(blockedMessage.includes('bloqueada') || data.error === 'account_blocked' 
            ? 'Acesso negado. Sua conta foi bloqueada.'
            : blockedMessage);
        }
        const errorMessage = data.message || data.error || `Erro ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      if (data.token) {
        localStorage.setItem('@rent-roupa:token', data.token);
        localStorage.setItem('@rent-roupa:user', JSON.stringify(data.user));
      }

      onLogin(data.user);
    } catch (err) {
      let errorMessage = err.message || 'Erro ao fazer login. Verifique suas credenciais.';
      
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('conectar ao servidor'))) {
        errorMessage = `Não foi possível conectar ao servidor em ${API_BASE_URL}.\n\nVerifique:\n` +
          '• Se o backend Laravel está rodando\n' +
          '• Se a URL da API está correta (veja Configurações de API abaixo)\n' +
          '• Sua conexão com a internet\n' +
          '• Se há bloqueio de firewall ou proxy\n' +
          '• Abra o console do navegador (F12) para mais detalhes';
      }
      
      setError(errorMessage);
      console.error('Erro no login:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Rent Roupa</h1>
          <p>Gestão Administrativa - Acesso Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              <FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                required
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span>
                Entrando...
              </>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="footer-text">
            Apenas usuários com permissão de administrador podem acessar este sistema.
          </p>
          <details style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666' }}>
            <summary style={{ cursor: 'pointer', userSelect: 'none' }}>🔧 Configurações de API</summary>
            <div style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f5f5f5', borderRadius: '4px' }}>
              <p style={{ margin: '0 0 0.5rem 0' }}><strong>URL da API atual:</strong> {API_BASE_URL}</p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="http://localhost:8000/api"
                  value={manualApiUrl}
                  onChange={(e) => setManualApiUrl(e.target.value)}
                  style={{ flex: 1, padding: '0.25rem', fontSize: '0.85rem' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (manualApiUrl) {
                      localStorage.setItem('@rent-roupa:api-url', manualApiUrl);
                      alert('URL da API configurada! Recarregue a página.');
                      window.location.reload();
                    } else {
                      localStorage.removeItem('@rent-roupa:api-url');
                      alert('URL da API resetada! Recarregue a página.');
                      window.location.reload();
                    }
                  }}
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  {manualApiUrl ? 'Salvar' : 'Resetar'}
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

