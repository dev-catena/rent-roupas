import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import api from '../../config/api';
import { colors } from '../../constants/colors';
import SafeIcon from '../../components/SafeIcon';

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    clothing_category_id: null,
    gender: null,
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

  // Categorias locais como fallback
  function getFallbackCategories() {
    return [
      { id: 1, name: 'Vestido', slug: 'dress' },
      { id: 2, name: 'Calça', slug: 'pants' },
      { id: 3, name: 'Camisa', slug: 'shirt' },
      { id: 4, name: 'Sapato', slug: 'shoes' },
      { id: 5, name: 'Saia', slug: 'skirt' },
      { id: 6, name: 'Blazer', slug: 'blazer' },
      { id: 7, name: 'Terno', slug: 'suit' },
      { id: 8, name: 'Acessório', slug: 'accessory' },
    ];
  }

  async function handleSearch() {
    setLoading(true);
    try {
      const params = {};
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      if (filters.clothing_category_id) {
        params.clothing_category_id = filters.clothing_category_id;
      }
      
      if (filters.gender) {
        params.gender = filters.gender;
      }

      const response = await api.get('/clothing-items', { params });

      if (response.data.success) {
        setResults(response.data.data.data || []);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  // Buscar automaticamente quando o filtro mudar
  useEffect(() => {
    if (!loadingCategories) {
      handleSearch();
    }
  }, [filters.clothing_category_id, filters.gender]);

  function renderCategoryFilter() {
    const allCategories = [
      { id: null, name: 'Todos' },
      ...categories,
    ];

    return (
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Categoria:</Text>
        {loadingCategories ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <FlatList
            horizontal
            data={allCategories}
            keyExtractor={(item) => item.id?.toString() || 'all'}
            renderItem={({ item }) => {
              const isActive = filters.clothing_category_id === item.id;
              return (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                  onPress={() => setFilters({ ...filters, clothing_category_id: item.id })}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
            showsHorizontalScrollIndicator={false}
          />
        )}
      </View>
    );
  }

  function renderItem({ item }) {
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ItemDetail', { itemId: item.id })}
      >
        {item.primary_photo ? (
          <Image source={{ uri: item.primary_photo.url }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Text>Sem foto</Text>
          </View>
        )}
        
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardPrice}>R$ {item.price_per_day}/dia</Text>
          {item.category && (
            <Text style={styles.cardCategory}>{item.category.name || item.category}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar roupas..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <SafeIcon name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {renderCategoryFilter()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'Nenhum resultado encontrado' : 'Faça uma busca para começar'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  searchButton: {
    marginLeft: 8,
    backgroundColor: '#6366f1',
    borderRadius: 12,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterChip: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#6366f1',
  },
  filterChipText: {
    fontSize: 14,
    color: '#374151',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 10,
  },
  card: {
    flex: 1,
    margin: 5,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  cardImagePlaceholder: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
});

