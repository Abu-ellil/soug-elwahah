import { apiClient } from './client';
import { Village } from '../../types/driver';

interface VillagesResponse {
  success: boolean;
  message: string;
  data: {
    villages: Village[];
    total: number;
    page: number;
    limit: number;
  };
}

interface VillageResponse {
  success: boolean;
  message: string;
  data: {
    village: Village;
  };
}

interface CreateVillagePayload {
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface UpdateVillagePayload {
  name?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export const villagesAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const endpoint = `/admin/villages${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<VillagesResponse>(endpoint);
  },

  getById: async (id: string) => {
    return apiClient.get<VillageResponse>(`/admin/villages/${id}`);
  },

  create: async (payload: CreateVillagePayload) => {
    return apiClient.post<VillageResponse>('/admin/villages', payload);
  },

  update: async (id: string, payload: UpdateVillagePayload) => {
    return apiClient.patch<VillageResponse>(`/admin/villages/${id}`, payload);
  },

  delete: async (id: string) => {
    return apiClient.delete<VillageResponse>(`/admin/villages/${id}`);
  },
};