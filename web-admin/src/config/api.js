// Configuração da API - detecta automaticamente o host
const getApiBaseUrl = () => {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;
  
  console.log('🌐 Detectando ambiente:', { hostname, protocol, port });
  
  // Verificar se há uma URL configurada manualmente no localStorage
  const manualApiUrl = localStorage.getItem('@rent-roupa:api-url');
  if (manualApiUrl) {
    console.log('📍 Usando URL da API configurada manualmente:', manualApiUrl);
    return manualApiUrl;
  }
  
  // SEMPRE usar o servidor de produção (mesmo que o app mobile)
  // Para usar servidor local, configure manualmente no localStorage:
  // localStorage.setItem('@rent-roupa:api-url', 'http://localhost:8000/api')
  const productionApiUrl = 'https://api.vestme.cloud/api';
  console.log('📍 Usando servidor de produção (mesmo do app mobile):', productionApiUrl);
  return productionApiUrl;
  
  // Código antigo (comentado para referência):
  /*
  // Se for localhost ou IP local, usar o mesmo host para a API
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const apiUrl = 'http://localhost:8000/api';
    console.log('📍 Ambiente local detectado, usando backend local:', apiUrl);
    return apiUrl;
  }
  
  // Se for acesso via IP local (10.x, 192.168.x, etc), usar o mesmo IP
  if (hostname.startsWith('10.') || hostname.startsWith('192.168.') || hostname.startsWith('172.')) {
    const apiUrl = `http://${hostname}:8000/api`;
    console.log('📍 Rede local detectada, usando backend no mesmo IP:', apiUrl);
    return apiUrl;
  }
  
  // Se for acesso via IP do servidor de produção
  if (hostname === '72.61.34.177' || hostname.includes('vestme')) {
    const apiUrl = `http://${hostname}/api`;
    console.log('📍 Servidor de produção detectado, usando:', apiUrl);
    return apiUrl;
  }
  
  // Se for o domínio de produção, usar gateway HTTPS
  if (hostname.includes('vestme') || hostname.includes('rent-roupa')) {
    if (protocol === 'https:') {
      const apiUrl = `https://${hostname}/api`;
      console.log('📍 Domínio de produção detectado (HTTPS), usando gateway HTTPS:', apiUrl);
      return apiUrl;
    } else {
      const apiUrl = `http://${hostname}/api`;
      console.log('📍 Domínio de produção detectado (HTTP), usando backend:', apiUrl);
      return apiUrl;
    }
  }
  
  // Default: tentar usar o mesmo hostname com porta 8000
  const apiUrl = `http://${hostname}:8000/api`;
  console.log('📍 Usando URL padrão do backend (mesmo hostname):', apiUrl);
  return apiUrl;
  */
};

export const API_BASE_URL = getApiBaseUrl();

// Log para debug
console.log('🌐 API Base URL configurada:', API_BASE_URL);
console.log('📍 Current hostname:', window.location.hostname);
console.log('📍 Current origin:', window.location.origin);

