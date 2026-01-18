import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../config/api';
import { colors } from '../../constants/colors';
import SafeIcon from '../../components/SafeIcon';

export default function EditItemScreen({ navigation, route }) {
  const { itemId } = route.params;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'dress',
    gender: 'unisex',
    color: '',
    brand: '',
    condition: 'good',
    size: '',
    shoe_size: '',
    shoulder_width: '',
    chest: '',
    waist: '',
    hip: '',
    length: '',
    price_per_day: '',
    is_for_sale: false,
    sale_price: '',
  });

  useEffect(() => {
    loadItem();
  }, []);

  async function loadItem() {
    try {
      const response = await api.get(`/clothing-items/${itemId}`);
      if (response.data.success) {
        const item = response.data.data;
        setFormData({
          title: item.title || '',
          description: item.description || '',
          category: item.category || 'dress',
          gender: item.gender || 'unisex',
          color: item.color || '',
          brand: item.brand || '',
          condition: item.condition || 'good',
          size: item.size || '',
          shoe_size: item.shoe_size || '',
          shoulder_width: item.shoulder_width || '',
          chest: item.chest || '',
          waist: item.waist || '',
          hip: item.hip || '',
          length: item.length || '',
          price_per_day: item.price_per_day ? item.price_per_day.toString() : '',
          is_for_sale: item.is_for_sale || false,
          sale_price: item.sale_price ? item.sale_price.toString() : '',
        });
        setExistingPhotos(item.photos || []);
      }
    } catch (error) {
      console.error('Erro ao carregar peça:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados da peça');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  // Função para tirar foto com a câmera
  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Permita o acesso à câmera para tirar fotos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets[0]) {
      const newPhotos = [...photos, result.assets[0]];
      console.log('Foto da câmera adicionada. Total:', newPhotos.length);
      setPhotos(newPhotos);
    }
  }

  // Função para escolher da galeria
  async function pickImages() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newPhotos = [...photos, ...result.assets];
      console.log('Fotos adicionadas. Total:', newPhotos.length);
      setPhotos(newPhotos);
    }
  }

  // Função para mostrar opções de foto
  function showPhotoOptions() {
    Alert.alert(
      'Adicionar Foto',
      'Escolha uma opção',
      [
        { text: 'Câmera', onPress: takePhoto },
        { text: 'Galeria', onPress: pickImages },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  }

  async function handleDeleteExistingPhoto(photoId) {
    Alert.alert(
      'Excluir Foto',
      'Tem certeza que deseja excluir esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/clothing-items/photos/${photoId}`);
              setExistingPhotos(existingPhotos.filter(p => p.id !== photoId));
              Alert.alert('Sucesso', 'Foto excluída com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir a foto');
            }
          },
        },
      ]
    );
  }

  function removeNewPhoto(index) {
    setPhotos(photos.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    if (!formData.title || !formData.description || !formData.price_per_day) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.is_for_sale && !formData.sale_price) {
      Alert.alert('Erro', 'Informe o preço de venda');
      return;
    }

    setSaving(true);

    try {
      // Atualiza os dados da peça
      const response = await api.put(`/clothing-items/${itemId}`, formData);
      
      if (response.data.success) {
        // Se há novas fotos, faz o upload
        if (photos.length > 0) {
          try {
            const uploadData = new FormData();
            photos.forEach((photo, index) => {
              uploadData.append('photos[]', {
                uri: photo.uri,
                type: 'image/jpeg',
                name: `photo_${index}.jpg`,
              });
            });

            const uploadResponse = await api.post(`/clothing-items/${itemId}/photos`, uploadData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });

            if (uploadResponse.data.success) {
              // Recarrega as fotos do servidor para mostrar as novas
              const itemResponse = await api.get(`/clothing-items/${itemId}`);
              if (itemResponse.data.success) {
                setExistingPhotos(itemResponse.data.data.photos || []);
                setPhotos([]); // Limpa as fotos novas após upload
              }
            }
          } catch (uploadError) {
            console.error('Erro ao fazer upload das fotos:', uploadError);
            Alert.alert('Aviso', 'Peça atualizada, mas houve erro ao enviar algumas fotos');
          }
        }

        Alert.alert('Sucesso', 'Peça atualizada com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Erro ao atualizar peça:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a peça');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fotos</Text>
        
        {/* Fotos existentes */}
        {existingPhotos.length > 0 && (
          <>
            <Text style={styles.label}>Fotos atuais</Text>
            <ScrollView horizontal style={styles.photoPreview}>
              {existingPhotos.map((photo) => (
                <View key={photo.id} style={styles.photoContainer}>
                  <Image
                    source={{ uri: photo.url }}
                    style={styles.photoThumb}
                  />
                  <TouchableOpacity
                    style={styles.photoDeleteButton}
                    onPress={() => handleDeleteExistingPhoto(photo.id)}
                  >
                    <SafeIcon name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </>
        )}

        {/* Novas fotos */}
        {photos.length > 0 && (
          <>
            <Text style={styles.label}>Novas fotos ({photos.length})</Text>
            <ScrollView 
              horizontal 
              style={styles.photoPreview}
              showsHorizontalScrollIndicator={false}
            >
              {photos.map((photo, index) => {
                const photoUri = photo.uri || photo.uri || '';
                return (
                  <View key={`new-${index}-${photoUri}`} style={styles.photoContainer}>
                    <Image
                      source={{ uri: photoUri }}
                      style={styles.photoThumb}
                      onError={(e) => {
                        console.error('Erro ao carregar foto:', e.nativeEvent.error);
                      }}
                    />
                    <TouchableOpacity
                      style={styles.photoDeleteButton}
                      onPress={() => removeNewPhoto(index)}
                    >
                      <SafeIcon name="close" size={16} color="#fff" />
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}

        <View style={styles.photoButtonsRow}>
          <TouchableOpacity style={[styles.photoButton, styles.photoButtonHalf]} onPress={takePhoto}>
            <SafeIcon name="camera" size={28} color={colors.primary} style={styles.photoButtonIcon} />
            <Text style={styles.photoButtonText}>Tirar Foto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.photoButton, styles.photoButtonHalf]} onPress={pickImages}>
            <SafeIcon name="images" size={28} color={colors.primary} style={styles.photoButtonIcon} />
            <Text style={styles.photoButtonText}>Galeria</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.photoCountText}>
          {photos.length > 0 && `${photos.length} nova(s) foto(s) para adicionar`}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Básicas</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Título *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Vestido de festa azul"
            value={formData.title}
            onChangeText={(value) => setFormData({ ...formData, title: value })}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Descrição *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva a peça..."
            value={formData.description}
            onChangeText={(value) => setFormData({ ...formData, description: value })}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Preço por Dia (R$) *</Text>
          <TextInput
            style={styles.input}
            placeholder="50.00"
            value={formData.price_per_day}
            onChangeText={(value) => setFormData({ ...formData, price_per_day: value })}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setFormData({ ...formData, is_for_sale: !formData.is_for_sale })}
            >
              {formData.is_for_sale && (
                <SafeIcon name="checkmark" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
            <Text style={styles.checkboxLabel}>
              Este produto também está à venda
            </Text>
          </View>
        </View>

        {formData.is_for_sale && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Preço de Venda (R$) *</Text>
            <TextInput
              style={styles.input}
              placeholder="200.00"
              value={formData.sale_price}
              onChangeText={(value) => setFormData({ ...formData, sale_price: value })}
              keyboardType="decimal-pad"
            />
          </View>
        )}

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Cor</Text>
            <TextInput
              style={styles.input}
              placeholder="Azul"
              value={formData.color}
              onChangeText={(value) => setFormData({ ...formData, color: value })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Marca</Text>
            <TextInput
              style={styles.input}
              placeholder="Nike"
              value={formData.brand}
              onChangeText={(value) => setFormData({ ...formData, brand: value })}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tamanhos</Text>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tamanho</Text>
            <TextInput
              style={styles.input}
              placeholder="M"
              value={formData.size}
              onChangeText={(value) => setFormData({ ...formData, size: value })}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Sapato</Text>
            <TextInput
              style={styles.input}
              placeholder="38"
              value={formData.shoe_size}
              onChangeText={(value) => setFormData({ ...formData, shoe_size: value })}
              keyboardType="decimal-pad"
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medidas (cm) - Opcional</Text>

        <View style={styles.row}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Ombros</Text>
            <TextInput
              style={styles.input}
              placeholder="42"
              value={formData.shoulder_width}
              onChangeText={(value) => setFormData({ ...formData, shoulder_width: value })}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Busto</Text>
            <TextInput
              style={styles.input}
              placeholder="90"
              value={formData.chest}
              onChangeText={(value) => setFormData({ ...formData, chest: value })}
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
              value={formData.waist}
              onChangeText={(value) => setFormData({ ...formData, waist: value })}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Quadril</Text>
            <TextInput
              style={styles.input}
              placeholder="95"
              value={formData.hip}
              onChangeText={(value) => setFormData({ ...formData, hip: value })}
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Comprimento</Text>
          <TextInput
            style={styles.input}
            placeholder="120"
            value={formData.length}
            onChangeText={(value) => setFormData({ ...formData, length: value })}
            keyboardType="decimal-pad"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Salvar Alterações</Text>
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
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  photoButton: {
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
  },
  photoButtonHalf: {
    flex: 1,
  },
  photoButtonIcon: {
    marginBottom: 8,
  },
  photoButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  photoCountText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  photoPreview: {
    marginTop: 12,
    marginBottom: 12,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 8,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  photoDeleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#dc2626',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoDeleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  inputContainer: {
    flex: 1,
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
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#6366f1',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
});

