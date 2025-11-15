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
import api from '../../config/api';

export default function MeasurementsScreen({ navigation }) {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [measurements, setMeasurements] = useState({
    weight: '',
    height: '',
    shoulder_width: '',
    chest: '',
    waist: '',
    hip: '',
    inseam: '',
    arm_length: '',
    leg_length: '',
    neck: '',
    shirt_size: '',
    pants_size: '',
    dress_size: '',
    shoe_size: '',
    gender: 'unisex',
    notes: '',
  });

  useEffect(() => {
    if (user.measurements) {
      setMeasurements({
        weight: user.measurements.weight?.toString() || '',
        height: user.measurements.height?.toString() || '',
        shoulder_width: user.measurements.shoulder_width?.toString() || '',
        chest: user.measurements.chest?.toString() || '',
        waist: user.measurements.waist?.toString() || '',
        hip: user.measurements.hip?.toString() || '',
        inseam: user.measurements.inseam?.toString() || '',
        arm_length: user.measurements.arm_length?.toString() || '',
        leg_length: user.measurements.leg_length?.toString() || '',
        neck: user.measurements.neck?.toString() || '',
        shirt_size: user.measurements.shirt_size || '',
        pants_size: user.measurements.pants_size || '',
        dress_size: user.measurements.dress_size || '',
        shoe_size: user.measurements.shoe_size?.toString() || '',
        gender: user.measurements.gender || 'unisex',
        notes: user.measurements.notes || '',
      });
    }
  }, [user]);

  async function handleSave() {
    setLoading(true);
    try {
      const response = await api.put('/user/measurements', measurements);
      
      if (response.data.success) {
        // Atualiza o usuário no contexto
        const updatedUser = { ...user, measurements: response.data.data };
        await updateUser(updatedUser);
        
        Alert.alert('Sucesso', 'Medidas atualizadas com sucesso!');
        navigation.goBack();
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as medidas');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medidas Corporais (em cm)</Text>
        <Text style={styles.sectionSubtitle}>
          Quanto mais completo, melhores as recomendações
        </Text>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Peso (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="70.5"
              value={measurements.weight}
              onChangeText={(value) => setMeasurements({ ...measurements, weight: value })}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Altura (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="170"
              value={measurements.height}
              onChangeText={(value) => setMeasurements({ ...measurements, height: value })}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ombros</Text>
            <TextInput
              style={styles.input}
              placeholder="42"
              value={measurements.shoulder_width}
              onChangeText={(value) => setMeasurements({ ...measurements, shoulder_width: value })}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Busto/Peitoral</Text>
            <TextInput
              style={styles.input}
              placeholder="90"
              value={measurements.chest}
              onChangeText={(value) => setMeasurements({ ...measurements, chest: value })}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cintura</Text>
            <TextInput
              style={styles.input}
              placeholder="75"
              value={measurements.waist}
              onChangeText={(value) => setMeasurements({ ...measurements, waist: value })}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Quadril</Text>
            <TextInput
              style={styles.input}
              placeholder="95"
              value={measurements.hip}
              onChangeText={(value) => setMeasurements({ ...measurements, hip: value })}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Entrepernas</Text>
            <TextInput
              style={styles.input}
              placeholder="80"
              value={measurements.inseam}
              onChangeText={(value) => setMeasurements({ ...measurements, inseam: value })}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pescoço</Text>
            <TextInput
              style={styles.input}
              placeholder="38"
              value={measurements.neck}
              onChangeText={(value) => setMeasurements({ ...measurements, neck: value })}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tamanhos Padrão</Text>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Camisa</Text>
            <TextInput
              style={styles.input}
              placeholder="M"
              value={measurements.shirt_size}
              onChangeText={(value) => setMeasurements({ ...measurements, shirt_size: value })}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Calça</Text>
            <TextInput
              style={styles.input}
              placeholder="40"
              value={measurements.pants_size}
              onChangeText={(value) => setMeasurements({ ...measurements, pants_size: value })}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Vestido</Text>
            <TextInput
              style={styles.input}
              placeholder="38"
              value={measurements.dress_size}
              onChangeText={(value) => setMeasurements({ ...measurements, dress_size: value })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Sapato</Text>
            <TextInput
              style={styles.input}
              placeholder="38"
              value={measurements.shoe_size}
              onChangeText={(value) => setMeasurements({ ...measurements, shoe_size: value })}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gênero</Text>
        <View style={styles.radioGroup}>
          {['male', 'female', 'unisex', 'other'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.radioButton,
                measurements.gender === option && styles.radioButtonSelected,
              ]}
              onPress={() => setMeasurements({ ...measurements, gender: option })}
            >
              <Text
                style={[
                  styles.radioText,
                  measurements.gender === option && styles.radioTextSelected,
                ]}
              >
                {option === 'male' ? 'Masculino' : option === 'female' ? 'Feminino' : option === 'unisex' ? 'Unissex' : 'Outro'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Observações</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Alguma informação adicional..."
          value={measurements.notes}
          onChangeText={(value) => setMeasurements({ ...measurements, notes: value })}
          multiline
          numberOfLines={4}
        />
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Salvar Medidas</Text>
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
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
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
    height: 100,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  radioButton: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  radioButtonSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  radioText: {
    fontSize: 14,
    color: '#6b7280',
  },
  radioTextSelected: {
    color: '#6366f1',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

