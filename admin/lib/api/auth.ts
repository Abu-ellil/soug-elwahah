import { apiClient } from './client';
import { Admin } from '../../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    admin: Admin;
    token: string;
  };
}

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    admin: Admin;
  };
}

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    return apiClient.post('/admin/auth/login', credentials);
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/admin/auth/logout');
  },

  me: async (): Promise<AuthResponse> => {
    return apiClient.get('/admin/auth/me');
 },
};