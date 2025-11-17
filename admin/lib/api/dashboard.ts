import { apiClient } from "./client";

// Define interfaces for the data structures

// Example for stats - adjust based on your actual API response
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  activeDrivers: number;
}

// Assuming you have an Order type defined in @/types/order
import { Order } from "@/types/order";

// API functions
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    // This endpoint needs to be created in your backend
    const response = await apiClient.get("/admin/dashboard/stats");
    return response.data;
  },

  getRecentOrders: async (): Promise<Order[]> => {
    // This endpoint needs to be created in your backend
    const response = await apiClient.get("/admin/dashboard/recent-orders");
    return response.data;
  },
};
