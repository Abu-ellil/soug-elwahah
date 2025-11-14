import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_USERS } from '../data/users';
import { saveUser, getUser, removeUser } from '../utils/storage';

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

  // تحميل بيانات المستخدم عند تحميل المكون - Load user data on component mount
  useEffect(() => {
    loadUser();
  }, []);

  // دالة تحميل المستخدم من التخزين المحلي - Function to load user from local storage
  const loadUser = async () => {
    try {
      const user = await getUser();
      if (user) {
        setCurrentUser(user);
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
      // البحث عن المستخدم في البيانات المحاكاة - Search for user in mock data
      const user = MOCK_USERS.find((u) => u.phone === phone && u.password === password);

      if (user) {
        const userData = { ...user };
        delete userData.password; // لا نحفظ كلمة المرور - Do not save password
        setCurrentUser(userData);
        await saveUser(userData); // حفظ المستخدم في التخزين المحلي - Save user to local storage
        return { success: true };
      } else {
        return { success: false, error: 'رقم الموبايل أو كلمة المرور غير صحيحة' }; // Incorrect phone number or password
      }
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error); // Login error
      return { success: false, error: 'حدث خطأ أثناء تسجيل الدخول' }; // An error occurred during login
    }
  };

  // دالة التسجيل - Register function
  const register = async (userData) => {
    try {
      // التحقق من وجود المستخدم - Check if user already exists
      const existingUser = MOCK_USERS.find((u) => u.phone === userData.phone);

      if (existingUser) {
        return { success: false, error: 'رقم الموبايل مسجل بالفعل' }; // Phone number already registered
      }

      // إنشاء مستخدم جديد - Create new user
      const newUser = {
        id: `user${Date.now()}`,
        name: userData.name,
        phone: userData.phone,
        password: userData.password,
        addresses: [],
      };

      // حفظ المستخدم الجديد (في التطبيق الحقيقي سيتم إرساله للسيرفر) - Save new user (in a real app, it would be sent to the server)
      MOCK_USERS.push(newUser);

      const userDataToSave = { ...newUser };
      delete userDataToSave.password;
      setCurrentUser(userDataToSave);
      await saveUser(userDataToSave); // حفظ المستخدم في التخزين المحلي - Save user to local storage

      return { success: true };
    } catch (error) {
      console.error('خطأ في التسجيل:', error); // Register error
      return { success: false, error: 'حدث خطأ أثناء التسجيل' }; // An error occurred during registration
    }
  };

  // دالة تسجيل الخروج - Logout function
  const logout = async () => {
    try {
      setCurrentUser(null);
      await removeUser(); // إزالة المستخدم من التخزين المحلي - Remove user from local storage
    } catch (error) {
      console.error('خطأ في تسجيل الخروج:', error); // Logout error
    }
  };

  // التحقق مما إذا كان المستخدم مصادقًا - Check if user is authenticated
  const isAuthenticated = !!currentUser;

  // القيم التي يوفرها السياق - Values provided by the context
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
