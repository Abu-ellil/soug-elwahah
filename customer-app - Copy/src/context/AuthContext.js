import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../data/users';
import { saveUser, getUser, removeUser } from '../utils/storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await getUser();
      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone, password) => {
    try {
      // البحث عن المستخدم في البيانات المحاكاة
      const user = MOCK_USERS.find((u) => u.phone === phone && u.password === password);

      if (user) {
        const userData = { ...user };
        delete userData.password; // لا نحفظ كلمة المرور
        setCurrentUser(userData);
        await saveUser(userData);
        return { success: true };
      } else {
        return { success: false, error: 'رقم الموبايل أو كلمة المرور غير صحيحة' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' };
    }
  };

  const register = async (userData) => {
    try {
      // التحقق من وجود المستخدم
      const existingUser = MOCK_USERS.find((u) => u.phone === userData.phone);

      if (existingUser) {
        return { success: false, error: 'رقم الموبايل مسجل بالفعل' };
      }

      // إنشاء مستخدم جديد
      const newUser = {
        id: `user${Date.now()}`,
        name: userData.name,
        phone: userData.phone,
        password: userData.password,
        addresses: [],
      };

      // حفظ المستخدم الجديد (في التطبيق الحقيقي سيتم إرساله للسيرفر)
      MOCK_USERS.push(newUser);

      const userDataToSave = { ...newUser };
      delete userDataToSave.password;
      setCurrentUser(userDataToSave);
      await saveUser(userDataToSave);

      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'حدث خطأ أثناء التسجيل' };
    }
  };

  const logout = async () => {
    try {
      setCurrentUser(null);
      await removeUser();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isAuthenticated = !!currentUser;

  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
