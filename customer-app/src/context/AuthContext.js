import React, { createContext, useContext, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const authStore = useAuthStore();

  useEffect(() => {
    // Load user data when the app starts
    authStore.loadUser();
  }, []);

  const value = {
    currentUser: authStore.currentUser,
    isLoading: authStore.isLoading,
    token: authStore.token,
    isAuthenticated: authStore.isAuthenticated,
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout,
    updateProfile: authStore.updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
