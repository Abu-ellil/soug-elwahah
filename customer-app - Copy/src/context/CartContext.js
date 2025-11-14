import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveCart, getCart, clearCart as clearCartStorage } from '../utils/storage';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const cart = await getCart();
      setCartItems(cart);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCartToStorage = async (items) => {
    try {
      await saveCart(items);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.productId === product.id);

      let newItems;
      if (existingItem) {
        newItems = prevItems.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newItems = [
          ...prevItems,
          {
            productId: product.id,
            storeId: product.storeId,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
          },
        ];
      }

      saveCartToStorage(newItems);
      return newItems;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.productId !== productId);
      saveCartToStorage(newItems);
      return newItems;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) => {
      const newItems = prevItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      saveCartToStorage(newItems);
      return newItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    clearCartStorage();
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const getCartSubtotal = () => {
    return getCartTotal();
  };

  const getDeliveryFee = () => {
    return cartItems.length > 0 ? 10 : 0; // رسوم ثابتة للتوصيل
  };

  const getTotalWithDelivery = () => {
    return getCartSubtotal() + getDeliveryFee();
  };

  const value = {
    cartItems,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal: getCartTotal,
    getCartItemsCount,
    getCartSubtotal,
    getDeliveryFee,
    getTotalWithDelivery,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
