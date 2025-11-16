import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import { format } from 'date-fns';

export default function RentalsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('rentals');
  const [rentals, setRentals] = useState([]);
  const [lendings, setLendings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Recarrega dados quando a tela ganha foco
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  // Polling automático a cada 15 segundos
  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 15000); // 15 segundos

    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    try {
      const [rentalsRes, lendingsRes] = await Promise.all([
        api.get('/my-rentals'),
        api.get('/my-lendings'),
      ]);

      if (rentalsRes.data.success) {
        setRentals(rentalsRes.data.data.data);
      }
      if (lendingsRes.data.success) {
        setLendings(lendingsRes.data.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar aluguéis:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status) {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      active: '#10b981',
      returned: '#6b7280',
      completed: '#22c55e',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  }

  function getStatusLabel(status) {
    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      active: 'Ativo',
      returned: 'Devolvido',
      completed: 'Concluído',
      cancelled: 'Cancelado',
    };
    return labels[status] || status;
  }

  function renderItem({ item }) {
    const isCompleted = item.status === 'completed';
    const isRental = activeTab === 'rentals';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.clothing_item.title}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusLabel(item.status)}</Text>
          </View>
        </View>

        <Text style={styles.cardPrice}>R$ {item.total_amount}</Text>

        <View style={styles.cardDates}>
          <Text style={styles.cardDate}>
            📅 {format(new Date(item.start_date), 'dd/MM/yyyy')} - {format(new Date(item.end_date), 'dd/MM/yyyy')}
          </Text>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cardPerson}>
            {isRental
              ? `👤 ${item.owner.name}`
              : `👤 ${item.renter.name}`}
          </Text>
        </View>

        {/* Botões de avaliar após conclusão */}
        {isCompleted && (
          <View style={styles.ratingButtons}>
            {isRental && (
              <TouchableOpacity
                style={styles.rateButton}
                onPress={() => navigation.navigate('Rating', { rental: item, type: 'owner' })}
              >
                <Text style={styles.rateButtonText}>⭐ Avaliar Proprietário</Text>
              </TouchableOpacity>
            )}
            
            {item.professional_id && (
              <TouchableOpacity
                style={styles.rateButton}
                onPress={() => navigation.navigate('Rating', { rental: item, type: 'professional' })}
              >
                <Text style={styles.rateButtonText}>⭐ Avaliar Profissional</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  }

  const data = activeTab === 'rentals' ? rentals : lendings;

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rentals' && styles.tabActive]}
          onPress={() => setActiveTab('rentals')}
        >
          <Text
            style={[styles.tabText, activeTab === 'rentals' && styles.tabTextActive]}
          >
            Meus Aluguéis
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'lendings' && styles.tabActive]}
          onPress={() => setActiveTab('lendings')}
        >
          <Text
            style={[styles.tabText, activeTab === 'lendings' && styles.tabTextActive]}
          >
            Emprestados
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'rentals'
                  ? 'Você ainda não alugou nenhuma peça'
                  : 'Você ainda não emprestou nenhuma peça'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
  },
  tabText: {
    fontSize: 16,
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#6366f1',
    fontWeight: '600',
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
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  cardDates: {
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardFooter: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  cardPerson: {
    fontSize: 14,
    color: '#6b7280',
  },
  ratingButtons: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 8,
  },
  rateButton: {
    flex: 1,
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  rateButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

