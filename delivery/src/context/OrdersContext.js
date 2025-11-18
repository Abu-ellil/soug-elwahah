import { useOrdersStore } from '../store/ordersStore';

// Custom hook that directly uses the Zustand store
export const useOrders = () => {
  const ordersStore = useOrdersStore();
  
  // Return the orders state and actions in the same format as the context used to provide
  return {
    availableOrders: ordersStore.availableOrders,
    activeOrder: ordersStore.activeOrder,
    orderHistory: ordersStore.orderHistory,
    loading: ordersStore.loading,
    getAvailableOrders: ordersStore.getAvailableOrders,
    acceptOrder: ordersStore.acceptOrder,
    updateOrderStatus: ordersStore.updateOrderStatus,
    getOrderHistory: ordersStore.getOrderHistory,
    getActiveOrder: ordersStore.getActiveOrder,
    clearActiveOrder: ordersStore.clearActiveOrder,
    setAvailableOrders: ordersStore.setAvailableOrders,
    setOrderHistory: ordersStore.setOrderHistory,
    setLoading: ordersStore.setLoading,
    ...ordersStore, // Include all other store functions and state
  };
};