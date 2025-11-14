import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

import './global.css';
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LocationProvider } from './src/context/LocationProvider';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <LocationProvider>
          <AppNavigator />
          <StatusBar style="auto" />
          <Toast />
        </LocationProvider>
      </CartProvider>
    </AuthProvider>
  );
}
