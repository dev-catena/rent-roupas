import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useAuth();

  function handleSignOut() {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', onPress: signOut, style: 'destructive' },
      ]
    );
  }

  const menuItems = [
    {
      icon: '📏',
      title: 'Minhas Medidas',
      subtitle: user.measurements ? 'Medidas cadastradas' : 'Cadastre suas medidas',
      onPress: () => navigation.navigate('Measurements'),
    },
    {
      icon: '📦',
      title: 'Meus Aluguéis',
      subtitle: 'Aluguéis ativos e histórico',
      onPress: () => navigation.navigate('Rentals'),
    },
    {
      icon: '💬',
      title: 'Conversas',
      subtitle: 'Negociações e mensagens',
      onPress: () => navigation.navigate('Chats'),
    },
    {
      icon: '✂️',
      title: 'Profissionais',
      subtitle: 'Encontre costureiras e alfaiates',
      onPress: () => navigation.navigate('ProfessionalsList'),
    },
    {
      icon: '🧵',
      title: 'Cadastrar como Profissional',
      subtitle: 'Ofereça serviços de costura',
      onPress: () => navigation.navigate('RegisterProfessional'),
    },
    {
      icon: '⚙️',
      title: 'Configurações',
      subtitle: 'Preferências do aplicativo',
      onPress: () => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento'),
    },
    {
      icon: 'ℹ️',
      title: 'Sobre',
      subtitle: 'Informações do app',
      onPress: () => Alert.alert('Rent Roupa', 'Versão 1.0.0'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name || 'Usuário'}</Text>
        <Text style={styles.email}>{user?.email || ''}</Text>
        
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {user?.user_type === 'renter' ? '👤 Locatário' : 
             user?.user_type === 'owner' ? '🏠 Proprietário' : 
             user?.user_type === 'professional' ? '✂️ Profissional' : 
             user?.user_type === 'both' ? '🔄 Ambos' : '👤 Usuário'}
          </Text>
        </View>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={styles.menuIcon}>
              <Text style={styles.menuIconText}>{item.icon}</Text>
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutButtonText}>Sair</Text>
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
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#6366f1',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#e0e7ff',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  menu: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuIconText: {
    fontSize: 20,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuArrow: {
    fontSize: 24,
    color: '#9ca3af',
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 20,
    marginTop: 0,
  },
  logoutButtonText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '600',
  },
});

