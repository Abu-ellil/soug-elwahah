import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import apiService from '../services/api';

interface Store {
  _id: string;
  name: string;
  verificationStatus: string; // 'pending' | 'approved' | 'rejected'
  isActive: boolean;
  // Add other store properties as needed
}

interface User {
  _id: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  stores?: Store[]; // Array of store objects
  isActive: boolean;
  verificationStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}
 
interface AuthState {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string; verificationStatus?: string }>;
  register: (userData: { name: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  requestPasswordReset: (phone: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (data: { phone: string; resetCode: string; newPassword: string }) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: null,
  isLoading: true,
  isAuthenticated: false,

  loadUser: async () => {
    try {
      const token = await apiService.getToken();
      if (token) {
        try {
          // First validate the session
          const isSessionValid = await apiService.validateAndRefreshIfNeeded();
          
          if (!isSessionValid) {
            console.log('Session validation failed during loadUser');
            set({ currentUser: null, isAuthenticated: false });
            return;
          }

          const profile = await apiService.getProfile();
          if (profile && profile.success && profile.data && profile.data.user) {
            console.log('Setting user from profile data:', profile.data.user);
            // Debug: Check stores data
            if (profile.data.user.stores) {
              console.log('User stores:', profile.data.user.stores);
              profile.data.user.stores.forEach((store: any, index: number) => {
                console.log(`Store ${index + 1}: ${store.name} - Status: ${store.verificationStatus} - Active: ${store.isActive}`);
              });
            }
            set({ currentUser: profile.data.user, isAuthenticated: true });
            await AsyncStorage.setItem('user', JSON.stringify(profile.data.user));
          } else if (profile && profile.data) {
            console.log('Setting user from direct data:', profile.data);
            // Handle case where response.data is the user directly
            set({ currentUser: profile.data, isAuthenticated: true });
            await AsyncStorage.setItem('user', JSON.stringify(profile.data));
          }
        } catch (error: any) {
          // Handle session expiration specifically
          if (error.message?.includes('انتهت صلاحية الجلسة') || 
              error.message?.includes('Session expired') ||
              error.message?.includes('Please login again')) {
            console.log('Session expired during loadUser, clearing auth state');
            await apiService.clearToken();
            set({ currentUser: null, isAuthenticated: false });
            await AsyncStorage.removeItem('user');
          } else {
            console.error('Error getting user profile:', error);
            // For other errors, also clear auth state to be safe
            await apiService.clearToken();
            set({ currentUser: null, isAuthenticated: false });
          }
        }
      } else {
        console.log('No token found, user not authenticated');
        set({ currentUser: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      set({ currentUser: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (phone: string, password: string) => {
    try {
      set({ isLoading: true });
      
      console.log('Attempting login for:', phone);
      
      // Use the API service for login
      const response = await apiService.login({ phone, password, role: 'store' });
      
      console.log('Login response:', response);

      // Check for successful login response
      if (response && response.success && response.data && response.data.token && response.data.user) {
        // Store the token in the API service
        await apiService.setToken(response.data.token);

        // Set user data directly from login response
        const userData = response.data.user;
        console.log('Setting user from login:', userData);
        set({ currentUser: userData, isAuthenticated: true });
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true };
      } else if (response && !response.success) {
        // Handle API error responses
        const errorMessage = response.error || response.message || 'خطأ في تسجيل الدخول';
        return { success: false, error: errorMessage };
      } else {
        return { success: false, error: 'رقم الهاتف أو كلمة المرور غير صحيحة' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
      if (error.message) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (userData: { name: string; phone: string; password: string }) => {
    try {
      set({ isLoading: true });
      
      console.log('Attempting registration for:', userData.phone);
      
      // Use the API service for registration
      const response = await apiService.register({
        name: userData.name,
        phone: userData.phone,
        password: userData.password
      });

      console.log('Registration response:', response);

      if (response && response.success) {
        // Auto-login after successful registration
        const loginResult = await get().login(userData.phone, userData.password);
        if (loginResult.success) {
          Toast.show({
            type: 'success',
            text1: 'تم',
            text2: 'تم إنشاء حسابك بنجاح',
          });
          return { success: true };
        } else {
          return { success: false, error: loginResult.error || 'حدث خطأ أثناء تسجيل الدخول' };
        }
      } else {
        const errorMessage = response?.error || response?.message || 'حدث خطأ أثناء التسجيل';
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'حدث خطأ أثناء التسجيل';
      if (error.message) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await apiService.logout();
      set({ currentUser: null, isAuthenticated: false });
      await AsyncStorage.removeItem('user');
      // Also clear the API token
      await apiService.clearToken();
      // Navigation is handled in the component using the store
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  requestPasswordReset: async (phone: string) => {
    try {
      const response = await apiService.requestPasswordReset(phone);
      return { success: true };
    } catch (error: any) {
      console.error('Request password reset error:', error);
      return { success: false, error: error.message || 'حدث خطأ أثناء طلب إعادة تعيين كلمة المرور' };
    }
  },

  resetPassword: async (data: { phone: string; resetCode: string; newPassword: string }) => {
    try {
      const response = await apiService.resetPassword(data);
      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message || 'حدث خطأ أثناء إعادة تعيين كلمة المرور' };
    }
  },
}));
