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
import api from '../../config/api';

export default function RatingScreen({ route, navigation }) {
  const { rental, type } = route.params; // type: 'professional' ou 'owner'
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  async function handleSubmit() {
    if (rating === 0) {
      Alert.alert('Atenção', 'Selecione uma avaliação de 1 a 5 estrelas');
      return;
    }

    setLoading(true);

    try {
      let response;
      
      if (type === 'professional' && rental.professional_id) {
        response = await api.post(`/professionals/${rental.professional_id}/review`, {
          rental_id: rental.id,
          rating,
          comment,
        });
      } else if (type === 'owner') {
        // Avalia o proprietário (implementar endpoint se necessário)
        response = await api.post(`/rentals/${rental.id}/review-owner`, {
          rating,
          comment,
        });
      }

      if (response.data.success) {
        Alert.alert(
          'Avaliação Enviada!',
          'Obrigado pelo seu feedback.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      Alert.alert('Erro', 'Não foi possível enviar a avaliação');
    } finally {
      setLoading(false);
    }
  }

  function renderStars() {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => setRating(star)}
            style={styles.starButton}
          >
            <Text style={styles.star}>{star <= rating ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  const title =
    type === 'professional'
      ? 'Avaliar Profissional'
      : 'Avaliar Proprietário';

  const subtitle =
    type === 'professional'
      ? 'Como foi o serviço de ajuste?'
      : 'Como foi o aluguel da peça?';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.rentalInfo}>
        <Text style={styles.rentalLabel}>Peça:</Text>
        <Text style={styles.rentalValue}>{rental.clothing_item?.title}</Text>
        
        {type === 'professional' && rental.professional && (
          <>
            <Text style={styles.rentalLabel}>Profissional:</Text>
            <Text style={styles.rentalValue}>{rental.professional.user.name}</Text>
          </>
        )}
        
        {type === 'owner' && (
          <>
            <Text style={styles.rentalLabel}>Proprietário:</Text>
            <Text style={styles.rentalValue}>{rental.owner.name}</Text>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sua Avaliação *</Text>
        {renderStars()}
        <Text style={styles.ratingLabel}>
          {rating === 0 && 'Toque nas estrelas para avaliar'}
          {rating === 1 && '⭐ Péssimo'}
          {rating === 2 && '⭐⭐ Ruim'}
          {rating === 3 && '⭐⭐⭐ Regular'}
          {rating === 4 && '⭐⭐⭐⭐ Bom'}
          {rating === 5 && '⭐⭐⭐⭐⭐ Excelente'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comentário (Opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={comment}
          onChangeText={setComment}
          placeholder="Compartilhe sua experiência..."
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.charCount}>{comment.length}/500</Text>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Enviar Avaliação</Text>
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
  rentalInfo: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  rentalLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  rentalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
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
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  starButton: {
    padding: 8,
  },
  star: {
    fontSize: 40,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
    textAlign: 'center',
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

