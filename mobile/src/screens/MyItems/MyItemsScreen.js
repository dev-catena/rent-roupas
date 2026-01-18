import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import { colors } from '../../constants/colors';
import SafeIcon from '../../components/SafeIcon';

export default function MyItemsScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Recarrega quando a tela recebe foco (ex: depois de editar)
  useFocusEffect(
    React.useCallback(() => {
      loadMyItems();
    }, [])
  );

  // Polling automático a cada 20 segundos
  useEffect(() => {
    loadMyItems();

    const interval = setInterval(() => {
      if (!refreshing) {
        loadMyItems();
      }
    }, 20000); // 20 segundos

    return () => clearInterval(interval);
  }, [refreshing]);

  async function loadMyItems() {
    try {
      const response = await api.get('/my-items');
      if (response.data.success) {
        setItems(response.data.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar peças:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadMyItems();
  }

  async function handleDelete(itemId) {
    Alert.alert(
      'Excluir Peça',
      'Tem certeza que deseja excluir esta peça?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/clothing-items/${itemId}`);
              setItems(items.filter(item => item.id !== itemId));
              Alert.alert('Sucesso', 'Peça excluída com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a peça');
            }
          },
        },
      ]
    );
  }

  async function handleMarkAvailable(itemId, itemTitle) {
    Alert.alert(
      'Confirmar Disponibilidade',
      `A peça "${itemTitle}" foi devolvida?\n\nConfirme para marcá-la como disponível novamente para aluguel.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              const response = await api.put(`/clothing-items/${itemId}/mark-available`);
              if (response.data.success) {
                // Atualiza o item na lista
                setItems(items.map(item => 
                  item.id === itemId 
                    ? { ...item, in_use: false, current_rental_id: null }
                    : item
                ));
                Alert.alert('Pronto!', 'Sua peça está disponível novamente para aluguel');
              }
            } catch (error) {
              console.error('Erro ao marcar como disponível:', error);
              Alert.alert('Erro', error.response?.data?.message || 'Não foi possível atualizar a peça');
            }
          },
        },
      ]
    );
  }

  function renderItem({ item }) {
    const isInUse = item.in_use === true || item.in_use === 1;
    
    return (
      <View style={[styles.card, isInUse && styles.cardInUse]}>
        {isInUse && (
          <View style={styles.inUseBadge}>
            <View style={styles.inUseBadgeContent}>
              <SafeIcon name="lock-closed" size={14} color="#78350f" />
              <Text style={styles.inUseBadgeText}> Em Uso</Text>
            </View>
          </View>
        )}
        
        {item.primary_photo ? (
          <Image 
            source={{ uri: item.primary_photo.url }} 
            style={[styles.cardImage, isInUse && styles.cardImageInUse]} 
          />
        ) : (
          <View style={[styles.cardImagePlaceholder, isInUse && styles.cardImageInUse]}>
            <Text>Sem foto</Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title || 'Sem título'}</Text>
          <Text style={styles.cardPrice}>R$ {item.price_per_day || '0'}/dia</Text>
          
          <View style={styles.cardStats}>
            <View style={styles.cardStatContainer}>
              <SafeIcon name="eye" size={16} color={colors.gray} />
              <Text style={styles.cardStat}> {item.views_count || 0}</Text>
            </View>
            <View style={styles.cardStatContainer}>
              <SafeIcon name="cube" size={16} color={colors.gray} />
              <Text style={styles.cardStat}> {item.rentals_count || 0}</Text>
            </View>
          </View>

          {isInUse && (
            <TouchableOpacity
              style={styles.availableButton}
              onPress={() => handleMarkAvailable(item.id, item.title)}
            >
              <View style={styles.availableButtonContent}>
                <SafeIcon name="checkmark-circle" size={18} color="#fff" />
                <Text style={styles.availableButtonText}> Confirmar Devolução</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionButton, isInUse && styles.actionButtonDisabled]}
              onPress={() => !isInUse && navigation.navigate('EditItem', { itemId: item.id })}
              disabled={isInUse}
            >
              <View style={styles.actionButtonContent}>
                <SafeIcon name="create" size={16} color={isInUse ? '#9ca3af' : '#374151'} />
                <Text style={[styles.actionButtonText, isInUse && styles.actionButtonTextDisabled]}>
                  {' '}Editar
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton, isInUse && styles.actionButtonDisabled]}
              onPress={() => !isInUse && handleDelete(item.id)}
              disabled={isInUse}
            >
              <View style={styles.actionButtonContent}>
                <SafeIcon name="trash" size={16} color={isInUse ? '#9ca3af' : '#dc2626'} />
                <Text style={[styles.actionButtonText, styles.deleteButtonText, isInUse && styles.actionButtonTextDisabled]}>
                  {' '}Excluir
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Você ainda não tem peças cadastradas</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('AddItem')}
            >
              <Text style={styles.addButtonText}>Adicionar Primeira Peça</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {items.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddItem')}
        >
          <SafeIcon name="add" size={32} color="#fff" />
        </TouchableOpacity>
      )}
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
  listContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: 120,
    height: 120,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardImagePlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  cardStatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardStat: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  actionButtonDisabled: {
    backgroundColor: '#e5e7eb',
    opacity: 0.5,
  },
  actionButtonTextDisabled: {
    color: '#9ca3af',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  deleteButtonText: {
    color: '#dc2626',
  },
  cardInUse: {
    opacity: 0.7,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  cardImageInUse: {
    opacity: 0.6,
  },
  inUseBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#fbbf24',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 10,
  },
  inUseBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inUseBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#78350f',
  },
  availableButton: {
    backgroundColor: '#10b981',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  availableButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

