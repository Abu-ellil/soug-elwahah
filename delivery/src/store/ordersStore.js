import { create } from 'zustand';
import api from '../config/api';
import webSocketService from '../services/websocket';

export const useOrdersStore = create((set, get) => ({
  // Initial state
  availableOrders: [],
  activeOrder: null,
  orderHistory: [],
  loading: false,

  // Get available orders
  getAvailableOrders: async (driverLocation = { lat: 31.1110, lng: 30.9390 }) => {
    set({ loading: true });
    try {
      // Make real API call to get available orders
      const response = await api.get(`/driver/orders/available?lat=${driverLocation.lat}&lng=${driverLocation.lng}&radius=10`);

      if (response.data.success) {
        const availableOrders = response.data.data.orders;
        
        set({ availableOrders, loading: false });

        return { success: true, orders: availableOrders };
      } else {
        set({ loading: false });
        return { success: false, error: response.data.message || 'Get available orders failed' };
      }
    } catch (error) {
      console.error('Get available orders error:', error);
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Get available orders failed'
      };
    }
 },

  // Accept an order
  acceptOrder: async (orderId) => {
    set({ loading: true });
    try {
      // Make real API call to accept order
      const response = await api.post(`/driver/orders/${orderId}/accept`);

      if (response.data.success) {
        const order = response.data.data.order;
        
        // Set as active order
        set({ activeOrder: order, loading: false });

        // Notify via WebSocket that order was accepted
        webSocketService.acceptOrder(orderId);

        return { success: true, order: order };
      } else {
        set({ loading: false });
        return { success: false, error: response.data.message || 'Accept order failed' };
      }
    } catch (error) {
      console.error('Accept order error:', error);
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Accept order failed'
      };
    }
  },

  // Update order status
  updateOrderStatus: async (orderId, status) => {
    set({ loading: true });
    try {
      // Make real API call to update order status
      const response = await api.patch(`/driver/orders/${orderId}/status`, {
        status: status
      });

      if (response.data.success) {
        const updatedOrder = response.data.data.order;
        
        // Update active order if it matches
        if (get().activeOrder && get().activeOrder.id === orderId) {
          set({ activeOrder: { ...get().activeOrder, status: status } });
        }
        
        // If status is delivered, clear active order
        if (status === 'delivered') {
          set({ activeOrder: null });
        }
        
        set({ loading: false });

        return { success: true, order: updatedOrder };
      } else {
        set({ loading: false });
        return { success: false, error: response.data.message || 'Update order status failed' };
      }
    } catch (error) {
      console.error('Update order status error:', error);
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Update order status failed'
      };
    }
  },

  // Get order history
  getOrderHistory: async (period = 'all') => {
    set({ loading: true });
    try {
      // Make real API call to get order history
      const response = await api.get(`/driver/orders/history?period=${period}`);

      if (response.data.success) {
        const history = response.data.data.orders;
        
        set({ orderHistory: history, loading: false });

        return { success: true, history: history };
      } else {
        set({ loading: false });
        return { success: false, error: response.data.message || 'Get order history failed' };
      }
    } catch (error) {
      console.error('Get order history error:', error);
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Get order history failed'
      };
    }
  },

  // Get active order
  getActiveOrder: async () => {
    set({ loading: true });
    try {
      // Make real API call to get active order
      const response = await api.get('/driver/orders/active');

      if (response.data.success) {
        const activeOrder = response.data.data.order;
        
        if (activeOrder) {
          set({ activeOrder });
        }
        
        set({ loading: false });

        return { success: true, order: activeOrder };
      } else {
        set({ loading: false });
        return { success: false, error: response.data.message || 'Get active order failed' };
      }
    } catch (error) {
      console.error('Get active order error:', error);
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Get active order failed'
      };
    }
  },

  // Clear active order
  clearActiveOrder: () => {
    set({ activeOrder: null });
  },

  // Set available orders
  setAvailableOrders: (orders) => {
    set({ availableOrders: orders });
  },

  // Set order history
  setOrderHistory: (history) => {
    set({ orderHistory: history });
  },

  // Set loading state
  setLoading: (loading) => {
    set({ loading });
  },
}));