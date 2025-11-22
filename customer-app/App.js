import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { I18nManager } from 'react-native';
import './global.css';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LocationProvider } from './src/context/LocationContext';
import AppNavigator from './src/navigation/AppNavigator';

// Force RTL
I18nManager.forceRTL(true);

export default function App() {
  return (
    <AuthProvider>
      <LocationProvider>
        <CartProvider>
          <AppNavigator />
          <StatusBar style="dark" backgroundColor="white" />
        </CartProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
