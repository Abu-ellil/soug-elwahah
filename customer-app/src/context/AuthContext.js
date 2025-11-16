import React, { createContext, useContext, useState, useEffect } from 'react';
import { API } from '../services/api';
import { saveUser, getUser, removeUser, saveToken, getToken, removeToken } from '../utils/storage';

// إنشاء سياق المصادقة - Create Auth Context
const AuthContext = createContext();

// خطاف مخصص لاستخدام سياق المصادقة - Custom hook for using Auth Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('يجب استخدام useAuth داخل AuthProvider'); // useAuth must be used within an AuthProvider
  }
  return context;
};

// مزود سياق المصادقة - Auth Context Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // حالة المستخدم الحالي - Current user state
  const [isLoading, setIsLoading] = useState(true); // حالة التحميل - Loading state
  const [token, setToken] = useState(null); // حالة التوكن - Token state

  // تحميل بيانات المستخدم عند تحميل المكون - Load user data on component mount
  useEffect(() => {
    loadUser();
  }, []);

  // دالة تحميل المستخدم من التخزين المحلي - Function to load user from local storage
  const loadUser = async () => {
    try {
      const user = await getUser();
      const token = await getToken();

      if (user && token) {
        setCurrentUser(user);
        setToken(token);
      }
    } catch (error) {
      console.error('خطأ في تحميل المستخدم:', error); // Error loading user
    } finally {
      setIsLoading(false);
    }
  };

  // دالة تسجيل الدخول - Login function
  const login = async (phone, password) => {
    try {
      const response = await API.authAPI.login({ phone, password });

      if (response.success) {
        const {
          data: { user },
          token,
        } = response;

        // Save token and user data
        setToken(token);
        await saveToken(token);

        // Remove password from user data before saving
        const userData = { ...user };
        delete userData.password;
        setCurrentUser(userData);
        await saveUser(userData); // حفظ المستخدم في التخزين المحلي - Save user to local storage

        return { success: true, user: userData };
      } else {
        return {
          success: false,
          error: response.message || 'رقم الموبايل أو كلمة المرور غير صحيحة',
        }; // Incorrect phone number or password
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error); // Login error
      return { success: false, error: error.message || 'حدث خطأ أثناء تسجيل الدخول' }; // An error occurred during login
    }
  };

  // دالة التسجيل - Register function
  const register = async (userData) => {
    try {
      const response = await API.authAPI.registerCustomer(userData);

      if (response.success) {
        const {
          data: { user },
          token,
        } = response;

        // Save token and user data
        setToken(token);
        await saveToken(token);

        // Remove password from user data before saving
        const userDataToSave = { ...user };
        delete userDataToSave.password;
        setCurrentUser(userDataToSave);
        await saveUser(userDataToSave); // حفظ المستخدم في التخزين المحلي - Save user to local storage

        return { success: true, user: userDataToSave };
      } else {
        return { success: false, error: response.message || 'حدث خطأ أثناء التسجيل' }; // An error occurred during registration
      }
    } catch (error) {
      console.error('خطأ في التسجيل:', error); // Register error
      return { success: false, error: error.message || 'حدث خطأ أثناء التسجيل' }; // An error occurred during registration
    }
  };

  // دالة تسجيل الخروج - Logout function
  const logout = async () => {
    try {
      setCurrentUser(null);
      setToken(null);
      await removeUser(); // إزالة المستخدم من التخزين المحلي - Remove user from local storage
      await removeToken(); // Remove token from storage
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error); // Logout error
    }
  };

  // دالة تحديث الملف الشخصي - Update profile function
  const updateProfile = async (profileData) => {
    if (!token) {
      return { success: false, error: 'غير مصادق عليه' }; // Not authenticated
    }

    try {
      const response = await API.profileAPI.updateProfile(profileData, token);

      if (response.success) {
        const updatedUser = { ...response.data.user };
        delete updatedUser.password;
        setCurrentUser(updatedUser);
        await saveUser(updatedUser);
        return { success: true, user: updatedUser };
      } else {
        return { success: false, error: response.message };
      }
    } catch (error) {
      console.error('خطأ في تحديث الملف الشخصي:', error);
      return { success: false, error: error.message };
    }
  };

  // التحقق مما إذا كان المستخدم مصادقًا - Check if user is authenticated
  const isAuthenticated = !!currentUser && !!token;

  // القيم التي يوفرها السياق - Values provided by the context
  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
