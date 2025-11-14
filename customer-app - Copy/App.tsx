import { StatusBar } from 'expo-status-bar';

import './global.css';
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LocationProvider } from './src/context/LocationContext';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <LocationProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </LocationProvider>
      </CartProvider>
    </AuthProvider>
  );
}
