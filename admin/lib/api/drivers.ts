import { apiClient } from './client';
import { Driver } from '../../types/driver';

interface DriversResponse {
  success: boolean;
  message: string;
 data: {
    drivers: Driver[];
    total: number;
    page: number;
    limit: number;
  };
}

interface DriverResponse {
  success: boolean;
  message: string;
  data: {
    driver: Driver;
  };
}

interface UpdateDriverPayload {
  status?: 'available' | 'busy' | 'offline';
  verificationStatus?: 'pending' | 'approved' | 'rejected';
}

export const driversAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; verificationStatus?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.verificationStatus) queryParams.append('verificationStatus', params.verificationStatus);
    
    const queryString = queryParams.toString();
    const endpoint = `/admin/drivers${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<DriversResponse>(endpoint);
  },

  getPending: async (params?: { page?: number; limit?: number }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/admin/drivers/pending${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<DriversResponse>(endpoint);
  },

  getById: async (id: string) => {
    return apiClient.get<DriverResponse>(`/admin/drivers/${id}`);
  },

  update: async (id: string, payload: UpdateDriverPayload) => {
    return apiClient.patch<DriverResponse>(`/admin/drivers/${id}`, payload);
  },

  approve: async (id: string) => {
    return apiClient.patch<DriverResponse>(`/admin/drivers/${id}/approve`);
  },

  reject: async (id: string, reason: string) => {
    return apiClient.patch<DriverResponse>(`/admin/drivers/${id}/reject`, { reason });
  },

  delete: async (id: string) => {
    return apiClient.delete<DriverResponse>(`/admin/drivers/${id}`);
  },
};