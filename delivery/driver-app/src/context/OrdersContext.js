import React, { createContext, useReducer } from 'react';
import { DRIVERS } from '../data/drivers';
import { ORDERS } from '../data/orders';

// Initial state
const initialState = {
  availableOrders: [],
  activeOrder: null,
  orderHistory: [],
  loading: false,
};

// Orders Context
export const OrdersContext = createContext();

// Orders Reducer
const ordersReducer = (state, action) => {
  switch (action.type) {
    case 'SET_AVAILABLE_ORDERS':
      return { ...state, availableOrders: action.orders };
    case 'SET_ACTIVE_ORDER':
      return { ...state, activeOrder: action.order };
    case 'SET_ORDER_HISTORY':
      return { ...state, orderHistory: action.history };
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'UPDATE_ORDER_STATUS':
      if (state.activeOrder && state.activeOrder.id === action.orderId) {
        return {
          ...state,
          activeOrder: { ...state.activeOrder, status: action.status }
        };
      }
      return state;
    case 'CLEAR_ACTIVE_ORDER':
      return { ...state, activeOrder: null };
    default:
      return state;
  }
};

// Orders Provider
export const OrdersProvider = ({ children }) => {
  const [state, dispatch] = useReducer(ordersReducer, initialState);

  // Get available orders
  const getAvailableOrders = async (driverLocation = { lat: 31.1110, lng: 30.9390 }) => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });

      // In a real app, you would fetch from your API
      // For mock data, we'll filter orders that are pending and near the driver
      const mockAvailableOrders = ORDERS.filter(order => 
        order.status === 'pending' && 
        order.driverId === null
      );

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      dispatch({ type: 'SET_AVAILABLE_ORDERS', orders: mockAvailableOrders });
      dispatch({ type: 'SET_LOADING', loading: false });

      return { success: true, orders: mockAvailableOrders };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', loading: false });
      return { success: false, error: error.message };
    }
  };

  // Accept an order
  const acceptOrder = async (orderId) => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });

      // In a real app, you would call your API here
      // For mock data, we'll find the order and update its status
      const order = ORDERS.find(o => o.id === orderId);
      if (order) {
        const updatedOrder = { ...order, status: 'accepted', driverId: DRIVERS[0].id };
        
        // Set as active order
        dispatch({ type: 'SET_ACTIVE_ORDER', order: updatedOrder });
        dispatch({ type: 'SET_LOADING', loading: false });

        return { success: true, order: updatedOrder };
      } else {
        dispatch({ type: 'SET_LOADING', loading: false });
        return { success: false, error: 'Order not found' };
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', loading: false });
      return { success: false, error: error.message };
    }
 };

  // Update order status
  const updateOrderStatus = async (orderId, status) => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });

      // In a real app, you would call your API here
      // For mock data, we'll update the active order status
      if (state.activeOrder && state.activeOrder.id === orderId) {
        const updatedOrder = { ...state.activeOrder, status };
        dispatch({ type: 'UPDATE_ORDER_STATUS', orderId, status });
        
        // If status is delivered, clear active order
        if (status === 'delivered') {
          dispatch({ type: 'CLEAR_ACTIVE_ORDER' });
        }
        
        dispatch({ type: 'SET_LOADING', loading: false });

        return { success: true, order: updatedOrder };
      } else {
        dispatch({ type: 'SET_LOADING', loading: false });
        return { success: false, error: 'Active order not found' };
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', loading: false });
      return { success: false, error: error.message };
    }
  };

  // Get order history
  const getOrderHistory = async (period = 'all') => {
    try {
      dispatch({ type: 'SET_LOADING', loading: true });

      // In a real app, you would fetch from your API
      // For mock data, we'll return completed orders
      const mockHistory = ORDERS.filter(order => 
        order.status === 'delivered' || order.status === 'completed'
      );

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      dispatch({ type: 'SET_ORDER_HISTORY', history: mockHistory });
      dispatch({ type: 'SET_LOADING', loading: false });

      return { success: true, history: mockHistory };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', loading: false });
      return { success: false, error: error.message };
    }
  };

 return (
    <OrdersContext.Provider
      value={{
        ...state,
        getAvailableOrders,
        acceptOrder,
        updateOrderStatus,
        getOrderHistory,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};