import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * SafeIcon - Componente seguro para renderizar ícones
 * Garante que sempre renderiza um ícone válido, mesmo se o nome não existir
 * 
 * @param {string} name - Nome do ícone do Ionicons
 * @param {number} size - Tamanho do ícone (padrão: 24)
 * @param {string} color - Cor do ícone (padrão: '#000')
 * @param {object} style - Estilos adicionais
 * @param {string} fallback - Nome do ícone fallback caso o principal não exista
 */
export default function SafeIcon({ 
  name, 
  size = 24, 
  color = '#000', 
  style = {},
  fallback = 'help-circle-outline',
  ...props 
}) {
  // Mapeamento de nomes customizados para ícones do Ionicons
  const iconMap = {
    // Ícones de arquivo/documento
    'folder': 'folder',
    'folder-outline': 'folder-outline',
    'receipt': 'receipt',
    'receipt-outline': 'receipt-outline',
    'document-text': 'document-text',
    'document-text-outline': 'document-text-outline',
    'document': 'document',
    'document-outline': 'document-outline',
    'document-attach': 'document-attach',
    'document-attach-outline': 'document-attach-outline',
    
    // Ícones de calendário
    'calendar': 'calendar',
    'calendar-outline': 'calendar-outline',
    
    // Ícones de laboratório/química
    'flask': 'flask',
    'flask-outline': 'flask-outline',
    
    // Ícones de imagem
    'image': 'image',
    'image-outline': 'image-outline',
    'images': 'images',
    'images-outline': 'images-outline',
    'camera': 'camera',
    'camera-outline': 'camera-outline',
    
    // Ícones de ação
    'close': 'close',
    'close-circle': 'close-circle',
    'close-circle-outline': 'close-circle-outline',
    'add': 'add',
    'add-circle': 'add-circle',
    'add-circle-outline': 'add-circle-outline',
    'remove': 'remove',
    'remove-circle': 'remove-circle',
    'remove-circle-outline': 'remove-circle-outline',
    'trash': 'trash',
    'trash-outline': 'trash-outline',
    'checkmark': 'checkmark',
    'checkmark-circle': 'checkmark-circle',
    'checkmark-circle-outline': 'checkmark-circle-outline',
    
    // Ícones de segurança e bloqueio
    'lock-closed': 'lock-closed',
    'lock-closed-outline': 'lock-closed-outline',
    'lock-open': 'lock-open',
    'lock-open-outline': 'lock-open-outline',
    
    // Ícones de visualização
    'eye': 'eye',
    'eye-outline': 'eye-outline',
    'eye-off': 'eye-off',
    'eye-off-outline': 'eye-off-outline',
    
    // Ícones de perfil e usuário
    'person': 'person',
    'person-outline': 'person-outline',
    'home': 'home',
    'home-outline': 'home-outline',
    'construct': 'construct',
    'construct-outline': 'construct-outline',
    'swap-horizontal': 'swap-horizontal',
    'swap-horizontal-outline': 'swap-horizontal-outline',
    
    // Ícones de menu e navegação
    'resize': 'resize',
    'resize-outline': 'resize-outline',
    'cube': 'cube',
    'cube-outline': 'cube-outline',
    'chatbubbles': 'chatbubbles',
    'chatbubbles-outline': 'chatbubbles-outline',
    'create': 'create',
    'create-outline': 'create-outline',
    'settings': 'settings',
    'settings-outline': 'settings-outline',
    'information-circle': 'information-circle',
    'information-circle-outline': 'information-circle-outline',
    'chevron-forward': 'chevron-forward',
    'chevron-back': 'chevron-back',
    
    // Ícones de localização
    'location': 'location',
    'location-outline': 'location-outline',
    
    // Ícones de roupa e moda
    'shirt': 'shirt',
    'shirt-outline': 'shirt-outline',
    'color-palette': 'color-palette',
    'color-palette-outline': 'color-palette-outline',
    
    // Ícones de pagamento
    'card': 'card',
    'card-outline': 'card-outline',
    'search': 'search',
    'search-outline': 'search-outline',
    
    // Ícones de QR Code
    'qr-code': 'qr-code',
    'qr-code-outline': 'qr-code-outline',
  };

  // Busca o nome do ícone no mapa, ou usa o nome fornecido diretamente
  const iconName = iconMap[name] || name || fallback;

  try {
    return (
      <Icon 
        name={iconName} 
        size={size} 
        color={color} 
        style={style}
        {...props}
      />
    );
  } catch (error) {
    // Se houver erro, renderiza o ícone fallback
    console.warn(`Ícone "${name}" não encontrado, usando fallback "${fallback}"`);
    return (
      <Icon 
        name={fallback} 
        size={size} 
        color={color} 
        style={style}
        {...props}
      />
    );
  }
}

