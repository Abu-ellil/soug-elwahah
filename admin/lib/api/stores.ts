import { apiClient } from './client';
import { Store } from '../../types/store';

interface StoresResponse {
  success: boolean;
  message: string;
  data: {
    stores: Store[];
    total: number;
    page: number;
    limit: number;
  };
}

interface StoreResponse {
  success: boolean;
  message: string;
  data: {
    store: Store;
  };
}

interface UpdateStorePayload {
  status?: 'open' | 'closed' | 'suspended';
  verificationStatus?: 'pending' | 'approved' | 'rejected';
}

export const storesAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; verificationStatus?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.verificationStatus) queryParams.append('verificationStatus', params.verificationStatus);
    
    const queryString = queryParams.toString();
    const endpoint = `/admin/stores${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<StoresResponse>(endpoint);
  },

  getPending: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/admin/stores/pending${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<StoresResponse>(endpoint);
  },

  getById: async (id: string) => {
    return apiClient.get<StoreResponse>(`/admin/stores/${id}`);
  },

  update: async (id: string, payload: UpdateStorePayload) => {
    return apiClient.patch<StoreResponse>(`/admin/stores/${id}`, payload);
  },

  approve: async (id: string) => {
    return apiClient.patch<StoreResponse>(`/admin/stores/${id}/approve`);
  },

  reject: async (id: string, reason: string) => {
    return apiClient.patch<StoreResponse>(`/admin/stores/${id}/reject`, { reason });
  },

  delete: async (id: string) => {
    return apiClient.delete<StoreResponse>(`/admin/stores/${id}`);
  },
};