import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../../config/api';

export default function RentRequestScreen({ route, navigation }) {
  const { item } = route.params;
  const [loading, setLoading] = useState(false);
  
  // Datas (inicia com amanhã para evitar problemas de validação)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(12, 0, 0, 0); // Meio-dia para evitar problemas de fuso
  
  const weekLater = new Date(tomorrow);
  weekLater.setDate(weekLater.getDate() + 7);
  
  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(weekLater);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  
  // Dados da negociação
  const [message, setMessage] = useState('');
  const [proposedPrice, setProposedPrice] = useState(item.price_per_day.toString());

  function calculateTotal() {
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    const price = parseFloat(proposedPrice) || 0;
    const subtotal = days * price;
    const platformFee = subtotal * 0.10;
    const total = subtotal + platformFee;

    return {
      days,
      subtotal: subtotal.toFixed(2),
      platformFee: platformFee.toFixed(2),
      total: total.toFixed(2),
    };
  }

  async function handleSubmit() {
    if (!message.trim()) {
      Alert.alert('Atenção', 'Digite uma mensagem para o proprietário');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('Atenção', 'A data final deve ser posterior à data inicial');
      return;
    }

    setLoading(true);

    try {
      const requestData = {
        clothing_item_id: item.id,
        type: 'rental',
        proposed_price: parseFloat(proposedPrice),
        proposed_start_date: startDate.toISOString().split('T')[0],
        proposed_end_date: endDate.toISOString().split('T')[0],
        initial_message: message,
      };

      console.log('Enviando negociação:', requestData);

      const response = await api.post('/negotiations', requestData);

      console.log('Resposta da API:', response.data);

      if (response.data.success) {
        Alert.alert(
          'Sucesso!',
          'Sua solicitação foi enviada ao proprietário. Você pode acompanhar a negociação na aba de Conversas.',
          [
            {
              text: 'Ver Conversas',
              onPress: () => {
                navigation.navigate('Profile', {
                  screen: 'Chats',
                });
              },
            },
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.log('Erro completo:', error);
      console.log('Erro response:', error.response?.data);
      console.log('Erro status:', error.response?.status);
      
      let errorMessage = 'Não foi possível enviar a solicitação';
      
      if (error.response?.data?.errors) {
        // Mostra o primeiro erro de validação
        const firstError = Object.values(error.response.data.errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  }

  const totals = calculateTotal();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.itemSummary}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemPrice}>R$ {item.price_per_day}/dia</Text>
        <Text style={styles.itemOwner}>Proprietário: {item.user.name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Período de Aluguel</Text>
        
        <View style={styles.dateContainer}>
          <View style={styles.dateField}>
            <Text style={styles.label}>Data de Início</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartPicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {startDate.toLocaleDateString('pt-BR')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.dateField}>
            <Text style={styles.label}>Data de Devolução</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndPicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {endDate.toLocaleDateString('pt-BR')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (selectedDate) {
                selectedDate.setHours(12, 0, 0, 0);
                setStartDate(selectedDate);
                // Ajusta data final se necessário
                if (selectedDate >= endDate) {
                  const newEndDate = new Date(selectedDate);
                  newEndDate.setDate(newEndDate.getDate() + 7);
                  setEndDate(newEndDate);
                }
              }
            }}
            minimumDate={new Date()}
          />
        )}

        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowEndPicker(Platform.OS === 'ios');
              if (selectedDate) {
                selectedDate.setHours(12, 0, 0, 0);
                setEndDate(selectedDate);
              }
            }}
            minimumDate={new Date(startDate.getTime() + 24 * 60 * 60 * 1000)}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Proposta de Valor</Text>
        <Text style={styles.helpText}>
          Valor padrão: R$ {item.price_per_day}/dia. Você pode propor um valor diferente.
        </Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Valor proposto por dia (R$)</Text>
          <TextInput
            style={styles.input}
            value={proposedPrice}
            onChangeText={setProposedPrice}
            keyboardType="decimal-pad"
            placeholder="Ex: 50.00"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mensagem para o Proprietário *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={message}
          onChangeText={setMessage}
          placeholder="Apresente-se e explique o motivo do aluguel, quando e onde pretende usar a peça..."
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Resumo do Aluguel</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Período:</Text>
          <Text style={styles.summaryValue}>{totals.days} {totals.days === 1 ? 'dia' : 'dias'}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>R$ {totals.subtotal}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Taxa da plataforma (10%):</Text>
          <Text style={styles.summaryValue}>R$ {totals.platformFee}</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabelTotal}>Total:</Text>
          <Text style={styles.summaryValueTotal}>R$ {totals.total}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Enviar Solicitação</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  itemSummary: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  itemOwner: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  dateContainer: {
    gap: 12,
  },
  dateField: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 14,
    backgroundColor: '#f9fafb',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  summary: {
    margin: 20,
    padding: 20,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#d1fae5',
    marginVertical: 12,
  },
  summaryLabelTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  summaryValueTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

