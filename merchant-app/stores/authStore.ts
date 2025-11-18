import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import apiService from '../services/api';

interface User {
  _id: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  stores?: string[]; // Array of store IDs
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
      const response = await apiService.login({ phone, password, role: 'store' });

      if (response && response.token) {
        await apiService.setToken(response.token);
        const profile = await apiService.getProfile();
        if (profile) {
          set({ currentUser: profile, isAuthenticated: true });
          await AsyncStorage.setItem('user', JSON.stringify(profile));
        }
        return { success: true };
      } else if (response && response.verificationStatus === 'pending') {
        const profile = await apiService.getProfile();
        if (profile) {
          set({ currentUser: profile, isAuthenticated: true });
          await AsyncStorage.setItem('user', JSON.stringify(profile));
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
      const response = await apiService.register({
        name: userData.name,
        phone: userData.phone,
        password: userData.password
      });

      if (response) {
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
      set({ currentUser: null, isAuthenticated: false });
      await AsyncStorage.removeItem('user');
      await apiService.clearToken();
    } catch (error) {
      console.error('Logout error:', error);
    }
  },
}));