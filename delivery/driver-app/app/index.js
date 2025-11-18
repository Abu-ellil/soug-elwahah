import { Redirect } from 'expo-router';
import { View, Text } from 'react-native';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const { isLoggedIn, loading } = useAuthStore();

  console.log('Auth state in index:', { isLoggedIn, loading });

  // If still loading, show loading screen
  if (loading) {
    console.log('Showing loading screen');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

  // If not logged in, redirect to login
 if (!isLoggedIn) {
    console.log('Redirecting to login');
    return <Redirect href="/login" />;
  }

  // If logged in, redirect to home tab
  console.log('Redirecting to home tab');
  return <Redirect href="/(tabs)/home" />;
}