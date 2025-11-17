import { useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { Admin } from '../../types';

export function useAuth() { 
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth check when component mounts
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.me();
      setAdmin(response.data.admin);
    } catch (error) {
      console.error('Auth check failed:', error);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (identifier: string, password: string) => {
    // Determine if the identifier is an email or phone
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    const credentials = isEmail ? { email: identifier, password } : { phone: identifier, password };
    const response = await authAPI.login(credentials);
    
    // The token should already be stored via authAPI.login, but let's ensure admin state is set
    setAdmin(response.data.admin);
    setIsLoading(false); // Ensure loading state is set to false after login
    
    return response;
  };

  const refreshAuth = async () => {
    setIsLoading(true);
    try {
      const response = await authAPI.me();
      setAdmin(response.data.admin);
    } catch (error) {
      console.error('Auth refresh failed:', error);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear any local state
      setAdmin(null);
      // Clear the token from localStorage
      localStorage.removeItem('admin_token');
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  const hasPermission = (permission: string) => {
    if (!admin) return false;
    if (admin.role === 'super_admin') return true;
    return admin.permissions.includes(permission);
  };

  return { admin, isLoading, login, logout, hasPermission, refreshAuth };
}
