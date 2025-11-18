import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useAuthStore } from '../src/store/authStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
 const { isLoggedIn, loading, restoreAuthState } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

 useEffect(() => {
    // Initialize the auth state when the component mounts
    const initializeAuth = async () => {
      await restoreAuthState();
      setIsInitialized(true);
    };
    
    initializeAuth();
  }, []);

  // Show loading while initializing or restoring auth state
  if (!isInitialized || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <Stack>
      {isLoggedIn ? (
        <>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen name="register" options={{ headerShown: false }} />
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <RootLayoutNav />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
