import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import api from '../../config/api';

const { width } = Dimensions.get('window');

export default function ItemDetailScreen({ route, navigation }) {
  const { itemId } = route.params;
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    loadItem();
  }, []);

  async function loadItem() {
    try {
      const response = await api.get(`/clothing-items/${itemId}`);
      if (response.data.success) {
        setItem(response.data.data);
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os detalhes da peça');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }

  async function handleRent() {
    navigation.navigate('RentRequest', { item });
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Galeria de fotos */}
      <View style={styles.gallery}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setActivePhotoIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {item.photos && item.photos.length > 0 ? (
            item.photos.map((photo, index) => (
              <Image
                key={photo.id}
                source={{ uri: photo.url }}
                style={styles.photo}
              />
            ))
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>Sem fotos</Text>
            </View>
          )}
        </ScrollView>
        
        {item.photos && item.photos.length > 1 && (
          <View style={styles.pagination}>
            {item.photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activePhotoIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>

      {/* Informações */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>R$ {item.price_per_day}/dia</Text>
          </View>
          
          <View style={styles.badges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.category}</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.condition}</Text>
            </View>
            {item.gender && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.gender}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>

        {(item.size || item.shoe_size) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tamanho</Text>
            {item.size && <Text style={styles.infoText}>Tamanho: {item.size}</Text>}
            {item.shoe_size && <Text style={styles.infoText}>Calçado: {item.shoe_size}</Text>}
          </View>
        )}

        {(item.shoulder_width || item.chest || item.waist) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medidas (cm)</Text>
            {item.shoulder_width && <Text style={styles.infoText}>Ombros: {item.shoulder_width}</Text>}
            {item.chest && <Text style={styles.infoText}>Busto/Peitoral: {item.chest}</Text>}
            {item.waist && <Text style={styles.infoText}>Cintura: {item.waist}</Text>}
            {item.hip && <Text style={styles.infoText}>Quadril: {item.hip}</Text>}
            {item.length && <Text style={styles.infoText}>Comprimento: {item.length}</Text>}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Proprietário</Text>
          <View style={styles.owner}>
            <View style={styles.ownerAvatar}>
              <Text style={styles.ownerAvatarText}>
                {item.user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{item.user.name}</Text>
              {item.user.city && (
                <Text style={styles.ownerLocation}>
                  📍 {item.user.city}, {item.user.state}
                </Text>
              )}
            </View>
          </View>
        </View>

        {item.match_score && (
          <View style={styles.compatibilityContainer}>
            <Text style={styles.compatibilityTitle}>Compatibilidade</Text>
            <View style={styles.compatibilityBar}>
              <View
                style={[
                  styles.compatibilityFill,
                  { width: `${item.match_score}%` },
                ]}
              />
            </View>
            <Text style={styles.compatibilityText}>
              {Math.round(item.match_score)}% compatível com suas medidas
            </Text>
          </View>
        )}
      </View>

      {/* Botões de ação */}
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.tryOnButton} 
          onPress={() => navigation.navigate('VirtualTryOn', { item })}
        >
          <Text style={styles.tryOnButtonText}>✨ Experimentar Virtualmente</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.rentButton} onPress={handleRent}>
          <Text style={styles.rentButtonText}>Alugar Peça</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 20 }} />
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
  gallery: {
    height: 400,
    backgroundColor: '#f3f4f6',
  },
  photo: {
    width: width,
    height: 400,
  },
  photoPlaceholder: {
    width: width,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  pagination: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  paginationDotActive: {
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  infoText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 8,
  },
  owner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ownerAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  ownerLocation: {
    fontSize: 14,
    color: '#6b7280',
  },
  compatibilityContainer: {
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  compatibilityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 8,
  },
  compatibilityBar: {
    height: 8,
    backgroundColor: '#d1fae5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  compatibilityFill: {
    height: '100%',
    backgroundColor: '#16a34a',
  },
  compatibilityText: {
    fontSize: 14,
    color: '#16a34a',
  },
  actions: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  tryOnButton: {
    backgroundColor: '#f0fdf4',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  tryOnButtonText: {
    color: '#16a34a',
    fontSize: 18,
    fontWeight: '600',
  },
  rentButton: {
    backgroundColor: '#6366f1',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  rentButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

