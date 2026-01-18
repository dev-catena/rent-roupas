import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../constants/colors';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { signed, loading, user } = useAuth();

  console.log('RootNavigator - signed:', signed, 'loading:', loading, 'user:', user?.name);

  useEffect(() => {
    // Esconder splash screen quando o app terminar de carregar
    if (!loading) {
      SplashScreen.hideAsync();
    }
  }, [loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return signed ? <AppNavigator /> : <AuthNavigator />;
}
