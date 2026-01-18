import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import * as Location from 'expo-location';
import api from '../../config/api';
import { colors } from '../../constants/colors';
import GOOGLE_MAPS_CONFIG from '../../config/maps';
import { formatCurrency, currencyToNumber } from '../../utils/currencyMask';

export default function RegisterProfessionalScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [addressListVisible, setAddressListVisible] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const scrollViewRef = useRef(null);
  const debounceTimerRef = useRef(null);
  
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

  // Função para aplicar máscara de moeda
  const handlePriceChange = (field, value) => {
    const formatted = formatCurrency(value);
    setFormData({ ...formData, [field]: formatted });
  };

  // Função para obter localização GPS e fazer geocoding reverso
  async function getCurrentLocation() {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita o acesso à localização para registrar seu ateliê');
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Fazer geocoding reverso para obter o endereço
      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (geocode) {
          // Monta o endereço completo
          const addressParts = [
            geocode.street,
            geocode.streetNumber,
            geocode.district,
            geocode.city,
            geocode.region,
          ].filter(Boolean);

          const fullAddress = addressParts.join(', ');

          setFormData({
            ...formData,
            workshop_address: fullAddress,
            workshop_latitude: latitude,
            workshop_longitude: longitude,
          });


          Alert.alert('Sucesso!', 'Localização e endereço obtidos automaticamente! ✅');
        } else {
          // Se não conseguir o endereço, pelo menos salva as coordenadas
          setFormData({
            ...formData,
            workshop_latitude: latitude,
            workshop_longitude: longitude,
          });
          Alert.alert('Sucesso', 'Localização obtida! (Endereço não encontrado)');
        }
      } catch (geocodeError) {
        console.error('Erro no geocoding reverso:', geocodeError);
        // Mesmo assim salva as coordenadas
        setFormData({
          ...formData,
          workshop_latitude: latitude,
          workshop_longitude: longitude,
        });
        Alert.alert('Sucesso', 'Localização obtida! (Não foi possível obter o endereço)');
      }
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert('Erro', 'Não foi possível obter a localização: ' + error.message);
    } finally {
      setLoadingLocation(false);
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
      // Converte valores formatados para números antes de enviar
      const submitData = {
        ...formData,
        base_price: currencyToNumber(formData.base_price) || 0,
        express_fee: formData.express_fee ? currencyToNumber(formData.express_fee) : 0,
      };

      const response = await api.post('/professionals/register', submitData);

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

  const hasGoogleMapsConfig = GOOGLE_MAPS_CONFIG.API_KEY && GOOGLE_MAPS_CONFIG.API_KEY !== 'SUA_API_KEY_AQUI';

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="on-drag"
        nestedScrollEnabled={true}
        scrollEventThrottle={16}
      >
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
            onChangeText={(value) => handlePriceChange('base_price', value)}
            placeholder="R$ 0,00"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Taxa Adicional para Urgente (R$)</Text>
          <TextInput
            style={styles.input}
            value={formData.express_fee}
            onChangeText={(value) => handlePriceChange('express_fee', value)}
            placeholder="R$ 0,00"
            keyboardType="numeric"
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
          <View style={styles.googlePlacesTextInputContainer}>
            <TextInput
              value={formData.workshop_address}
              onChangeText={(text) => {
                setFormData({ ...formData, workshop_address: text });
                
                // Limpar timer anterior
                if (debounceTimerRef.current) {
                  clearTimeout(debounceTimerRef.current);
                }
                
                // Debounce para evitar muitas chamadas à API
                debounceTimerRef.current = setTimeout(async () => {
                  if (text.length >= 2 && hasGoogleMapsConfig) {
                    setAddressListVisible(true);
                    try {
                      // Buscar sugestões manualmente usando a API do Google Places
                      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_MAPS_CONFIG.API_KEY}&language=pt-BR&components=country:${GOOGLE_MAPS_CONFIG.region}`;
                      const response = await fetch(url);
                      const data = await response.json();
                      
                      if (data.predictions) {
                        setAddressSuggestions(data.predictions);
                      }
                    } catch (error) {
                      console.error('Erro ao buscar sugestões:', error);
                    }
                  } else {
                    setAddressListVisible(false);
                    setAddressSuggestions([]);
                  }
                }, 400);
              }}
              onFocus={() => {
                if (formData.workshop_address.length >= 2 && addressSuggestions.length > 0) {
                  setAddressListVisible(true);
                }
              }}
              onBlur={() => {
                setTimeout(() => {
                  setAddressListVisible(false);
                  setAddressSuggestions([]);
                }, 350);
              }}
              placeholder="Digite o endereço..."
              placeholderTextColor={colors.gray400}
              style={styles.googlePlacesInput}
              returnKeyType="search"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.locationButton, loadingLocation && styles.locationButtonDisabled]} 
          onPress={getCurrentLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <ActivityIndicator color="#16a34a" />
          ) : (
            <Text style={styles.locationButtonText}>
              📍 {formData.workshop_latitude ? 'Localização obtida' : 'Obter localização GPS'}
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.helpText}>
          {formData.workshop_latitude 
            ? '✅ Localização GPS obtida. O endereço foi preenchido automaticamente.' 
            : 'A localização GPS é usada para calcular distância até os clientes'}
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
      
      {/* Lista customizada de sugestões FORA do ScrollView (sem VirtualizedList para evitar warning) */}
      {addressListVisible && addressSuggestions.length > 0 && (
        <View style={styles.customSuggestionsList}>
          {addressSuggestions.slice(0, 5).map((item, index) => (
            <TouchableOpacity
              key={item.place_id || index.toString()}
              style={styles.suggestionItem}
              onPress={async () => {
                try {
                  // Buscar detalhes do lugar
                  const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&fields=formatted_address,geometry&key=${GOOGLE_MAPS_CONFIG.API_KEY}&language=pt-BR`;
                  const detailsResponse = await fetch(detailsUrl);
                  const detailsData = await detailsResponse.json();
                  
                  if (detailsData.result) {
                    const fullAddress = detailsData.result.formatted_address;
                    const lat = detailsData.result.geometry?.location?.lat;
                    const lng = detailsData.result.geometry?.location?.lng;

                    setFormData({
                      ...formData,
                      workshop_address: fullAddress,
                      workshop_latitude: lat || formData.workshop_latitude,
                      workshop_longitude: lng || formData.workshop_longitude,
                    });
                  } else {
                    setFormData({
                      ...formData,
                      workshop_address: item.description || item.structured_formatting?.main_text || '',
                    });
                  }
                  
                  setAddressListVisible(false);
                  setAddressSuggestions([]);
                } catch (error) {
                  console.error('Erro ao buscar detalhes:', error);
                  setFormData({
                    ...formData,
                    workshop_address: item.description || item.structured_formatting?.main_text || '',
                  });
                  setAddressListVisible(false);
                  setAddressSuggestions([]);
                }
              }}
            >
              <Text style={styles.placesMainText}>
                {item.structured_formatting?.main_text || item.description}
              </Text>
              {item.structured_formatting?.secondary_text && (
                <Text style={styles.placesSecondaryText}>
                  {item.structured_formatting.secondary_text}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  locationButtonDisabled: {
    opacity: 0.6,
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
  // Estilos para Google Places Autocomplete
  googlePlacesContainer: {
    flex: 0,
    zIndex: 1,
    position: 'relative',
  },
  googlePlacesTextInputContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  googlePlacesInput: {
    height: 48,
    fontSize: 16,
    paddingHorizontal: 12,
    color: '#1f2937',
  },
  googlePlacesList: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: '#fff',
    maxHeight: 150, // Reduzido para não ocupar muito espaço
    zIndex: 1000,
    elevation: 5, // Android
    shadowColor: '#000', // iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  googlePlacesRow: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  googlePlacesDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  placesMainText: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  placesSecondaryText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  customSuggestionsList: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#d1d5db',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
});
