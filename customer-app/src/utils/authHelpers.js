import { useAuth } from '../context/AuthContext';
import { Alert } from 'react-native';

/**
 * Hook to get authentication check function
 * @returns {Function} - Function to check authentication
 */
export const useAuthCheck = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const checkAuth = (navigation, actionName = 'تنفيذ هذه العملية') => {
    if (isLoading) {
      Alert.alert('انتظر', 'جاري تحميل معلومات الحساب...');
      return false;
    }

    if (!isAuthenticated) {
      Alert.alert('تسجيل الدخول مطلوب', `يجب تسجيل الدخول أولاً ل${actionName}`, [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'تسجيل الدخول',
          onPress: () => {
            if (navigation) {
              // Check if we're navigating to Auth stack
              const currentRoute = navigation.getState ? navigation.getState() : null;
              if (currentRoute && currentRoute.routes) {
                const currentScreen = currentRoute.routes[currentRoute.index]?.name;
                if (currentScreen !== 'Auth') {
                  navigation.navigate('Auth', { screen: 'Login' });
                }
              } else {
                // Fallback navigation
                navigation.navigate('Auth', { screen: 'Login' });
              }
            }
          },
        },
      ]);
      return false;
    }

    return true;
  };

  return { checkAuth, isAuthenticated, isLoading };
};
