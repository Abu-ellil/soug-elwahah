import { apiClient } from './client';
import { Order } from '../../types/order';

interface OrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  };
}

interface OrderResponse {
  success: boolean;
  message: string;
  data: {
    order: Order;
  };
}

interface UpdateOrderPayload {
  status?: 'pending' | 'accepted' | 'confirmed' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'refunded';
}

export const ordersAPI = {
  getAll: async (params?: { page?: number; limit?: number; search?: string; status?: string; dateFrom?: string; dateTo?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
    
    const queryString = queryParams.toString();
    const endpoint = `/admin/orders${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<OrdersResponse>(endpoint);
  },

  getById: async (id: string) => {
    return apiClient.get<OrderResponse>(`/admin/orders/${id}`);
  },

  update: async (id: string, payload: UpdateOrderPayload) => {
    return apiClient.patch<OrderResponse>(`/admin/orders/${id}`, payload);
  },

  cancel: async (id: string, reason?: string) => {
    return apiClient.patch<OrderResponse>(`/admin/orders/${id}/cancel`, { reason });
  },

  delete: async (id: string) => {
    return apiClient.delete<OrderResponse>(`/admin/orders/${id}`);
  },
};