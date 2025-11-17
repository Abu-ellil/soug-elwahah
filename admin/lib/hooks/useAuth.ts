import { useState, useEffect } from 'react';
import { authAPI } from '../api/auth';
import { Admin } from '../../types';

export function useAuth() {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
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

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    setAdmin(response.data.admin);
    return response;
 };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      // Clear any local state
      setAdmin(null);
      // Redirect to login page
      window.location.href = '/login';
    }
  };

  const hasPermission = (permission: string) => {
    if (!admin) return false;
    if (admin.role === 'super_admin') return true;
    return admin.permissions.includes(permission);
  };

  return { admin, isLoading, login, logout, hasPermission };
}