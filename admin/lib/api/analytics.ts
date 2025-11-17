import { apiClient } from './client';

interface AnalyticsResponse {
  success: boolean;
  message: string;
 data: {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    totalStores: number;
    totalDrivers: number;
    revenueByDate: {
      date: string;
      revenue: number;
    }[];
    ordersByStatus: {
      status: string;
      count: number;
    }[];
    topStores: {
      storeId: string;
      storeName: string;
      orders: number;
    }[];
  };
}

interface AnalyticsParams {
  dateFrom?: string;
 dateTo?: string;
}

export const analyticsAPI = {
  getDashboardStats: async (params?: AnalyticsParams) => {
    const queryParams = new URLSearchParams();
    if (params?.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) queryParams.append('dateTo', params.dateTo);
    
    const queryString = queryParams.toString();
    const endpoint = `/admin/analytics/dashboard${queryString ? `?${queryString}` : ''}`;
    
    return apiClient.get<AnalyticsResponse>(endpoint);
  },
};