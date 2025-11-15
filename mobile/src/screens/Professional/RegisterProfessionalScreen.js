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
} from 'react-native';
import * as Location from 'expo-location';
import api from '../../config/api';

export default function RegisterProfessionalScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'seamstress',
    bio: '',
    years_experience: '',
    base_price: '',
    express_fee: '',
    accepts_express: true,
    workshop_address: '',
    workshop_latitude: null,
    workshop_longitude: null,
  });

  const professionalTypes = [
    { value: 'seamstress', label: '🧵 Costureira' },
    { value: 'tailor', label: '✂️ Alfaiate' },
    { value: 'designer', label: '👗 Designer' },
    { value: 'stylist', label: '💄 Estilista' },
    { value: 'other', label: '🔧 Outro' },
  ];

  async function getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita o acesso à localização para registrar seu ateliê');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setFormData({
        ...formData,
        workshop_latitude: location.coords.latitude,
        workshop_longitude: location.coords.longitude,
      });
      Alert.alert('Sucesso', 'Localização do ateliê obtida!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter a localização');
    }
  }

  async function handleSubmit() {
    // Validações
    if (!formData.bio || formData.bio.length < 50) {
      Alert.alert('Atenção', 'A biografia deve ter no mínimo 50 caracteres');
      return;
    }

    if (!formData.base_price) {
      Alert.alert('Atenção', 'Informe o preço base do serviço');
      return;
    }

    if (!formData.workshop_address) {
      Alert.alert('Atenção', 'Informe o endereço do ateliê');
      return;
    }

    if (!formData.workshop_latitude || !formData.workshop_longitude) {
      Alert.alert('Atenção', 'Obtenha a localização do ateliê');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/professionals/register', formData);

      if (response.data.success) {
        Alert.alert(
          'Cadastro Realizado!',
          'Seu perfil profissional foi criado e está aguardando verificação. Você será notificado quando for aprovado.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Erro ao cadastrar profissional:', error);
      const message = error.response?.data?.message || 'Não foi possível completar o cadastro';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cadastro Profissional</Text>
        <Text style={styles.headerSubtitle}>
          Ofereça seus serviços de ajustes e costura
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipo de Profissional *</Text>
        <View style={styles.typeGrid}>
          {professionalTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeButton,
                formData.type === type.value && styles.typeButtonActive,
              ]}
              onPress={() => setFormData({ ...formData, type: type.value })}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  formData.type === type.value && styles.typeButtonTextActive,
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sobre Você</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Biografia * (mínimo 50 caracteres)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.bio}
            onChangeText={(value) => setFormData({ ...formData, bio: value })}
            placeholder="Conte sobre sua experiência, especialidades, formação..."
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>{formData.bio.length}/50</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Anos de Experiência</Text>
          <TextInput
            style={styles.input}
            value={formData.years_experience}
            onChangeText={(value) => setFormData({ ...formData, years_experience: value })}
            placeholder="Ex: 5"
            keyboardType="number-pad"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Valores</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Preço Base por Serviço (R$) *</Text>
          <TextInput
            style={styles.input}
            value={formData.base_price}
            onChangeText={(value) => setFormData({ ...formData, base_price: value })}
            placeholder="Ex: 50.00"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Taxa Adicional para Urgente (R$)</Text>
          <TextInput
            style={styles.input}
            value={formData.express_fee}
            onChangeText={(value) => setFormData({ ...formData, express_fee: value })}
            placeholder="Ex: 30.00"
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() =>
            setFormData({ ...formData, accepts_express: !formData.accepts_express })
          }
        >
          <View style={[styles.checkbox, formData.accepts_express && styles.checkboxChecked]}>
            {formData.accepts_express && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>Aceito trabalhos urgentes</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Localização do Ateliê</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Endereço Completo *</Text>
          <TextInput
            style={styles.input}
            value={formData.workshop_address}
            onChangeText={(value) => setFormData({ ...formData, workshop_address: value })}
            placeholder="Rua, número, bairro, cidade - UF"
          />
        </View>

        <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
          <Text style={styles.locationButtonText}>
            📍 {formData.workshop_latitude ? 'Localização obtida' : 'Obter localização GPS'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.helpText}>
          A localização GPS é usada para calcular distância até os clientes
        </Text>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Cadastrar como Profissional</Text>
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
  header: {
    backgroundColor: '#6366f1',
    padding: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#e0e7ff',
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
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#eef2ff',
    borderColor: '#6366f1',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#6366f1',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
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
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
  },
  locationButton: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  locationButtonText: {
    color: '#16a34a',
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    margin: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

