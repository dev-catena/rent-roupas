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
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext'
import { colors } from '../../constants/colors';;
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
  const [checkpoints, setCheckpoints] = useState([]);
  const flatListRef = useRef(null);

  // Recarrega dados quando a tela ganha foco
  useFocusEffect(
    React.useCallback(() => {
      loadNegotiation();
      loadCheckpoints();
    }, [negotiationId])
  );

  // Polling otimizado para atualizações
  useEffect(() => {
    loadNegotiation();
    loadCheckpoints();

    // Polling mais frequente no chat (5 segundos)
    const interval = setInterval(() => {
      loadCheckpoints();
      loadNegotiation();
    }, 5000); // 5 segundos

    return () => clearInterval(interval);
  }, [negotiationId]);

  async function loadCheckpoints() {
    try {
      const response = await api.get(`/negotiations/${negotiationId}/checkpoints`);
      if (response.data.success) {
        const checkpointsData = response.data.data;
        setCheckpoints(checkpointsData);
        
        // Atualiza o último ID para long-polling
        if (checkpointsData.length > 0) {
          const maxId = Math.max(...checkpointsData.map(c => c.id));
          // Nota: lastCheckpointId é local no useEffect, não precisa setState aqui
        }
      }
    } catch (error) {
      console.error('Erro ao carregar checkpoints:', error);
    }
  }

  async function loadNegotiation() {
    try {
      const response = await api.get(`/negotiations/${negotiationId}`);
      if (response.data.success) {
        setNegotiation(response.data.data);
        // Mensagens já vêm ordenadas do backend (mais antigas primeiro)
        // Não precisa fazer reverse - FlatList mostra do topo para baixo
        setMessages(response.data.data.messages || []);
        
        // Scroll para o final (mensagens mais recentes) após carregar
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
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
        // Adiciona nova mensagem ao final da lista
        setMessages([...messages, response.data.data]);
        setNewMessage('');
        // Scroll para o final após enviar mensagem
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
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

  async function handleConfirmProfessional() {
    Alert.alert(
      'Confirmar Profissional',
      `Deseja confirmar ${negotiation.professional.user.name} para fazer os ajustes?\n\nApós confirmar, você poderá gerar um QR Code para entregar a peça ao profissional.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar',
          onPress: async () => {
            try {
              const response = await api.put(`/negotiations/${negotiationId}/confirm-professional`);
              
              if (response.data.success) {
                Alert.alert(
                  '✅ Profissional Confirmado!',
                  'Agora você pode gerar o QR Code para entregar a peça ao profissional.',
                  [
                    {
                      text: 'Ver QR Code',
                      onPress: () => navigation.navigate('QRCodeGenerate', { 
                        negotiationId,
                        type: 'delivery_to_professional'
                      })
                    },
                    { text: 'Mais Tarde' }
                  ]
                );
                // Recarrega a negociação e checkpoints
                loadNegotiation();
                loadCheckpoints();
              }
            } catch (error) {
              console.error('Erro ao confirmar profissional:', error);
              Alert.alert('Erro', error.response?.data?.message || 'Não foi possível confirmar o profissional');
            }
          }
        }
      ]
    );
  }

  function getCheckpoint(type) {
    return checkpoints.find(cp => cp.type === type);
  }

  function renderTracking() {
    if (!negotiation?.professional_confirmed) {
      return null; // Não mostra tracking antes de confirmar profissional
    }

    const deliveryCheckpoint = getCheckpoint('delivery_to_professional');
    const returnCheckpoint = getCheckpoint('return_from_professional');
    const returnOwnerCheckpoint = getCheckpoint('return_to_owner');

    return (
      <View style={styles.trackingSection}>
        <Text style={styles.trackingSectionTitle}>📦 Rastreamento da Peça</Text>
        
        {/* Checkpoint 1: Entrega ao Profissional */}
        <View style={styles.trackingStep}>
          <View style={[styles.trackingIcon, deliveryCheckpoint?.status === 'scanned' && styles.trackingIconComplete]}>
            <Text style={styles.trackingIconText}>{deliveryCheckpoint?.status === 'scanned' ? '✓' : '1'}</Text>
          </View>
          <View style={styles.trackingContent}>
            <Text style={styles.trackingTitle}>Entrega ao Profissional</Text>
            <Text style={styles.trackingStatus}>
              {!deliveryCheckpoint && isInitiator ? 'Gere o QR Code para entregar' : 
               deliveryCheckpoint?.status === 'pending' && isInitiator ? 'QR Code gerado - Mostre ao profissional' :
               deliveryCheckpoint?.status === 'pending' && isProfessional ? 'Aguardando recebimento' :
               deliveryCheckpoint?.status === 'scanned' ? '✅ Recebido' :
               'Aguardando...'}
            </Text>
            {isInitiator && deliveryCheckpoint?.status !== 'scanned' && (
              <TouchableOpacity 
                style={styles.trackingButton}
                onPress={() => navigation.navigate('QRCodeGenerate', { negotiationId, type: 'delivery_to_professional' })}
              >
                <Text style={styles.trackingButtonText}>
                  {!deliveryCheckpoint ? 'Gerar QR Code' : 'Ver QR Code'}
                </Text>
              </TouchableOpacity>
            )}
            {deliveryCheckpoint?.status === 'pending' && isProfessional && (
              <TouchableOpacity 
                style={styles.trackingButton}
                onPress={() => navigation.navigate('QRCodeScan', { 
                  onScanSuccess: () => {
                    loadNegotiation();
                    loadCheckpoints();
                  }
                })}
              >
                <Text style={styles.trackingButtonText}>Escanear QR Code</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Checkpoint 2: Devolução do Profissional */}
        {deliveryCheckpoint?.status === 'scanned' && (
          <View style={styles.trackingStep}>
            <View style={[styles.trackingIcon, returnCheckpoint?.status === 'scanned' && styles.trackingIconComplete]}>
              <Text style={styles.trackingIconText}>{returnCheckpoint?.status === 'scanned' ? '✓' : '2'}</Text>
            </View>
            <View style={styles.trackingContent}>
              <Text style={styles.trackingTitle}>Devolução do Profissional</Text>
              <Text style={styles.trackingStatus}>
                {!returnCheckpoint && isProfessional ? 'Gere o QR Code após ajustes' :
                 returnCheckpoint?.status === 'pending' && isProfessional ? 'QR Code gerado - Mostre ao locatário' :
                 returnCheckpoint?.status === 'pending' && isInitiator ? 'Aguardando devolução' :
                 returnCheckpoint?.status === 'scanned' ? '✅ Recebido de volta' :
                 'Aguardando ajustes...'}
              </Text>
              {isProfessional && returnCheckpoint?.status !== 'scanned' && (
                <TouchableOpacity 
                  style={styles.trackingButton}
                  onPress={() => navigation.navigate('QRCodeGenerate', { negotiationId, type: 'return_from_professional' })}
                >
                  <Text style={styles.trackingButtonText}>
                    {!returnCheckpoint ? 'Gerar QR Code' : 'Ver QR Code'}
                  </Text>
                </TouchableOpacity>
              )}
              {returnCheckpoint?.status === 'pending' && isInitiator && (
                <TouchableOpacity 
                  style={styles.trackingButton}
                  onPress={() => navigation.navigate('QRCodeScan', { 
                    onScanSuccess: () => {
                      loadNegotiation();
                      loadCheckpoints();
                    }
                  })}
                >
                  <Text style={styles.trackingButtonText}>Escanear QR Code</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Checkpoint 3: Devolução ao Dono */}
        {returnCheckpoint?.status === 'scanned' && (
          <View style={styles.trackingStep}>
            <View style={[styles.trackingIcon, returnOwnerCheckpoint?.status === 'scanned' && styles.trackingIconComplete]}>
              <Text style={styles.trackingIconText}>{returnOwnerCheckpoint?.status === 'scanned' ? '✓' : '3'}</Text>
            </View>
            <View style={styles.trackingContent}>
              <Text style={styles.trackingTitle}>Devolução ao Proprietário</Text>
              <Text style={styles.trackingStatus}>
                {!returnOwnerCheckpoint && isInitiator ? 'Gere o QR Code para devolver' :
                 returnOwnerCheckpoint?.status === 'pending' && isInitiator ? 'QR Code gerado - Mostre ao proprietário' :
                 returnOwnerCheckpoint?.status === 'pending' && isRecipient ? 'Aguardando recebimento' :
                 returnOwnerCheckpoint?.status === 'scanned' ? '✅ Ciclo Completo!' :
                 'Aguardando...'}
              </Text>
              {isInitiator && returnOwnerCheckpoint?.status !== 'scanned' && (
                <TouchableOpacity 
                  style={styles.trackingButton}
                  onPress={() => navigation.navigate('QRCodeGenerate', { negotiationId, type: 'return_to_owner' })}
                >
                  <Text style={styles.trackingButtonText}>
                    {!returnOwnerCheckpoint ? 'Gerar QR Code' : 'Ver QR Code'}
                  </Text>
                </TouchableOpacity>
              )}
              {returnOwnerCheckpoint?.status === 'pending' && isRecipient && (
                <TouchableOpacity 
                  style={styles.trackingButton}
                  onPress={() => navigation.navigate('QRCodeScan', { 
                    onScanSuccess: () => {
                      loadNegotiation();
                      loadCheckpoints();
                    }
                  })}
                >
                  <Text style={styles.trackingButtonText}>Escanear QR Code</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>
    );
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
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!negotiation) {
    return null;
  }

  const isRecipient = negotiation.recipient_id === user?.id;
  const isInitiator = negotiation.initiator_id === user?.id;
  const isProfessional = negotiation.professional_id === user?.professional?.id && user?.professional?.id != null;
  const isActive = negotiation.status === 'active';
  
  // Determina com quem o usuário está conversando
  let otherUser;
  if (isProfessional) {
    // Se for o profissional, conversa com quem iniciou a negociação
    otherUser = negotiation.initiator;
  } else if (isRecipient) {
    // Se for o recipient, conversa com quem iniciou
    otherUser = negotiation.initiator;
  } else {
    // Se for o initiator, conversa com o recipient
    otherUser = negotiation.recipient;
  }

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
              {`R$ ${negotiation.proposed_price || negotiation.clothing_item.price_per_day}`}
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

      {/* Rastreamento */}
      {renderTracking()}

      {/* Profissional selecionado */}
      {negotiation?.professional && isActive && (
        <View style={styles.professionalSection}>
          <View style={styles.professionalBanner}>
            <View style={styles.professionalInfo}>
              <Text style={styles.professionalText}>
                {`✂️ Profissional: ${negotiation.professional.user.name}`}
              </Text>
              <Text style={styles.professionalPrice}>{`R$ ${negotiation.professional.base_price}`}</Text>
            </View>
          </View>
          
          {isInitiator && (
            <View style={styles.professionalActions}>
              <TouchableOpacity 
                style={styles.changeProfessionalButton} 
                onPress={handleRequestAdjustment}
              >
                <Text style={styles.changeProfessionalButtonText}>🔄 Trocar Profissional</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmProfessionalButton} 
                onPress={() => handleConfirmProfessional()}
              >
                <Text style={styles.confirmProfessionalButtonText}>✅ Confirmar Profissional</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {isProfessional && (
            <View style={styles.professionalNote}>
              <Text style={styles.professionalNoteText}>
                💼 Você foi adicionado(a) como profissional nesta negociação. 
                Use o chat para combinar os detalhes do serviço.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Ações da negociação */}
      {isActive && !isProfessional && (
        <View style={styles.actionsBar}>
          {isInitiator && !negotiation?.professional && (
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
        onContentSizeChange={() => {
          // Scroll para o final quando novas mensagens são adicionadas
          flatListRef.current?.scrollToEnd({ animated: true });
        }}
        onLayout={() => {
          // Scroll para o final quando o layout é renderizado
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
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
              <ActivityIndicator size="small" color={colors.white} />
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
    backgroundColor: colors.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerScroll: {
    maxHeight: 80,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    padding: 12,
    gap: 12,
  },
  headerItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerLabel: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 4,
  },
  headerValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
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
    backgroundColor: colors.errorLight,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  professionalSection: {
    backgroundColor: colors.warningLight,
    borderTopWidth: 1,
    borderTopColor: '#fde68a',
  },
  professionalBanner: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fde68a',
  },
  professionalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  professionalText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.warning,
  },
  professionalPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  professionalActions: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
  },
  changeProfessionalButton: {
    flex: 1,
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fbbf24',
    alignItems: 'center',
  },
  changeProfessionalButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.warning,
  },
  confirmProfessionalButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmProfessionalButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.white,
  },
  professionalNote: {
    padding: 12,
    backgroundColor: colors.warningLight,
  },
  professionalNoteText: {
    fontSize: 13,
    color: colors.warning,
    textAlign: 'center',
    lineHeight: 18,
  },
  trackingSection: {
    backgroundColor: '#f0fdf4',
    borderBottomWidth: 1,
    borderBottomColor: '#d1fae5',
    padding: 16,
  },
  trackingSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 16,
  },
  trackingStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  trackingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackingIconComplete: {
    backgroundColor: '#16a34a',
  },
  trackingIconText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  trackingContent: {
    flex: 1,
  },
  trackingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  trackingStatus: {
    fontSize: 13,
    color: colors.gray,
    marginBottom: 8,
  },
  trackingButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  trackingButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  actionsBar: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    backgroundColor: colors.errorLight,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 2,
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: colors.white,
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
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  myMessageText: {
    color: colors.white,
  },
  otherMessageText: {
    color: colors.text,
  },
  messageTime: {
    fontSize: 11,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  otherMessageTime: {
    color: colors.textLight,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: colors.lightGray,
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    color: colors.white,
    fontSize: 20,
  },
});

