import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import api from '../../config/api';
import { useAuth } from '../../contexts/AuthContext'
import { colors } from '../../constants/colors';;

export default function ProfessionalsListScreen({ route, navigation }) {
  const { user } = useAuth();
  const { negotiationId } = route.params || {};
  
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('rating'); // rating ou distance

  useEffect(() => {
    loadProfessionals();
  }, [sortBy]);

  async function loadProfessionals() {
    try {
      const params = {
        sort_by: sortBy,
        sort_order: 'desc',
      };

      const response = await api.get('/professionals', { params });
      
      if (response.data.success) {
        let profList = response.data.data.data;
        
        // Calcula distância se usuário tem localização
        if (user?.latitude && user?.longitude) {
          profList = profList.map(prof => {
            if (prof.workshop_latitude && prof.workshop_longitude) {
              const distance = calculateDistance(
                user.latitude,
                user.longitude,
                prof.workshop_latitude,
                prof.workshop_longitude
              );
              return { ...prof, distance };
            }
            return prof;
          });

          // Reordena por distância se esse for o critério
          if (sortBy === 'distance') {
            profList.sort((a, b) => (a.distance || 999) - (b.distance || 999));
          }
        }

        setProfessionals(profList);
      }
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Raio da Terra em km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  }

  function toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  function onRefresh() {
    setRefreshing(true);
    loadProfessionals();
  }

  function renderStars(rating) {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push('⭐');
      } else if (i === fullStars && hasHalfStar) {
        stars.push('⭐');
      } else {
        stars.push('☆');
      }
    }
    return stars.join('');
  }

  function getProfessionalTypeLabel(type) {
    const types = {
      seamstress: '🧵 Costureira',
      tailor: '✂️ Alfaiate',
      designer: '👗 Designer',
      stylist: '💄 Estilista',
      other: '🔧 Profissional',
    };
    return types[type] || type;
  }

  async function handleSelectProfessional(professional) {
    if (negotiationId) {
      // Se veio de uma negociação, adiciona o profissional à negociação
      try {
        const response = await api.put(`/negotiations/${negotiationId}/professional`, {
          professional_id: professional.id
        });
        
        if (response.data.success) {
          Alert.alert(
            'Profissional Selecionado!',
            `${professional.user.name} foi adicionado(a) à negociação.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  // Navega de volta para o chat, recarregando os dados
                  navigation.navigate('ChatDetail', { negotiationId });
                }
              }
            ]
          );
        }
      } catch (error) {
        console.error('Erro ao adicionar profissional:', error);
        Alert.alert('Erro', 'Não foi possível adicionar o profissional à negociação');
      }
    } else {
      // Senão, apenas mostra os detalhes
      navigation.navigate('ProfessionalDetail', { professionalId: professional.id });
    }
  }

  function renderItem({ item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleSelectProfessional(item)}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.name}>{item.user.name}</Text>
            <Text style={styles.type}>{getProfessionalTypeLabel(item.type)}</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.stars}>{renderStars(item.rating)}</Text>
              <Text style={styles.ratingText}>
                {item.rating && typeof item.rating === 'number' ? item.rating.toFixed(1) : 'Novo'} ({item.reviews_count || 0} avaliações)
              </Text>
            </View>
          </View>
          {item.is_verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.bio} numberOfLines={2}>
            {item.bio}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>A partir de</Text>
              <Text style={styles.price}>{`R$ ${item.base_price}`}</Text>
            </View>
            
            {item.distance && typeof item.distance === 'number' && (
              <View style={styles.distanceContainer}>
                <Text style={styles.distance}>{`📍 ${item.distance.toFixed(1)} km`}</Text>
              </View>
            )}
          </View>

          {item.accepts_express && (
            <View style={styles.expressBadge}>
              <Text style={styles.expressText}>⚡ Aceita urgente</Text>
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
      <View style={styles.filterBar}>
        <Text style={styles.filterLabel}>Ordenar por:</Text>
        <TouchableOpacity
          style={[styles.filterButton, sortBy === 'rating' && styles.filterButtonActive]}
          onPress={() => setSortBy('rating')}
        >
          <Text
            style={[
              styles.filterButtonText,
              sortBy === 'rating' && styles.filterButtonTextActive,
            ]}
          >
            ⭐ Avaliação
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, sortBy === 'distance' && styles.filterButtonActive]}
          onPress={() => setSortBy('distance')}
        >
          <Text
            style={[
              styles.filterButtonText,
              sortBy === 'distance' && styles.filterButtonTextActive,
            ]}
          >
            📍 Distância
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={professionals}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum profissional disponível</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray,
    marginRight: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.lightGray,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.gray,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  cardInfo: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  type: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stars: {
    fontSize: 14,
  },
  ratingText: {
    fontSize: 12,
    color: colors.gray,
  },
  verifiedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 12,
  },
  bio: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  distanceContainer: {
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  distance: {
    fontSize: 12,
    color: '#16a34a',
    fontWeight: '600',
  },
  expressBadge: {
    backgroundColor: colors.warningLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  expressText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: colors.gray,
  },
});

