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

interface StoreOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  registeredAt: string;
  isActive: boolean;
  storeId?: {
    _id: string;
    name: string;
  };
  verificationStatus: 'pending' | 'approved' | 'rejected';
}

interface StoreOwnersResponse {
  success: boolean;
  message: string;
  data: {
    storeOwners: StoreOwner[];
    total: number;
    page: number;
    limit: number;
  };
}

export const usersAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; role?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.role) queryParams.append('role', params.role);
    
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

  updateStatus: async (id: string, role: string, isActive: boolean) => {
    return apiClient.patch<UserResponse>(`/admin/users/${id}/status`, { isActive, role });
  },

  getAllStoreOwners: async (params?: { page?: number; limit?: number; search?: string; status?: string; verificationStatus?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.verificationStatus) queryParams.append('verificationStatus', params.verificationStatus);
    
    const queryString = queryParams.toString();
    const endpoint = `/admin/store-owners${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<StoreOwnersResponse>(endpoint);
  },

  delete: async (id: string) => {
    return apiClient.delete<UserResponse>(`/admin/users/${id}`);
  },
};
