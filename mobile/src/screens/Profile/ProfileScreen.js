import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext'
import { colors } from '../../constants/colors';
import SafeIcon from '../../components/SafeIcon';

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

  // Verifica se o usuário é profissional
  const isProfessional = user?.user_type === 'professional' || user?.professional;

  const menuItems = [
    {
      icon: 'resize',
      title: 'Minhas Medidas',
      subtitle: user?.measurements ? 'Medidas cadastradas' : 'Cadastre suas medidas',
      onPress: () => navigation.navigate('Measurements'),
    },
    {
      icon: 'cube',
      title: 'Meus Aluguéis',
      subtitle: 'Aluguéis ativos e histórico',
      onPress: () => navigation.navigate('Rentals'),
    },
    {
      icon: 'chatbubbles',
      title: 'Conversas',
      subtitle: 'Negociações e mensagens',
      onPress: () => navigation.navigate('Chats'),
    },
    {
      icon: 'construct',
      title: 'Profissionais',
      subtitle: 'Encontre costureiras e alfaiates',
      onPress: () => navigation.navigate('ProfessionalsList'),
    },
    // Mostra "Editar" se já for profissional, "Cadastrar" se não for
    isProfessional ? {
      icon: 'create',
      title: 'Editar Dados Profissionais',
      subtitle: 'Atualize suas informações profissionais',
      onPress: () => navigation.navigate('EditProfessional'),
    } : {
      icon: 'add-circle',
      title: 'Cadastrar como Profissional',
      subtitle: 'Ofereça serviços de costura',
      onPress: () => navigation.navigate('RegisterProfessional'),
    },
    {
      icon: 'settings',
      title: 'Configurações',
      subtitle: 'Preferências do aplicativo',
      onPress: () => Alert.alert('Em breve', 'Funcionalidade em desenvolvimento'),
    },
    {
      icon: 'information-circle',
      title: 'Sobre',
      subtitle: 'Informações do app',
      onPress: () => Alert.alert('Vestme', 'Versão 1.0.0'),
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
          <View style={styles.badgeContent}>
            {user?.user_type === 'renter' ? (
              <>
                <SafeIcon name="person" size={16} color={colors.white} />
                <Text style={styles.badgeText}> Locatário</Text>
              </>
            ) : user?.user_type === 'owner' ? (
              <>
                <SafeIcon name="home" size={16} color={colors.white} />
                <Text style={styles.badgeText}> Proprietário</Text>
              </>
            ) : user?.user_type === 'professional' ? (
              <>
                <SafeIcon name="construct" size={16} color={colors.white} />
                <Text style={styles.badgeText}> Profissional</Text>
              </>
            ) : user?.user_type === 'both' ? (
              <>
                <SafeIcon name="swap-horizontal" size={16} color={colors.white} />
                <Text style={styles.badgeText}> Ambos</Text>
              </>
            ) : (
              <>
                <SafeIcon name="person" size={16} color={colors.white} />
                <Text style={styles.badgeText}> Usuário</Text>
              </>
            )}
          </View>
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
              <SafeIcon name={item.icon} size={24} color={colors.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <SafeIcon name="chevron-forward" size={20} color={colors.textLight} />
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
    backgroundColor: colors.white,
  },
  header: {
    alignItems: 'center',
    padding: 30,
    backgroundColor: colors.primary,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: colors.accent,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  menu: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: colors.gray,
  },
  logoutButton: {
    backgroundColor: colors.errorLight,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 20,
    marginTop: 0,
  },
  logoutButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
});

