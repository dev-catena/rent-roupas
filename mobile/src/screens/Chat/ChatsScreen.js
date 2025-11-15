import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../config/api';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';

export default function ChatsScreen({ navigation }) {
  const { user } = useAuth();
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNegotiations();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (!loading) {
        loadNegotiations();
      }
    }, [])
  );

  async function loadNegotiations() {
    try {
      const response = await api.get('/negotiations');
      if (response.data.success) {
        setNegotiations(response.data.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar negociações:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function onRefresh() {
    setRefreshing(true);
    loadNegotiations();
  }

  function renderItem({ item }) {
    const otherUser = item.initiator.id === user?.id ? item.recipient : item.initiator;
    const lastMessage = item.messages && item.messages.length > 0 ? item.messages[0] : null;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ChatDetail', { negotiationId: item.id })}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {otherUser.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={1}>
              {otherUser.name}
            </Text>
            {lastMessage && (
              <Text style={styles.time}>
                {format(new Date(lastMessage.created_at), 'HH:mm')}
              </Text>
            )}
          </View>

          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.clothing_item.title}
          </Text>

          {lastMessage && (
            <Text style={styles.lastMessage} numberOfLines={1}>
              {lastMessage.message}
            </Text>
          )}
        </View>

        {item.unread_count > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread_count}</Text>
          </View>
        )}
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
      <FlatList
        data={negotiations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma conversa ainda</Text>
            <Text style={styles.emptySubtext}>
              Negocie peças para começar uma conversa
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
  listContent: {
    paddingTop: 8,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#9ca3af',
  },
  itemTitle: {
    fontSize: 14,
    color: '#6366f1',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6b7280',
  },
  unreadBadge: {
    backgroundColor: '#6366f1',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

