import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

interface User {
  id: string;
  name: string;
  phone: string;
  password: string;
  storeName: string;
  storeDescription: string;
  storeImage?: string;
  role: 'merchant';
  approved: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: any) => Promise<{ success: boolean; error?: string }>;
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
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    phone: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate checking against stored merchant applications
      const merchantsData = await AsyncStorage.getItem('merchants');
      const merchants: User[] = merchantsData ? JSON.parse(merchantsData) : [];

      const user = merchants.find((u) => u.phone === phone);

      if (user) {
        // Verify password
        if (user.password === password) {
          if (user.approved) {
            const userData = { ...user };
            delete (userData as any).password; // Don't store password in current user
            setCurrentUser(userData);
            await AsyncStorage.setItem('user', JSON.stringify(userData));
            return { success: true };
          } else {
            return { success: false, error: 'حسابك قيد المراجعة، انتظر موافقة الإدارة' };
          }
        } else {
          return { success: false, error: 'رقم الموبايل أو كلمة المرور غير صحيحة' };
        }
      } else {
        return { success: false, error: 'رقم الموبايل أو كلمة المرور غير صحيحة' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  };

  const register = async (userData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      // In a real app, this would be an API call
      // For now, we'll store the merchant application in AsyncStorage
      const merchantsData = await AsyncStorage.getItem('merchants');
      const merchants: User[] = merchantsData ? JSON.parse(merchantsData) : [];

      const existingUser = merchants.find((u) => u.phone === userData.phone);
      if (existingUser) {
        return { success: false, error: 'رقم الموبايل مسجل بالفعل' };
      }

      const newMerchant: User = {
        id: `merchant${Date.now()}`,
        name: userData.name,
        phone: userData.phone,
        password: userData.password,
        storeName: userData.storeName,
        storeDescription: userData.storeDescription,
        storeImage: userData.storeImage,
        role: 'merchant',
        approved: false, // Default to not approved
      };

      merchants.push(newMerchant);
      await AsyncStorage.setItem('merchants', JSON.stringify(merchants));

      Toast.show({
        type: 'success',
        text1: 'تم',
        text2: 'تم تقديم طلبك بنجاح، انتظر موافقة الإدارة',
      });

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'حدث خطأ أثناء التسجيل' };
    }
  };

  const logout = async () => {
    try {
      setCurrentUser(null);
      await AsyncStorage.removeItem('user');
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
