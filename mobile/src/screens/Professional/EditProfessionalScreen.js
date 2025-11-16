import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import * as Location from 'expo-location';
import api from '../../config/api';

export default function EditProfessionalScreen({ navigation }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Dados profissionais
  const [professionalType, setProfessionalType] = useState('seamstress');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [availability, setAvailability] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });
  const [workshopAddress, setWorkshopAddress] = useState('');
  const [workshopLocation, setWorkshopLocation] = useState(null);

  useEffect(() => {
    loadProfessionalData();
  }, []);

  async function loadProfessionalData() {
    try {
      const response = await api.get('/user/profile');
      
      if (response.data.success && response.data.data.professional) {
        const prof = response.data.data.professional;
        
        setProfessionalType(prof.type || 'seamstress');
        setBio(prof.bio || '');
        setExperience(prof.years_of_experience?.toString() || '');
        setBasePrice(prof.base_price?.toString() || '');
        setWorkshopAddress(prof.workshop_address || '');
        
        if (prof.workshop_latitude && prof.workshop_longitude) {
          setWorkshopLocation({
            latitude: prof.workshop_latitude,
            longitude: prof.workshop_longitude,
          });
        }
        
        if (prof.availability) {
          try {
            const avail = typeof prof.availability === 'string' 
              ? JSON.parse(prof.availability) 
              : prof.availability;
            setAvailability(avail);
          } catch (e) {
            console.log('Erro ao parsear availability:', e);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados profissionais');
    } finally {
      setLoadingData(false);
    }
  }

  async function getWorkshopLocation() {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Permita o acesso à localização');
        setLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setWorkshopLocation(currentLocation.coords);
      
      // Faz geocoding reverso para obter o endereço
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      if (geocode) {
        const streetAddress = [
          geocode.street,
          geocode.streetNumber,
        ].filter(Boolean).join(', ');
        
        setWorkshopAddress(streetAddress || geocode.name || '');
        Alert.alert('Sucesso!', 'Localização e endereço do ateliê obtidos automaticamente! ✅');
      } else {
        Alert.alert('Sucesso', 'Localização do ateliê obtida!');
      }
      
      setLoadingLocation(false);
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert('Erro', 'Não foi possível obter a localização');
      setLoadingLocation(false);
    }
  }

  async function handleSave() {
    if (!bio || !experience || !basePrice || !workshopAddress) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const data = {
        type: professionalType,
        bio,
        years_of_experience: parseInt(experience) || 0,
        base_price: parseFloat(basePrice) || 0,
        availability: JSON.stringify(availability),
        workshop_address: workshopAddress,
        workshop_latitude: workshopLocation?.latitude,
        workshop_longitude: workshopLocation?.longitude,
      };

      const response = await api.put('/professionals/profile', data);

      if (response.data.success) {
        Alert.alert('Sucesso!', 'Dados profissionais atualizados com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível atualizar os dados');
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipo de Profissional</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={[styles.radioButton, professionalType === 'seamstress' && styles.radioButtonSelected]}
            onPress={() => setProfessionalType('seamstress')}
          >
            <Text style={[styles.radioText, professionalType === 'seamstress' && styles.radioTextSelected]}>
              🧵 Costureira
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioButton, professionalType === 'tailor' && styles.radioButtonSelected]}
            onPress={() => setProfessionalType('tailor')}
          >
            <Text style={[styles.radioText, professionalType === 'tailor' && styles.radioTextSelected]}>
              ✂️ Alfaiate
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioButton, professionalType === 'stylist' && styles.radioButtonSelected]}
            onPress={() => setProfessionalType('stylist')}
          >
            <Text style={[styles.radioText, professionalType === 'stylist' && styles.radioTextSelected]}>
              👗 Estilista
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.radioButton, professionalType === 'designer' && styles.radioButtonSelected]}
            onPress={() => setProfessionalType('designer')}
          >
            <Text style={[styles.radioText, professionalType === 'designer' && styles.radioTextSelected]}>
              🎨 Designer
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Sobre Você *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Conte sobre sua experiência e especialidades"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Anos de Experiência *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 5"
          value={experience}
          onChangeText={setExperience}
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Preço Base (R$) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 50.00"
          value={basePrice}
          onChangeText={setBasePrice}
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Endereço do Ateliê *</Text>
        <TextInput
          style={styles.input}
          placeholder="Endereço completo do seu ateliê"
          value={workshopAddress}
          onChangeText={setWorkshopAddress}
        />
      </View>

      <TouchableOpacity
        style={styles.locationButton}
        onPress={getWorkshopLocation}
        disabled={loadingLocation}
      >
        {loadingLocation ? (
          <ActivityIndicator color="#374151" />
        ) : (
          <Text style={styles.locationButtonText}>
            📍 {workshopLocation ? 'Localização do ateliê obtida ✓' : 'Atualizar localização do ateliê'}
          </Text>
        )}
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.label}>Dias Disponíveis</Text>
        <View style={styles.daysContainer}>
          {Object.keys(availability).map(day => (
            <TouchableOpacity
              key={day}
              style={[styles.dayButton, availability[day] && styles.dayButtonSelected]}
              onPress={() => setAvailability({...availability, [day]: !availability[day]})}
            >
              <Text style={[styles.dayText, availability[day] && styles.dayTextSelected]}>
                {day === 'monday' ? 'Seg' :
                 day === 'tuesday' ? 'Ter' :
                 day === 'wednesday' ? 'Qua' :
                 day === 'thursday' ? 'Qui' :
                 day === 'friday' ? 'Sex' :
                 day === 'saturday' ? 'Sáb' : 'Dom'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Salvar Alterações</Text>
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
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
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f9fafb',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  radioGroup: {
    gap: 10,
  },
  radioButton: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  radioText: {
    fontSize: 16,
    color: '#6b7280',
  },
  radioTextSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
  locationButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  locationButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayButton: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    minWidth: 50,
    alignItems: 'center',
  },
  dayButtonSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  dayText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  dayTextSelected: {
    color: '#6366f1',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

