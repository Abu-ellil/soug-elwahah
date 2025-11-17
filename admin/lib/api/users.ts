import { apiClient } from './client';
import { User } from '../../types/user';

interface UsersResponse {
  success: boolean;
  message: string;
 data: {
    users: User[];
    total: number;
    page: number;
    limit: number;
  };
}

interface UserResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
  };
}

interface UpdateUserPayload {
  status?: 'active' | 'inactive';
}

export const usersAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = `/admin/users${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<UsersResponse>(endpoint);
  },

  getById: async (id: string) => {
    return apiClient.get<UserResponse>(`/admin/users/${id}`);
  },

  update: async (id: string, payload: UpdateUserPayload) => {
    return apiClient.patch<UserResponse>(`/admin/users/${id}`, payload);
  },

  delete: async (id: string) => {
    return apiClient.delete<UserResponse>(`/admin/users/${id}`);
  },
};