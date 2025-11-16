import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/api';
import { format } from 'date-fns';

export default function ChatDetailScreen({ route, navigation }) {
  const { negotiationId } = route.params || {};
  const { user } = useAuth();
  const [negotiation, setNegotiation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    loadNegotiation();
  }, [negotiationId]);

  async function loadNegotiation() {
    try {
      const response = await api.get(`/negotiations/${negotiationId}`);
      if (response.data.success) {
        setNegotiation(response.data.data);
        setMessages(response.data.data.messages.reverse());
      }
    } catch (error) {
      console.error('Erro ao carregar negociação:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await api.post(`/negotiations/${negotiationId}/messages`, {
        message: newMessage,
      });

      if (response.data.success) {
        setMessages([...messages, response.data.data]);
        setNewMessage('');
        setTimeout(() => {
          flatListRef.current?.scrollToEnd();
        }, 100);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally {
      setSending(false);
    }
  }

  function handleRequestAdjustment() {
    navigation.navigate('ProfessionalsList', { negotiationId });
  }

  async function handleAccept() {
    Alert.alert(
      'Aceitar Negociação',
      'Deseja aceitar esta proposta de aluguel?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aceitar',
          onPress: async () => {
            try {
              const response = await api.put(`/negotiations/${negotiationId}/accept`);
              if (response.data.success) {
                Alert.alert('Sucesso!', 'Negociação aceita! O aluguel foi confirmado.');
                loadNegotiation();
              }
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível aceitar a negociação');
            }
          },
        },
      ]
    );
  }

  async function handleReject() {
    Alert.alert(
      'Rejeitar Negociação',
      'Deseja rejeitar esta proposta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rejeitar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.put(`/negotiations/${negotiationId}/reject`);
              if (response.data.success) {
                Alert.alert('Negociação Rejeitada', 'A proposta foi rejeitada.');
                navigation.goBack();
              }
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível rejeitar a negociação');
            }
          },
        },
      ]
    );
  }

  function renderMessage({ item }) {
    const isMyMessage = item.sender_id === user.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
            ]}
          >
            {item.message}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
            ]}
          >
            {format(new Date(item.created_at), 'HH:mm')}
          </Text>
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

  if (!negotiation) {
    return null;
  }

  const isRecipient = negotiation.recipient_id === user?.id;
  const isActive = negotiation.status === 'active';
  const otherUser = isRecipient ? negotiation.initiator : negotiation.recipient;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Cabeçalho da negociação */}
      <ScrollView style={styles.headerScroll} horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerItem}>
            <Text style={styles.headerLabel}>Peça</Text>
            <Text style={styles.headerValue} numberOfLines={1}>
              {negotiation.clothing_item.title}
            </Text>
          </View>
          
          <View style={styles.headerItem}>
            <Text style={styles.headerLabel}>Período</Text>
            <Text style={styles.headerValue}>
              {format(new Date(negotiation.proposed_start_date), 'dd/MM')} - {format(new Date(negotiation.proposed_end_date), 'dd/MM')}
            </Text>
          </View>
          
          <View style={styles.headerItem}>
            <Text style={styles.headerLabel}>Valor/dia</Text>
            <Text style={styles.headerValue}>
              R$ {negotiation.proposed_price || negotiation.clothing_item.price_per_day}
            </Text>
          </View>
          
          <View style={[styles.headerItem, styles.statusBadge, 
            negotiation.status === 'active' && styles.statusActive,
            negotiation.status === 'accepted' && styles.statusAccepted,
            negotiation.status === 'rejected' && styles.statusRejected]}>
            <Text style={styles.statusText}>
              {negotiation.status === 'active' ? '🔄 Negociando' : 
               negotiation.status === 'accepted' ? '✅ Aceito' : '❌ Rejeitado'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Profissional selecionado */}
      {negotiation?.professional && (
        <View style={styles.professionalBanner}>
          <Text style={styles.professionalText}>
            ✂️ Profissional: {negotiation.professional.user.name}
          </Text>
          <Text style={styles.professionalPrice}>R$ {negotiation.professional.base_price}</Text>
        </View>
      )}

      {/* Ações da negociação */}
      {isActive && (
        <View style={styles.actionsBar}>
          {!isRecipient && !negotiation?.professional && (
            <TouchableOpacity style={styles.actionButton} onPress={handleRequestAdjustment}>
              <Text style={styles.actionButtonText}>✂️ Solicitar Ajuste</Text>
            </TouchableOpacity>
          )}
          
          {isRecipient && (
            <>
              <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
                <Text style={styles.rejectButtonText}>Rejeitar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                <Text style={styles.acceptButtonText}>Aceitar</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      {/* Lista de mensagens */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {/* Input de mensagem */}
      {isActive && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Digite sua mensagem..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={sending || !newMessage.trim()}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.sendButtonText}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerScroll: {
    maxHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    gap: 12,
  },
  headerItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4,
  },
  headerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    borderRadius: 8,
    justifyContent: 'center',
  },
  statusActive: {
    backgroundColor: '#dbeafe',
  },
  statusAccepted: {
    backgroundColor: '#d1fae5',
  },
  statusRejected: {
    backgroundColor: '#fee2e2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  professionalBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  professionalText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  professionalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  actionsBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 2,
    backgroundColor: '#6366f1',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: '#1f2937',
  },
  messageTime: {
    fontSize: 11,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: '#9ca3af',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
  },
});

