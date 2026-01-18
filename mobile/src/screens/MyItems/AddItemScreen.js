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
  Modal,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../../config/api';
import { colors } from '../../constants/colors';
import SafeIcon from '../../components/SafeIcon';

export default function AddItemScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [photos, setPhotos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clothing_category_id: null,
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
    sleeve_length: '',
    inseam: '',
    price_per_day: '',
    is_for_sale: false,
    sale_price: '',
  });

  // Carregar categorias ao montar o componente
  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      const response = await api.get('/clothing-categories');
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      // Fallback: usar categorias hardcoded se o servidor não responder
      setCategories(getFallbackCategories());
      console.log('Usando categorias locais como fallback');
    } finally {
      setLoadingCategories(false);
    }
  }

  // Categorias locais como fallback (enquanto o servidor não está configurado)
  function getFallbackCategories() {
    return [
      {
        id: 1,
        name: 'Vestido',
        slug: 'dress',
        icon: '👗',
        description: 'Vestidos de diversos estilos',
        attributes: [
          { id: 1, attribute_name: 'size', label: 'Tamanho', type: 'string', unit: null, placeholder: 'P, M, G, GG', order: 1, is_required: false },
          { id: 2, attribute_name: 'chest', label: 'Busto', type: 'decimal', unit: 'cm', placeholder: '90', order: 2, is_required: false },
          { id: 3, attribute_name: 'waist', label: 'Cintura', type: 'decimal', unit: 'cm', placeholder: '75', order: 3, is_required: false },
          { id: 4, attribute_name: 'hip', label: 'Quadril', type: 'decimal', unit: 'cm', placeholder: '95', order: 4, is_required: false },
          { id: 5, attribute_name: 'length', label: 'Comprimento', type: 'decimal', unit: 'cm', placeholder: '120', order: 5, is_required: false },
        ],
      },
      {
        id: 2,
        name: 'Calça',
        slug: 'pants',
        icon: '👖',
        description: 'Calças e bermudas',
        attributes: [
          { id: 6, attribute_name: 'size', label: 'Tamanho', type: 'string', unit: null, placeholder: '38, 40, 42', order: 1, is_required: false },
          { id: 7, attribute_name: 'waist', label: 'Cintura', type: 'decimal', unit: 'cm', placeholder: '75', order: 2, is_required: false },
          { id: 8, attribute_name: 'hip', label: 'Quadril', type: 'decimal', unit: 'cm', placeholder: '95', order: 3, is_required: false },
          { id: 9, attribute_name: 'inseam', label: 'Altura da Cava', type: 'decimal', unit: 'cm', placeholder: '80', order: 4, is_required: false },
          { id: 10, attribute_name: 'length', label: 'Comprimento', type: 'decimal', unit: 'cm', placeholder: '100', order: 5, is_required: false },
        ],
      },
      {
        id: 3,
        name: 'Camisa',
        slug: 'shirt',
        icon: '👔',
        description: 'Camisas sociais e casuais',
        attributes: [
          { id: 11, attribute_name: 'size', label: 'Tamanho', type: 'string', unit: null, placeholder: 'P, M, G, GG', order: 1, is_required: false },
          { id: 12, attribute_name: 'shoulder_width', label: 'Largura do Ombro', type: 'decimal', unit: 'cm', placeholder: '42', order: 2, is_required: false },
          { id: 13, attribute_name: 'chest', label: 'Busto/Peito', type: 'decimal', unit: 'cm', placeholder: '100', order: 3, is_required: false },
          { id: 14, attribute_name: 'sleeve_length', label: 'Comprimento da Manga', type: 'decimal', unit: 'cm', placeholder: '60', order: 4, is_required: false },
          { id: 15, attribute_name: 'length', label: 'Comprimento', type: 'decimal', unit: 'cm', placeholder: '70', order: 5, is_required: false },
        ],
      },
      {
        id: 4,
        name: 'Sapato',
        slug: 'shoes',
        icon: '👠',
        description: 'Sapatos e tênis',
        attributes: [
          { id: 16, attribute_name: 'shoe_size', label: 'Número', type: 'decimal', unit: null, placeholder: '38', order: 1, is_required: false },
        ],
      },
      {
        id: 5,
        name: 'Saia',
        slug: 'skirt',
        icon: '👗',
        description: 'Saias de diversos estilos',
        attributes: [
          { id: 17, attribute_name: 'size', label: 'Tamanho', type: 'string', unit: null, placeholder: 'P, M, G', order: 1, is_required: false },
          { id: 18, attribute_name: 'waist', label: 'Cintura', type: 'decimal', unit: 'cm', placeholder: '75', order: 2, is_required: false },
          { id: 19, attribute_name: 'hip', label: 'Quadril', type: 'decimal', unit: 'cm', placeholder: '95', order: 3, is_required: false },
          { id: 20, attribute_name: 'length', label: 'Comprimento', type: 'decimal', unit: 'cm', placeholder: '60', order: 4, is_required: false },
        ],
      },
      {
        id: 6,
        name: 'Blazer',
        slug: 'blazer',
        icon: '🧥',
        description: 'Blazers e casacos',
        attributes: [
          { id: 21, attribute_name: 'size', label: 'Tamanho', type: 'string', unit: null, placeholder: 'P, M, G, GG', order: 1, is_required: false },
          { id: 22, attribute_name: 'shoulder_width', label: 'Largura do Ombro', type: 'decimal', unit: 'cm', placeholder: '42', order: 2, is_required: false },
          { id: 23, attribute_name: 'chest', label: 'Peito', type: 'decimal', unit: 'cm', placeholder: '100', order: 3, is_required: false },
          { id: 24, attribute_name: 'sleeve_length', label: 'Comprimento da Manga', type: 'decimal', unit: 'cm', placeholder: '60', order: 4, is_required: false },
          { id: 25, attribute_name: 'length', label: 'Comprimento', type: 'decimal', unit: 'cm', placeholder: '70', order: 5, is_required: false },
        ],
      },
      {
        id: 7,
        name: 'Terno',
        slug: 'suit',
        icon: '🤵',
        description: 'Ternos completos',
        attributes: [
          { id: 26, attribute_name: 'size', label: 'Tamanho', type: 'string', unit: null, placeholder: 'P, M, G, GG', order: 1, is_required: false },
          { id: 27, attribute_name: 'shoulder_width', label: 'Largura do Ombro', type: 'decimal', unit: 'cm', placeholder: '42', order: 2, is_required: false },
          { id: 28, attribute_name: 'chest', label: 'Peito', type: 'decimal', unit: 'cm', placeholder: '100', order: 3, is_required: false },
          { id: 29, attribute_name: 'waist', label: 'Cintura', type: 'decimal', unit: 'cm', placeholder: '85', order: 4, is_required: false },
          { id: 30, attribute_name: 'sleeve_length', label: 'Comprimento da Manga', type: 'decimal', unit: 'cm', placeholder: '60', order: 5, is_required: false },
          { id: 31, attribute_name: 'length', label: 'Comprimento', type: 'decimal', unit: 'cm', placeholder: '70', order: 6, is_required: false },
        ],
      },
      {
        id: 8,
        name: 'Acessório',
        slug: 'accessory',
        icon: '👜',
        description: 'Bolsas, cintos, joias e outros acessórios',
        attributes: [
          { id: 32, attribute_name: 'size', label: 'Tamanho', type: 'string', unit: null, placeholder: 'Pequeno, Médio, Grande', order: 1, is_required: false },
        ],
      },
    ];
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
      setPhotos([...photos, result.assets[0]]);
    }
  }

  // Função para escolher da galeria
  async function pickImages() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhotos([...photos, ...result.assets]);
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

  // Função para remover foto
  function removePhoto(index) {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  }

  // Função para selecionar categoria
  function selectCategory(category) {
    setSelectedCategory(category);
    setFormData({ ...formData, clothing_category_id: category.id });
    setCategoryModalVisible(false);
    
    // Limpar campos de medidas ao trocar de categoria
    setFormData(prev => ({
      ...prev,
      clothing_category_id: category.id,
      size: '',
      shoe_size: '',
      shoulder_width: '',
      chest: '',
      waist: '',
      hip: '',
      length: '',
      sleeve_length: '',
      inseam: '',
    }));
  }

  // Obter atributos da categoria selecionada
  function getCategoryAttributes() {
    if (!selectedCategory || !selectedCategory.attributes) {
      return [];
    }
    return selectedCategory.attributes.sort((a, b) => a.order - b.order);
  }

  // Renderizar campo de atributo dinamicamente
  function renderAttributeField(attribute) {
    const value = formData[attribute.attribute_name] || '';
    const label = `${attribute.label}${attribute.unit ? ` (${attribute.unit})` : ''}${attribute.is_required ? ' *' : ''}`;
    
    return (
      <View key={attribute.id} style={styles.inputContainer}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
          style={styles.input}
          placeholder={attribute.placeholder || ''}
          value={value}
          onChangeText={(text) => setFormData({ ...formData, [attribute.attribute_name]: text })}
          keyboardType={attribute.type === 'decimal' || attribute.type === 'integer' ? 'decimal-pad' : 'default'}
        />
      </View>
    );
  }

  async function handleSubmit() {
    if (!formData.title || !formData.description || !formData.price_per_day) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (!formData.clothing_category_id) {
      Alert.alert('Erro', 'Selecione uma categoria');
      return;
    }

    if (formData.is_for_sale && !formData.sale_price) {
      Alert.alert('Erro', 'Informe o preço de venda');
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Erro', 'Adicione pelo menos uma foto da peça');
      return;
    }

    setLoading(true);

    try {
      // Prepara os dados, convertendo strings vazias para null
      const submitData = { ...formData };
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          submitData[key] = null;
        }
      });

      // Cria a peça
      const response = await api.post('/clothing-items', submitData);
      
      if (response.data.success) {
        const itemId = response.data.data.id;

        // Faz upload das fotos
        const uploadData = new FormData();
        photos.forEach((photo, index) => {
          uploadData.append('photos[]', {
            uri: photo.uri,
            type: 'image/jpeg',
            name: `photo_${index}.jpg`,
          });
        });

        await api.post(`/clothing-items/${itemId}/photos`, uploadData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        Alert.alert('Sucesso', 'Peça cadastrada com sucesso!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Erro ao cadastrar peça:', error);
      const message = error.response?.data?.message || 'Não foi possível cadastrar a peça';
      Alert.alert('Erro', message);
    } finally {
      setLoading(false);
    }
  }

  const categoryAttributes = getCategoryAttributes();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Fotos *</Text>
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
        
        {photos.length > 0 && (
          <ScrollView horizontal style={styles.photoPreview}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoThumbContainer}>
                <Image
                  source={{ uri: photo.uri }}
                  style={styles.photoThumb}
                />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <Text style={styles.removePhotoText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
        <Text style={styles.photoCountText}>{photos.length} foto(s) adicionada(s)</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informações Básicas</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Categoria *</Text>
          <TouchableOpacity
            style={styles.categoryButton}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={styles.categoryButtonText}>
              {selectedCategory ? `${selectedCategory.icon} ${selectedCategory.name}` : 'Selecione uma categoria'}
            </Text>
            <Text style={styles.categoryButtonArrow}>▼</Text>
          </TouchableOpacity>
        </View>

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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gênero</Text>
          <View style={styles.genderButtons}>
            {['unisex', 'male', 'female'].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.genderButton,
                  formData.gender === gender && styles.genderButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, gender })}
              >
                <Text
                  style={[
                    styles.genderButtonText,
                    formData.gender === gender && styles.genderButtonTextActive,
                  ]}
                >
                  {gender === 'unisex' ? 'Unissex' : gender === 'male' ? 'Masculino' : 'Feminino'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {selectedCategory && categoryAttributes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Medidas e Tamanhos</Text>
          {categoryAttributes.map(attribute => renderAttributeField(attribute))}
        </View>
      )}

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Cadastrar Peça</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 40 }} />

      {/* Modal de seleção de categoria */}
      <Modal
        visible={categoryModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecione a Categoria</Text>
              <TouchableOpacity
                onPress={() => setCategoryModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <SafeIcon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            
            {loadingCategories ? (
              <ActivityIndicator size="large" color="#6366f1" style={styles.modalLoading} />
            ) : (
              <FlatList
                data={categories}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.categoryItem,
                      selectedCategory?.id === item.id && styles.categoryItemSelected,
                    ]}
                    onPress={() => selectCategory(item)}
                  >
                    <Text style={styles.categoryItemIcon}>{item.icon}</Text>
                    <View style={styles.categoryItemInfo}>
                      <Text style={styles.categoryItemName}>{item.name}</Text>
                      {item.description && (
                        <Text style={styles.categoryItemDescription}>{item.description}</Text>
                      )}
                    </View>
                    {selectedCategory?.id === item.id && (
                      <Text style={styles.categoryItemCheck}>✓</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
  },
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
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
  photoPreview: {
    marginTop: 12,
  },
  photoThumbContainer: {
    position: 'relative',
    marginRight: 8,
  },
  photoThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  photoCountText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
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
    height: 100,
    textAlignVertical: 'top',
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9fafb',
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#1f2937',
  },
  categoryButtonArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  genderButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  genderButtonTextActive: {
    color: '#fff',
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  modalCloseButton: {
    padding: 8,
    backgroundColor: '#ef4444',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLoading: {
    padding: 40,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  categoryItemSelected: {
    backgroundColor: '#eef2ff',
  },
  categoryItemIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  categoryItemInfo: {
    flex: 1,
  },
  categoryItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  categoryItemDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  categoryItemCheck: {
    fontSize: 20,
    color: '#6366f1',
    fontWeight: 'bold',
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
