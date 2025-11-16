import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import api from '../../config/api';

export default function QRCodeGenerateScreen({ route, navigation }) {
  const { negotiationId, type } = route.params;
  const [loading, setLoading] = useState(true);
  const [qrData, setQrData] = useState(null);

  useEffect(() => {
    generateQRCode();
  }, []);

  async function generateQRCode() {
    try {
      setLoading(true);
      
      const endpoints = {
        delivery_to_professional: `/negotiations/${negotiationId}/qrcode/delivery-to-professional`,
        return_from_professional: `/negotiations/${negotiationId}/qrcode/return-from-professional`,
        return_to_owner: `/negotiations/${negotiationId}/qrcode/return-to-owner`,
      };

      const response = await api.post(endpoints[type]);
      
      if (response.data.success) {
        setQrData(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      Alert.alert(
        'Erro',
        error.response?.data?.message || 'Não foi possível gerar o QR Code',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setLoading(false);
    }
  }

  function getTitle() {
    switch (type) {
      case 'delivery_to_professional':
        return 'Entrega para Profissional';
      case 'return_from_professional':
        return 'Devolução do Profissional';
      case 'return_to_owner':
        return 'Devolução ao Proprietário';
      default:
        return 'QR Code';
    }
  }

  function getInstructions() {
    switch (type) {
      case 'delivery_to_professional':
        return 'Mostre este QR Code para o profissional quando entregar a peça para ajuste.';
      case 'return_from_professional':
        return 'Mostre este QR Code para a locatária quando devolver a peça ajustada.';
      case 'return_to_owner':
        return 'Mostre este QR Code para o proprietário quando devolver a peça alugada.';
      default:
        return '';
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Gerando QR Code...</Text>
      </View>
    );
  }

  if (!qrData) {
    return null;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{getTitle()}</Text>
        <Text style={styles.subtitle}>{getInstructions()}</Text>
      </View>

      <View style={styles.qrContainer}>
        <View style={styles.qrWrapper}>
          <QRCode
            value={qrData.qr_code}
            size={250}
            color="#1f2937"
            backgroundColor="#ffffff"
          />
        </View>
        
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>
            {qrData.status === 'pending' ? '⏳ Aguardando Leitura' : '✅ Escaneado'}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>ID:</Text>
          <Text style={styles.infoValue}>#{qrData.id}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Criado em:</Text>
          <Text style={styles.infoValue}>
            {new Date(qrData.created_at).toLocaleString('pt-BR')}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>Voltar</Text>
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
  content: {
    padding: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    width: '100%',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrWrapper: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statusBadge: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  backButton: {
    width: '100%',
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

