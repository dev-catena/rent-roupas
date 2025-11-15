import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { ActivityIndicator, View } from 'react-native';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { signed, loading, user } = useAuth();

  console.log('RootNavigator - signed:', signed, 'loading:', loading, 'user:', user?.name);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return signed ? <AppNavigator /> : <AuthNavigator />;
}

