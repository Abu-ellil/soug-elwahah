import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import apiService from '../services/api';

interface Store {
  _id: string;
  name: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  // Add other store fields as needed
}

interface User {
  _id: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  stores?: Store[]; // Array of store objects (populated)
  isActive: boolean;
  verificationStatus?: string;
  createdAt?: string;
  updatedAt?: string;
  // Add any other fields that might come from the API
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string; verificationStatus?: string }>;
  register: (userData: { name: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      // Check if we have a token stored
      const token = await apiService.getToken();
      if (token) {
        // Token exists, try to get user profile from API
        try {
          const profile = await apiService.getProfile();
          if (profile) {
            setCurrentUser(profile);
          }
        } catch (error) {
          // If getting profile fails, token might be invalid, so clear it
          await apiService.clearToken();
          console.error('Error getting user profile:', error);
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    phone: string, // Using phone as identifier for login
    password: string
  ): Promise<{ success: boolean; error?: string; verificationStatus?: string }> => {
    try {
      setIsLoading(true);
      // Use the API service for login
      const response = await apiService.login({ phone, password, role: 'store' });
      
      if (response && response.token) {
        // Store the token in the API service
        await apiService.setToken(response.token);
        
        // Get user profile after successful login
        const profile = await apiService.getProfile();
        if (profile) {
          setCurrentUser(profile);
          await AsyncStorage.setItem('user', JSON.stringify(profile));
        }
        return { success: true };
      } else if (response && response.verificationStatus === 'pending') {
        // If verification status is pending, we still want to set the user info
        // so the app can show the pending approval screen
        const profile = await apiService.getProfile();
        if (profile) {
          setCurrentUser(profile);
          await AsyncStorage.setItem('user', JSON.stringify(profile));
        }
        return { success: true, verificationStatus: 'pending' };
      } else if (response && response.verificationStatus === 'rejected') {
        return { success: false, error: 'الحساب مرفوض من قبل الإدارة' };
      } else {
        return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
      if (error.message) {
        errorMessage = error.message;
      }
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: { name: string; phone: string; password: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      // Use the API service for registration
      const response = await apiService.register({
        name: userData.name,
        phone: userData.phone,
        password: userData.password
      });

      if (response) {
        // Auto-login after successful registration
        const loginResult = await login(userData.phone, userData.password);
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
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setCurrentUser(null);
      await AsyncStorage.removeItem('user');
      // Also clear the API token
      await apiService.clearToken();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAuthenticated = !!currentUser;

  const value = {
    currentUser,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
