import React, { createContext, useContext, useEffect } from 'react';
import { useCartStore } from '../stores/cartStore';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const cartStore = useCartStore();

  useEffect(() => {
    // Load cart data when the app starts
    cartStore.loadCart();
  }, []);

  const value = {
    cartItems: cartStore.cartItems,
    orders: cartStore.orders,
    isLoading: cartStore.isLoading,
    addToCart: cartStore.addToCart,
    removeFromCart: cartStore.removeFromCart,
    updateQuantity: cartStore.updateQuantity,
    clearCart: cartStore.clearCart,
    getCartTotal: cartStore.getCartTotal,
    getCartItemsCount: cartStore.getCartItemsCount,
    getCartSubtotal: cartStore.getCartSubtotal,
    getDeliveryFee: cartStore.getDeliveryFee,
    getTotalWithDelivery: cartStore.getTotalWithDelivery,
    loadOrders: cartStore.loadOrders,
    addOrder: cartStore.addOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
