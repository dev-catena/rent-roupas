import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import { colors } from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../components/SafeIcon';
import { numberToCurrency } from '../../utils/currencyMask';

// Importar logo ícone
let logoIcon;
try {
  logoIcon = require('../../../assets/logo-vestme-icon.png');
} catch (e) {
  logoIcon = null;
}

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [activeRentals, setActiveRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecommendations();
    loadActiveRentals();
  }, []);

  // Recarrega quando a tela recebe foco (útil após escanear QR Code)
  useFocusEffect(
    React.useCallback(() => {
      loadActiveRentals();
    }, [])
  );

  async function loadRecommendations() {
    try {
      const response = await api.get('/matching/recommendations');
      console.log('Resposta recommendations:', response.data);
      
      if (response.data.success) {
        const data = response.data.data;
        console.log('Data type:', typeof data, 'Is array:', Array.isArray(data));
        console.log('Data:', data);
        
        // Garante que é um array e filtra itens inválidos
        const validRecommendations = Array.isArray(data) 
          ? data.filter(item => item && item.id) 
          : [];
        
        console.log('Valid recommendations:', validRecommendations.length);
        setRecommendations(validRecommendations);
      }
    } catch (error) {
      console.error('Erro ao carregar recomendações:', error);
      // Fallback: tenta carregar itens disponíveis diretamente
      try {
        const fallbackResponse = await api.get('/clothing-items?per_page=20');
        if (fallbackResponse.data.success && fallbackResponse.data.data?.data) {
          const items = Array.isArray(fallbackResponse.data.data.data)
            ? fallbackResponse.data.data.data.filter(item => item && item.id)
            : [];
          setRecommendations(items);
          console.log('Usando fallback: carregados', items.length, 'itens disponíveis');
        } else {
          setRecommendations([]);
        }
      } catch (fallbackError) {
        console.error('Erro no fallback também:', fallbackError);
        setRecommendations([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function loadActiveRentals() {
    try {
      const activeItems = [];
      
      // 1. Busca aluguéis em andamento (como locatário)
      try {
        const rentalsResponse = await api.get('/my-rentals');
        if (rentalsResponse.data.success) {
          const allRentals = Array.isArray(rentalsResponse.data.data) 
            ? rentalsResponse.data.data 
            : (rentalsResponse.data.data?.data || []);
          
          // Filtra apenas os em andamento (não completados nem cancelados)
          const activeRentals = allRentals.filter(rental => 
            rental.status !== 'completed' && 
            rental.status !== 'cancelled' &&
            rental.status !== 'returned'
          );
          
          // Adiciona os aluguéis à lista
          activeItems.push(...activeRentals);
        }
      } catch (rentalError) {
        console.error('Erro ao carregar aluguéis:', rentalError);
      }
      
      // 2. Busca empréstimos em andamento (como proprietário)
      try {
        const lendingsResponse = await api.get('/my-lendings');
        if (lendingsResponse.data.success) {
          const allLendings = Array.isArray(lendingsResponse.data.data) 
            ? lendingsResponse.data.data 
            : (lendingsResponse.data.data?.data || []);
          
          // Backend já retorna apenas em andamento, mas mantemos filtro por segurança
          const activeLendings = allLendings.filter(lending => 
            lending.status !== 'completed' && 
            lending.status !== 'cancelled' &&
            lending.status !== 'returned'
          );
          
          // Adiciona os empréstimos à lista
          activeItems.push(...activeLendings);
        }
      } catch (lendingError) {
        console.error('Erro ao carregar empréstimos:', lendingError);
      }
      
      // 3. Busca negociações ativas do tipo 'rental' (propostas em andamento)
      try {
        const negotiationsResponse = await api.get('/negotiations');
        if (negotiationsResponse.data.success) {
          const allNegotiations = Array.isArray(negotiationsResponse.data.data) 
            ? negotiationsResponse.data.data 
            : (negotiationsResponse.data.data?.data || []);
          
          // Filtra negociações ativas do tipo 'rental' onde o usuário é iniciador OU recipient
          const activeNegotiations = allNegotiations.filter(negotiation => {
            const isActive = negotiation.status === 'active';
            const isRental = negotiation.type === 'rental';
            const isInitiator = negotiation.initiator_id === user?.id || 
                               negotiation.initiator?.id === user?.id;
            const isRecipient = negotiation.recipient_id === user?.id || 
                               negotiation.recipient?.id === user?.id;
            return isActive && isRental && (isInitiator || isRecipient);
          });
          
          // Converte negociações para o formato de "rental" para exibição
          const negotiationsAsRentals = activeNegotiations.map(negotiation => {
            const clothingItem = negotiation.clothing_item || negotiation.clothingItem;
            const isInitiator = negotiation.initiator_id === user?.id || 
                               negotiation.initiator?.id === user?.id;
            
            return {
              id: `negotiation-${negotiation.id}`, // ID único para evitar conflitos
              negotiation_id: negotiation.id,
              status: 'pending', // Status fictício para negociações
              negotiation: {
                id: negotiation.id,
                status: 'active'
              },
              clothingItem: clothingItem,
              clothing_item: clothingItem, // Mantém ambos para compatibilidade
              start_date: negotiation.proposed_start_date,
              end_date: negotiation.proposed_end_date,
              daily_rate: negotiation.proposed_price,
              is_negotiation: true, // Flag para identificar que é uma negociação
              is_initiator: isInitiator, // Flag para saber se o usuário iniciou ou recebeu
              created_at: negotiation.created_at || negotiation.updated_at,
            };
          });
          
          // Adiciona as negociações à lista
          activeItems.push(...negotiationsAsRentals);
        }
      } catch (negotiationError) {
        console.error('Erro ao carregar negociações:', negotiationError);
      }
      
      // Remove duplicatas (se uma negociação virou aluguel, remove a negociação)
      const uniqueItems = [];
      const seenIds = new Set();
      
      activeItems.forEach(item => {
        // Se é uma negociação que já tem um aluguel associado, pula
        if (item.is_negotiation && item.negotiation_id) {
          const hasRental = activeItems.some(rental => 
            !rental.is_negotiation && 
            rental.negotiation?.id === item.negotiation_id
          );
          if (hasRental) {
            return; // Pula esta negociação, já tem o aluguel
          }
        }
        
        // Adiciona apenas se não foi visto antes
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          uniqueItems.push(item);
        }
      });
      
      // Ordena por data de criação (mais recentes primeiro)
      uniqueItems.sort((a, b) => {
        const dateA = new Date(a.created_at || a.start_date || 0);
        const dateB = new Date(b.created_at || b.start_date || 0);
        return dateB - dateA;
      });
      
      setActiveRentals(uniqueItems);
    } catch (error) {
      console.error('Erro ao carregar empréstimos em andamento:', error);
      setActiveRentals([]);
    }
  }

  function getStatusLabel(rental, isOwner = false) {
    if (!rental) return 'Em andamento';
    
    // Se é uma negociação (proposta em andamento)
    if (rental.is_negotiation) {
      return 'Em negociação';
    }
    
    const status = rental.status;
    const negotiationStatus = rental.negotiation?.status;
    
    if (negotiationStatus === 'active') {
      return 'Em negociação';
    }
    if (status === 'pending') {
      return 'Aguardando confirmação';
    }
    if (status === 'confirmed') {
      // Se o usuário é o proprietário, mostra "Aceito por você"
      return isOwner ? 'Aceito por você' : 'Aceito pelo proprietário';
    }
    if (status === 'active') {
      // Verifica se está em atraso
      if (rental.end_date) {
        const today = new Date();
        const endDate = new Date(rental.end_date);
        if (!isNaN(endDate.getTime()) && today > endDate) {
          return 'Em atraso de entrega';
        }
      }
      return 'Aguardando devolução';
    }
    if (status === 'adjustment_needed') {
      return 'Aguardando ajuste';
    }
    if (status === 'ready') {
      return 'Pronto para retirada';
    }
    return 'Em andamento';
  }

  function getStatusColor(rental) {
    if (!rental) return '#6b7280';
    
    // Se é uma negociação (proposta em andamento)
    if (rental.is_negotiation) {
      return '#f59e0b'; // Amarelo/laranja
    }
    
    const status = rental.status;
    const negotiationStatus = rental.negotiation?.status;
    
    if (negotiationStatus === 'active') {
      return '#f59e0b'; // Amarelo/laranja
    }
    if (status === 'pending') {
      return '#3b82f6'; // Azul
    }
    if (status === 'confirmed') {
      return '#10b981'; // Verde
    }
    if (status === 'active') {
      // Verifica se está em atraso
      if (rental.end_date) {
        const today = new Date();
        const endDate = new Date(rental.end_date);
        if (!isNaN(endDate.getTime()) && today > endDate) {
          return '#ef4444'; // Vermelho para atraso
        }
      }
      return '#6366f1'; // Roxo
    }
    if (status === 'adjustment_needed') {
      return '#f59e0b'; // Amarelo
    }
    return '#6b7280'; // Cinza
  }

  async function handlePayment(rental) {
    Alert.alert(
      'Confirmar Pagamento',
      `Deseja realizar o pagamento de ${numberToCurrency(rental.total_amount || rental.daily_rate || 0)}?\n\n` +
      '⚠️ IMPORTANTE: O proprietário só receberá o pagamento após você confirmar que recebeu a roupa.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pagar',
          onPress: async () => {
            try {
              const response = await api.post(`/rentals/${rental.id}/payment`, {
                payment_method: 'pix' // Por enquanto fixo, depois pode ser selecionável
              });
              
              if (response.data.success) {
                Alert.alert(
                  'Pagamento Realizado',
                  'Seu pagamento foi processado com sucesso!\n\n' +
                  'O proprietário foi notificado e deve preparar a roupa para entrega.\n\n' +
                  'Após receber a roupa, confirme o recebimento para liberar o pagamento ao proprietário.',
                  [{ text: 'OK', onPress: () => loadActiveRentals() }]
                );
              }
            } catch (error) {
              console.error('Erro ao processar pagamento:', error);
              Alert.alert(
                'Erro',
                error.response?.data?.message || 'Não foi possível processar o pagamento. Tente novamente.'
              );
            }
          }
        }
      ]
    );
  }

  async function handleConfirmPickup(rental) {
    Alert.alert(
      'Confirmar Recebimento',
      'Você confirma que recebeu a roupa?\n\n' +
      'Ao confirmar, o pagamento será liberado para o proprietário.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const response = await api.post(`/rentals/${rental.id}/confirm-pickup`);
              
              if (response.data.success) {
                Alert.alert(
                  'Recebimento Confirmado',
                  'O pagamento foi liberado para o proprietário.',
                  [{ text: 'OK', onPress: () => loadActiveRentals() }]
                );
              }
            } catch (error) {
              console.error('Erro ao confirmar recebimento:', error);
              Alert.alert(
                'Erro',
                error.response?.data?.message || 'Não foi possível confirmar o recebimento. Tente novamente.'
              );
            }
          }
        }
      ]
    );
  }

  async function handleScanQRCode(rental) {
    // Navega para a tela de escanear QR Code
    navigation.navigate('QRCodeScan', {
      rentalId: rental.id,
    });
  }

  async function handleShowQRCode(rental) {
    // Navega para a tela de exibir QR Code
    try {
      const response = await api.get(`/rentals/${rental.id}/delivery-qrcode`);
      if (response.data.success) {
        navigation.navigate('QRCodeGenerate', {
          qrCode: response.data.data.qr_code,
          title: 'QR Code para Recebimento',
          subtitle: 'Mostre este QR Code ao proprietário na hora de receber a roupa',
          qrData: response.data.data
        });
      }
    } catch (error) {
      console.error('Erro ao obter QR Code:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível obter o QR Code. Tente novamente.'
      );
    }
  }

  async function handleRentalPress(rental) {
    // Se é uma negociação (proposta em andamento), sempre vai para a conversa
    if (rental.is_negotiation && rental.negotiation_id) {
      navigation.navigate('Profile', {
        screen: 'ChatDetail',
        params: { negotiationId: rental.negotiation_id }
      });
      return;
    }
    
    // Se está em negociação ou aceito, vai para a conversa
    if (rental.negotiation?.status === 'active' || rental.status === 'confirmed' || rental.status === 'pending') {
      let negotiationId = rental.negotiation?.id;
      
      // Se não tem negociação no relacionamento, busca pela negociação do aluguel
      if (!negotiationId && rental.id && !rental.id.toString().startsWith('negotiation-')) {
        try {
          const response = await api.get(`/negotiations`);
          if (response.data.success) {
            const negotiations = Array.isArray(response.data.data) 
              ? response.data.data 
              : (response.data.data?.data || []);
            const negotiation = negotiations.find(n => n.rental_id === rental.id);
            if (negotiation) {
              negotiationId = negotiation.id;
            }
          }
        } catch (error) {
          console.error('Erro ao buscar negociação:', error);
        }
      }
      
      if (negotiationId) {
        navigation.navigate('Profile', {
          screen: 'ChatDetail',
          params: { negotiationId }
        });
      } else {
        // Se não encontrou negociação, vai para a lista de conversas
        navigation.navigate('Profile', {
          screen: 'Chats'
        });
      }
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadRecommendations();
    loadActiveRentals();
  }

  function renderItem({ item }) {
    // Proteção robusta contra itens inválidos
    if (!item || !item.id) {
      console.warn('Item inválido no renderItem:', item);
      return <View style={{ width: '50%', padding: 5 }} />;
    }
    
    // Garantir que todos os valores são strings válidas
    const title = item.title ? String(item.title) : 'Sem título';
    const price = item.price_per_day ? String(item.price_per_day) : '0';
    const distance = item.distance && typeof item.distance === 'number' ? item.distance : null;
    const matchScore = item.match_score && typeof item.match_score === 'number' && item.match_score > 0 ? item.match_score : null;
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
      >
        {item.primary_photo?.url ? (
          <Image source={{ uri: item.primary_photo.url }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text style={styles.cardImagePlaceholderText}>Sem foto</Text>
          </View>
        )}
        
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.cardPrice}>
            {`R$ ${price}/dia`}
          </Text>
          
          {distance !== null && (
            <View style={styles.cardDistanceContainer}>
              <SafeIcon name="location" size={14} color={colors.gray} />
              <Text style={styles.cardDistance}>
                {` ${distance.toFixed(1)} km de você`}
              </Text>
            </View>
          )}
          
          {matchScore !== null && (
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>
                {`${Math.round(matchScore)}% compatível`}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {logoIcon && (
          <Image 
            source={logoIcon} 
            style={styles.logoIcon}
            resizeMode="contain"
          />
        )}
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Recomendações</Text>
          {user?.name && (
            <Text style={styles.headerUserName}>Olá, {user.name}</Text>
          )}
        </View>
      </View>

      <FlatList
        data={recommendations}
        renderItem={renderItem}
        keyExtractor={(item, index) => {
          if (item?.id) {
            return item.id.toString();
          }
          return `item-${index}`;
        }}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          activeRentals.length > 0 ? (
            <View style={styles.activeRentalsSection}>
              <Text style={styles.activeRentalsTitle}>Empréstimos em Andamento</Text>
              <FlatList
                horizontal
                data={activeRentals}
                keyExtractor={(item) => {
                  if (item?.id) {
                    return item.id.toString();
                  }
                  return `rental-${Math.random()}`;
                }}
                renderItem={({ item: rental }) => {
                  if (!rental || !rental.id) {
                    return <View style={{ width: 200 }} />;
                  }
                  
                  // Verifica se o usuário é locatário ou proprietário antes de chamar getStatusLabel
                  let isRenter = false;
                  let isOwner = false;
                  
                  if (rental.is_negotiation) {
                    // Para negociações, verifica se é iniciador ou recipient
                    isRenter = rental.initiator_id === user?.id || rental.initiator?.id === user?.id;
                    isOwner = rental.recipient_id === user?.id || rental.recipient?.id === user?.id;
                  } else {
                    // Para aluguéis, verifica renter_id e owner_id
                    isRenter = rental.renter_id === user?.id || rental.renter?.id === user?.id;
                    isOwner = rental.owner_id === user?.id || rental.owner?.id === user?.id;
                  }
                  
                  const statusLabel = getStatusLabel(rental, isOwner);
                  const statusColor = getStatusColor(rental);
                  // É clicável se for negociação ou se estiver em negociação/aceito/pendente
                  const isClickable = rental.is_negotiation || 
                                     rental.negotiation?.status === 'active' || 
                                     rental.status === 'confirmed' || 
                                     rental.status === 'pending';
                  
                  // O backend retorna como clothingItem (camelCase)
                  const clothingItem = rental.clothingItem || rental.clothing_item;
                  
                  // Status de pagamento
                  const paymentStatus = rental.payment_status || 'pending';
                  const isPaid = paymentStatus === 'paid';
                  const pickedUpAt = rental.picked_up_at || null;
                  const rentalStatus = rental.status || 'pending';
                  
                  // Verifica se precisa pagar (apenas para aluguéis confirmados, não negociações)
                  const needsPayment = !isPaid && isRenter && !rental.is_negotiation && 
                                      (rentalStatus === 'confirmed' || rentalStatus === 'ready');
                  
                  // Verifica se precisa confirmar recebimento
                  const needsPickupConfirmation = isPaid && isRenter && !pickedUpAt && rentalStatus === 'ready';
                  
                  // Avisos para o proprietário
                  const ownerNeedsToPrepare = isPaid && isOwner && !pickedUpAt && rentalStatus !== 'ready';
                  const ownerNeedsToRequestConfirmation = isPaid && isOwner && rentalStatus === 'ready' && !pickedUpAt;
                  
                  return (
                    <View style={styles.rentalCardContainer}>
                      <TouchableOpacity
                        style={[styles.rentalCard, isClickable && styles.rentalCardClickable]}
                        onPress={() => handleRentalPress(rental)}
                        disabled={!isClickable}
                      >
                        {clothingItem?.primary_photo?.url ? (
                          <Image 
                            source={{ uri: clothingItem.primary_photo.url }} 
                            style={styles.rentalImage} 
                          />
                        ) : (
                          <View style={styles.rentalImagePlaceholder}>
                            <Text style={styles.rentalImagePlaceholderText}>Sem foto</Text>
                          </View>
                        )}
                        <View style={styles.rentalContent}>
                          <Text style={styles.rentalTitle} numberOfLines={1}>
                            {clothingItem?.title ? String(clothingItem.title) : 'Peça sem título'}
                          </Text>
                          {statusLabel && (
                            <View style={[styles.statusBadge, { backgroundColor: `${statusColor || '#6b7280'}20` }]}>
                              <View style={[styles.statusDot, { backgroundColor: statusColor || '#6b7280' }]} />
                              <Text style={[styles.statusText, { color: statusColor || '#6b7280' }]}>
                                {String(statusLabel)}
                              </Text>
                            </View>
                          )}
                          {rental.start_date && rental.end_date && (
                            <Text style={styles.rentalDate}>
                              {new Date(rental.start_date).toLocaleDateString('pt-BR')} - {new Date(rental.end_date).toLocaleDateString('pt-BR')}
                            </Text>
                          )}
                          
                          {/* Avisos para locatário */}
                          {needsPayment && (
                            <View style={styles.paymentWarning}>
                              <Text style={styles.paymentWarningText}>
                                💳 Pagamento pendente
                              </Text>
                            </View>
                          )}
                          {needsPickupConfirmation && (
                            <View style={styles.paymentWarning}>
                              <Text style={styles.paymentWarningText}>
                                ✅ Confirme o recebimento
                              </Text>
                            </View>
                          )}
                          
                          {/* Avisos para proprietário */}
                          {isOwner && rentalStatus === 'confirmed' && !isPaid && (
                            <View style={styles.paymentInfo}>
                              <Text style={styles.paymentInfoText}>
                                📦 Prepare a roupa para ser entregue
                              </Text>
                            </View>
                          )}
                          {ownerNeedsToPrepare && (
                            <View style={styles.paymentInfo}>
                              <Text style={styles.paymentInfoText}>
                                💰 Pagamento recebido! Prepare a roupa para entrega.
                              </Text>
                            </View>
                          )}
                          {ownerNeedsToRequestConfirmation && (
                            <View style={styles.paymentInfo}>
                              <Text style={styles.paymentInfoText}>
                                📦 Peça ao locatário para confirmar o recebimento para liberar o pagamento.
                              </Text>
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                      
                      {/* Botões de ação */}
                      {needsPayment && (
                        <TouchableOpacity
                          style={styles.paymentButton}
                          onPress={() => handlePayment(rental)}
                        >
                          <SafeIcon name="card" size={16} color="#fff" />
                          <Text style={styles.paymentButtonText}>Pagar</Text>
                        </TouchableOpacity>
                      )}
                      {isPaid && isRenter && rentalStatus === 'confirmed' && !pickedUpAt && (
                        <TouchableOpacity
                          style={styles.qrCodeButton}
                          onPress={() => handleShowQRCode(rental)}
                        >
                          <SafeIcon name="qr-code" size={16} color="#fff" />
                          <Text style={styles.qrCodeButtonText}>Ver QR Code</Text>
                        </TouchableOpacity>
                      )}
                      {needsPickupConfirmation && (
                        <TouchableOpacity
                          style={styles.confirmButton}
                          onPress={() => handleConfirmPickup(rental)}
                        >
                          <SafeIcon name="checkmark-circle" size={16} color="#fff" />
                          <Text style={styles.confirmButtonText}>Confirmar Recebimento</Text>
                        </TouchableOpacity>
                      )}
                      {isOwner && isPaid && rentalStatus === 'confirmed' && !pickedUpAt && (
                        <TouchableOpacity
                          style={styles.scanButton}
                          onPress={() => handleScanQRCode(rental)}
                        >
                          <SafeIcon name="qr-code" size={16} color="#fff" />
                          <Text style={styles.scanButtonText}>Leia o QR Code para confirmar a entrega</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                }}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.activeRentalsList}
              />
            </View>
          ) : <View />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma recomendação disponível</Text>
            <Text style={styles.emptySubtext}>
              Configure suas medidas para receber sugestões personalizadas
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 40,
    height: 40,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerUserName: {
    fontSize: 14,
    color: colors.accent,
    marginTop: 4,
    fontWeight: '500',
  },
  listContent: {
    padding: 10,
  },
  card: {
    flex: 1,
    margin: 5,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImagePlaceholderText: {
    color: colors.textLight,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  cardDistanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cardDistance: {
    fontSize: 12,
    color: colors.gray,
  },
  matchBadge: {
    backgroundColor: colors.successLight,
    padding: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  matchText: {
    fontSize: 11,
    color: colors.success,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
  },
  activeRentalsSection: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  activeRentalsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  activeRentalsList: {
    paddingRight: 16,
  },
  rentalCard: {
    width: 200,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    shadowColor: colors.dark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  rentalCardClickable: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  rentalImage: {
    width: '100%',
    height: 120,
  },
  rentalImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: colors.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rentalImagePlaceholderText: {
    color: colors.textLight,
    fontSize: 12,
  },
  rentalContent: {
    padding: 12,
  },
  rentalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  rentalDate: {
    fontSize: 11,
    color: colors.gray,
  },
  rentalCardContainer: {
    width: 200,
    marginRight: 12,
  },
  paymentButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  paymentButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  paymentWarning: {
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  paymentWarningText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '500',
  },
  paymentInfo: {
    backgroundColor: '#dbeafe',
    padding: 8,
    borderRadius: 6,
    marginTop: 6,
  },
  paymentInfoText: {
    fontSize: 11,
    color: '#1e40af',
    fontWeight: '500',
  },
  scanButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  scanButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  qrCodeButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
  },
  qrCodeButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

