import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { downloadAsync, documentDirectory } from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import api from '../../config/api';
import { colors } from '../../constants/colors';
import SafeIcon from '../../components/SafeIcon';

export default function VirtualTryOnScreen({ route, navigation }) {
  const { item } = route.params || {};
  
  // Proteção: se não houver item, volta para tela anterior
  if (!item) {
    Alert.alert('Erro', 'Item não encontrado');
    navigation.goBack();
    return null;
  }
  
  const [userPhoto, setUserPhoto] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [predictionId, setPredictionId] = useState(null);

  async function selectUserPhoto() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso à galeria');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });

      if (!result.canceled) {
        setUserPhoto(result.assets[0]);
        setResultImage(null); // Limpa resultado anterior
      }
    } catch (error) {
      console.error('Erro ao selecionar foto:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a foto');
    }
  }

  async function takePhoto() {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Precisamos de acesso à câmera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
      });

      if (!result.canceled) {
        setUserPhoto(result.assets[0]);
        setResultImage(null);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto');
    }
  }

  async function startTryOn() {
    if (!userPhoto) {
      Alert.alert('Atenção', 'Selecione ou tire uma foto sua primeiro');
      return;
    }

    setLoading(true);
    setProcessing(true);

    try {
      const formData = new FormData();
      formData.append('clothing_item_id', item.id);
      formData.append('user_photo', {
        uri: userPhoto.uri,
        type: 'image/jpeg',
        name: 'user_photo.jpg',
      });

      console.log('=== VIRTUAL TRY-ON DEBUG ===');
      console.log('Item ID:', item.id);
      console.log('User Photo URI:', userPhoto.uri);
      console.log('Enviando para API...');
      
      const response = await api.post('/virtual-try-on', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 segundos
      });

      console.log('Resposta completa:', response);
      console.log('Resposta data:', response.data);

      if (response.data.success) {
        const predId = response.data.data.prediction_id;
        setPredictionId(predId);
        
        // Inicia polling para verificar status
        checkPredictionStatus(predId);
      }
    } catch (error) {
      console.log('=== ERRO COMPLETO ===');
      console.error('Erro ao processar:', error);
      console.log('Error message:', error.message);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);
      console.log('Error response status:', error.response?.status);
      console.log('Error request:', error.request);
      console.log('Error config:', error.config);
      
      let errorMessage = 'Não foi possível processar a imagem';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Erro', errorMessage);
      setLoading(false);
      setProcessing(false);
    }
  }

  async function checkPredictionStatus(predId) {
    try {
      const response = await api.get(`/virtual-try-on/status/${predId}`);
      const { status, output, local_url, output_url, error } = response.data.data;

      console.log('Status:', status);
      console.log('Response data:', response.data.data);

      if (status === 'succeeded') {
        // Usa local_url se disponível, senão usa output_url, senão usa output[0]
        const imageUrl = local_url || output_url || (Array.isArray(output) ? output[0] : output);
        
        console.log('Image URL:', imageUrl);
        
        if (imageUrl) {
          setResultImage(imageUrl);
          setLoading(false);
          setProcessing(false);
          Alert.alert('Pronto!', 'Sua experimentação virtual está pronta! 🎉');
        } else {
          console.log('Nenhuma URL de imagem disponível');
          setLoading(false);
          setProcessing(false);
          Alert.alert('Erro', 'Processamento concluído mas nenhuma imagem foi gerada.');
        }
      } else if (status === 'failed' || status === 'canceled') {
        console.log('FALHA! Erro:', error);
        setLoading(false);
        setProcessing(false);
        Alert.alert(
          'Erro no Processamento', 
          error || 'A API Replicate não conseguiu processar a imagem. Possíveis causas:\n\n• Foto do usuário não adequada\n• Foto da roupa não adequada\n• Erro temporário da API\n\nTente novamente com fotos diferentes.'
        );
      } else if (status === 'processing' || status === 'starting') {
        // Continua verificando a cada 3 segundos
        setTimeout(() => checkPredictionStatus(predId), 3000);
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      console.log('Erro completo:', error.response?.data);
      setLoading(false);
      setProcessing(false);
      Alert.alert('Erro', 'Não foi possível verificar o status: ' + (error.response?.data?.message || error.message || 'Erro desconhecido'));
    }
  }

  async function downloadImage() {
    try {
      console.log('Baixando imagem:', resultImage);
      
      let fileUri;
      
      if (resultImage.startsWith('http')) {
        fileUri = documentDirectory + 'virtual-tryon-' + Date.now() + '.jpg';
        console.log('Baixando para:', fileUri);
        const downloadResult = await downloadAsync(resultImage, fileUri);
        fileUri = downloadResult.uri;
      } else {
        fileUri = resultImage;
      }
      
      return fileUri;
    } catch (error) {
      console.error('Erro ao baixar:', error);
      throw error;
    }
  }

  async function shareImage() {
    try {
      const fileUri = await downloadImage();
      
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Erro', 'Compartilhamento não disponível neste dispositivo');
        return;
      }
      
      // O menu de compartilhamento do Android permite salvar diretamente
      await Sharing.shareAsync(fileUri, {
        mimeType: 'image/jpeg',
        dialogTitle: 'Salvar ou Compartilhar Imagem',
        UTI: 'image/jpeg',
      });
      
      console.log('Compartilhamento concluído');
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      Alert.alert('Erro', 'Não foi possível compartilhar a imagem: ' + error.message);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Experimentação Virtual</Text>
        <Text style={styles.headerSubtitle}>
          Veja como ficaria com esta peça!
        </Text>
      </View>

      <View style={styles.itemInfo}>
        {(item.photos?.[0]?.url || item.primary_photo?.url) && (
          <Image
            source={{ uri: item.photos?.[0]?.url || item.primary_photo?.url }}
            style={styles.itemImage}
          />
        )}
        <Text style={styles.itemTitle}>{item.title || 'Item'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sua Foto</Text>
        <Text style={styles.sectionSubtitle}>
          Tire ou selecione uma foto sua de corpo inteiro, de frente
        </Text>

        {userPhoto ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: userPhoto.uri }} style={styles.userPhoto} />
            <TouchableOpacity
              style={styles.changePhotoButton}
              onPress={selectUserPhoto}
            >
              <Text style={styles.changePhotoText}>Alterar Foto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.photoButtons}>
            <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
              <SafeIcon name="camera" size={28} color={colors.primary} style={styles.photoButtonIcon} />
              <Text style={styles.photoButtonText}>Tirar Foto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.photoButton} onPress={selectUserPhoto}>
              <SafeIcon name="images" size={28} color={colors.primary} style={styles.photoButtonIcon} />
              <Text style={styles.photoButtonText}>Escolher da Galeria</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {userPhoto && !resultImage && (
        <TouchableOpacity
          style={styles.tryOnButton}
          onPress={startTryOn}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={styles.tryOnButtonText}>✨ Experimentar Virtualmente</Text>
          )}
        </TouchableOpacity>
      )}

      {processing && !resultImage && (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.processingText}>Processando...</Text>
          <Text style={styles.processingSubtext}>
            Isso pode levar de 30 segundos a 2 minutos
          </Text>
        </View>
      )}

      {resultImage && (
        <View style={styles.resultSection}>
          <Text style={styles.resultTitle}>🎉 Resultado!</Text>
          <Image source={{ uri: resultImage }} style={styles.resultImage} />
          
          <View style={styles.resultActions}>
            <TouchableOpacity style={styles.saveButton} onPress={shareImage}>
              <Text style={styles.saveButtonText}>💾 Salvar ou Compartilhar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.tryAgainButton}
              onPress={() => {
                setUserPhoto(null);
                setResultImage(null);
              }}
            >
              <Text style={styles.tryAgainButtonText}>🔄 Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'colors.white',
  },
  header: {
    backgroundColor: 'colors.primary',
    padding: 20,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'colors.white',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'colors.accent',
  },
  itemInfo: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'colors.backgroundLight',
    borderBottomWidth: 1,
    borderBottomColor: 'colors.border',
  },
  itemImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'colors.text',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'colors.text',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'colors.gray',
    marginBottom: 16,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    backgroundColor: 'colors.lightGray',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'colors.border',
  },
  photoButtonIcon: {
    marginBottom: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'colors.darkGray',
  },
  photoContainer: {
    alignItems: 'center',
  },
  userPhoto: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    marginBottom: 12,
  },
  changePhotoButton: {
    backgroundColor: 'colors.lightGray',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'colors.darkGray',
  },
  tryOnButton: {
    backgroundColor: 'colors.primary',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  tryOnButtonText: {
    color: 'colors.white',
    fontSize: 18,
    fontWeight: '600',
  },
  processingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  processingText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'colors.primary',
    marginTop: 16,
  },
  processingSubtext: {
    fontSize: 14,
    color: 'colors.gray',
    marginTop: 8,
    textAlign: 'center',
  },
  resultSection: {
    padding: 20,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 16,
  },
  resultImage: {
    width: '100%',
    height: 500,
    borderRadius: 12,
    marginBottom: 20,
  },
  resultActions: {
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'colors.white',
    fontSize: 16,
    fontWeight: '600',
  },
  tryAgainButton: {
    backgroundColor: 'colors.lightGray',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  tryAgainButtonText: {
    color: 'colors.darkGray',
    fontSize: 16,
    fontWeight: '600',
  },
});

