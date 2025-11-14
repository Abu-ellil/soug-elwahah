import 'react-native-get-random-values';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

import './global.css';
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LocationProvider } from './src/context/LocationProvider';
import { LocalizationProvider } from './src/context/LocalizationContext';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <LocationProvider>
          <LocalizationProvider>
            <AppNavigator />
            <StatusBar style="auto" />
            <Toast />
          </LocalizationProvider>
        </LocationProvider>
      </CartProvider>
    </AuthProvider>
  );
}
