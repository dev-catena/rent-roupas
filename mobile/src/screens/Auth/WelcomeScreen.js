import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';
import Constants from 'expo-constants';
import { colors } from '../../constants/colors';

// Importar logos - com fallback caso não existam
let logoFull;
let logoIcon;
try {
  logoFull = require('../../../assets/logo-vestme-full.png');
  logoIcon = require('../../../assets/logo-vestme-icon.png');
} catch (e) {
  // Logos ainda não adicionados - será usado fallback
  logoFull = null;
  logoIcon = null;
}

export default function WelcomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          {logoFull ? (
            <Image 
              source={logoFull} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          ) : (
            <>
              <Text style={styles.logoEmoji}>👗</Text>
              <Text style={styles.title}>VestMe</Text>
            </>
          )}
          <Text style={styles.subtitle}>
            Alugue roupas para eventos e festas com facilidade
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.primaryButtonText}>Criar Conta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('Login')}
          >
            <Text style={styles.secondaryButtonText}>Já tenho uma conta</Text>
          </TouchableOpacity>

          <Text style={styles.versionText}>
            {Constants.expoConfig?.version || '1.0.0'}
            {__DEV__ ? ' (dev)' : ''}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 20,
  },
  logoImage: {
    width: 280,
    height: 100,
    marginBottom: 20,
    borderRadius: 12,
  },
  logoEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    gap: 15,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: colors.lightGray,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  versionText: {
    fontSize: 12,
    color: colors.textLight,
    textAlign: 'center',
    marginTop: 20,
  },
});
