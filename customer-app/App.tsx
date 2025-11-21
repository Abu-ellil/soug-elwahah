import './global.css';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-toast-message';

import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { LocationProvider } from './src/context/LocationProvider';
import { AnalyticsProvider } from './src/context/AnalyticsContext';
import { LocalizationProvider } from './src/context/LocalizationContext';
import AppInitializer from './src/components/AppInitializer';
import { useOfflineStore } from './src/stores/offlineStore';

export default function App() {
  const initializeOffline = useOfflineStore((state) => state.initialize);

  useEffect(() => {
    // Initialize offline store and network monitoring
    initializeOffline();
  }, [initializeOffline]);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <LocalizationProvider>
          <AuthProvider>
            <LocationProvider>
              <AnalyticsProvider>
                <CartProvider>
                  <AppInitializer>
                    <AppNavigator />
                    <StatusBar style="auto" />
                  </AppInitializer>
                  </CartProvider>
                </AnalyticsProvider>
              </LocationProvider>
            </AuthProvider>
          </LocalizationProvider>
        <Toast />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
