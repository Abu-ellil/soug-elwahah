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
          const profile = await apiService.getProfile();
          if (profile) {
            set({ currentUser: profile, isAuthenticated: true });
          }
        } catch (error) {
          await apiService.clearToken();
          console.error('Error getting user profile:', error);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (phone: string, password: string) => {
    try {
      set({ isLoading: true });
      // Use the API service for login
      const response = await apiService.login({ phone, password, role: 'store' });

      if (response && response.data && response.data.token) {
        // Store the token in the API service
        await apiService.setToken(response.data.token);

        // Get user profile after successful login
        const profile = await apiService.getProfile();
        if (profile && profile.data && profile.data.user) {
          set({ currentUser: profile.data.user, isAuthenticated: true });
          await AsyncStorage.setItem('user', JSON.stringify(profile.data.user));
        }
        return { success: true };
      } else if (response && response.verificationStatus === 'pending') {
        // If verification status is pending, we still want to set the user info
        // so the app can show the pending approval screen
        const profile = await apiService.getProfile();
        if (profile && profile.data && profile.data.user) {
          set({ currentUser: profile.data.user, isAuthenticated: true });
          await AsyncStorage.setItem('user', JSON.stringify(profile.data.user));
        }
        return { success: true, verificationStatus: 'pending' };
      } else if (response && response.verificationStatus === 'rejected') {
        return { success: false, error: 'الحساب مرفوض من قبل الإدارة' };
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
      // Use the API service for registration
      const response = await apiService.register({
        name: userData.name,
        phone: userData.phone,
        password: userData.password
      });

      if (response) {
        // Auto-login after successful registration
        const loginResult = await get().login(userData.phone, userData.password);
        if (loginResult.success) {
          Toast.show({
            type: 'success',
            text1: 'تم',
            text2: 'تم إنشاء حسابك بنجاح، يمكنك الآن التقدم بطلب إنشاء متجر',
          });
          return { success: true };
        } else {
          return { success: false, error: loginResult.error || 'حدث خطأ أثناء تسجيل الدخول' };
        }
      } else {
        return { success: false, error: 'حدث خطأ أثناء التسجيل' };
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
