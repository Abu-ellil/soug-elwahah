import { apiClient } from "./client";

// Define interfaces for the data structures

// Dashboard stats interface matching the actual API response
export interface DashboardStats {
 totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
 totalStores: number;
  totalDrivers: number;
  revenueByDate: Array<{ date: string; revenue: number }>;
 ordersByStatus: Array<{ status: string; count: number }>;
  topStores: Array<{ storeId: string; storeName: string; orders: number }>;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface DashboardOrdersResponse {
  success: boolean;
  message: string;
  data: {
    orders: Order[];
    total: number;
    page: number;
    limit: number;
  };
}

// Assuming you have an Order type defined in @/types/order
import { Order } from "@/types/order";

// API functions
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    // This endpoint is implemented in the backend
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      "/admin/analytics/dashboard"
    );
    return response.data;
  },

  getRecentOrders: async (): Promise<Order[]> => {
    // Using the existing orders endpoint with query parameters for recent orders
    const response = await apiClient.get<DashboardOrdersResponse>(
      "/admin/orders?limit=5&sort=-createdAt"
    );
    return response.data.data.orders;
  },
};
