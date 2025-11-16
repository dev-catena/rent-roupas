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
} from 'react-native';
import api from '../../config/api';

export default function HomeScreen({ navigation }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

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
      setRecommendations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadRecommendations();
  }

  function renderItem({ item }) {
    // Proteção robusta contra itens inválidos
    if (!item || !item.id) {
      console.warn('Item inválido no renderItem:', item);
      return null;
    }
    
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
            {String(item.title || 'Sem título')}
          </Text>
          <Text style={styles.cardPrice}>
            {`R$ ${String(item.price_per_day || '0')}/dia`}
          </Text>
          
          {item.distance && typeof item.distance === 'number' && (
            <Text style={styles.cardDistance}>
              {`📍 ${item.distance.toFixed(1)} km de você`}
            </Text>
          )}
          
          {item.match_score && typeof item.match_score === 'number' && item.match_score > 0 && (
            <View style={styles.matchBadge}>
              <Text style={styles.matchText}>
                {`${Math.round(item.match_score)}% compatível`}
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
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recomendações</Text>
        <Text style={styles.headerSubtitle}>Peças selecionadas para você</Text>
      </View>

      <FlatList
        data={recommendations}
        renderItem={renderItem}
        keyExtractor={(item, index) => item?.id?.toString() || `item-${index}`}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#6366f1',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 4,
  },
  listContent: {
    padding: 10,
  },
  card: {
    flex: 1,
    margin: 5,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
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
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImagePlaceholderText: {
    color: '#9ca3af',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  cardDistance: {
    fontSize: 12,
    color: '#6b7280',
  },
  matchBadge: {
    backgroundColor: '#dcfce7',
    padding: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  matchText: {
    fontSize: 11,
    color: '#16a34a',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

