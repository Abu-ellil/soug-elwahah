import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveCart, getCart, clearCart as clearCartStorage, getToken } from '../utils/storage';
import { offlineDataManager } from '../utils/offlineDataManager';
import { API } from '../services/api';
import { useAnalytics } from './AnalyticsContext';

// إنشاء سياق سلة التسوق - Create Cart Context
const CartContext = createContext();

// خطاف مخصص لاستخدام سلة التسوق - Custom hook for using Cart Context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('يجب استخدام useCart داخل CartProvider'); // useCart must be used within a CartProvider
  }
  return context;
};

// مزود سياق سلة التسوق - Cart Context Provider Component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]); // حالة عناصر السلة - Cart items state
  const [orders, setOrders] = useState([]); // حالة الطلبات - Orders state (will be loaded from API)
  const [isLoading, setIsLoading] = useState(true); // حالة التحميل - Loading state
  const { logProductPurchase } = useAnalytics();

  // تحميل بيانات السلة عند تحميل المكون - Load cart data on component mount
  useEffect(() => {
    loadCart();
  }, []);

  // دالة تحميل السلة من التخزين المحلي - Function to load cart from local storage
  const loadCart = async () => {
    try {
      const cart = await getCart();
      setCartItems(cart);
    } catch (error) {
      console.error('خطأ في تحميل السلة:', error); // Error loading cart
    } finally {
      setIsLoading(false);
    }
  };

  // دالة حفظ السلة في التخزين المحلي - Function to save cart to local storage
  const saveCartToStorage = async (items) => {
    try {
      await saveCart(items);
    } catch (error) {
      console.error('خطأ في حفظ السلة:', error); // Error saving cart
    }
  };

  // دالة إضافة منتج إلى السلة - Function to add product to cart
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

  // دالة إزالة منتج من السلة - Function to remove product from cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.productId !== productId);
      saveCartToStorage(newItems);
      return newItems;
    });
  };

  // دالة تحديث كمية منتج في السلة - Function to update product quantity in cart
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

  // دالة مسح السلة - Function to clear the cart
  const clearCart = () => {
    setCartItems([]);
    clearCartStorage();
  };

  // دالة حساب إجمالي السلة - Function to calculate cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // دالة حساب عدد عناصر السلة - Function to get cart items count
  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // دالة حساب المجموع الفرعي للسلة - Function to get cart subtotal
  const getCartSubtotal = () => {
    return getCartTotal();
  };

  // دالة حساب رسوم التوصيل - Function to get delivery fee
  const getDeliveryFee = () => {
    return cartItems.length > 0 ? 10 : 0; // رسوم ثابتة للتوصيل - Fixed delivery fee
  };

  // دالة حساب الإجمالي مع التوصيل - Function to get total with delivery
  const getTotalWithDelivery = () => {
    return getCartSubtotal() + getDeliveryFee();
  };

  // دالة تحميل الطلبات من API - Function to load orders from API
  const loadOrders = async () => {
    try {
      const token = await getToken();

      if (!token) {
        throw new Error('غير مصادق عليه'); // Not authenticated
      }

      const response = await API.ordersAPI.getMyOrders(token);

      if (response.success) {
        setOrders(response.data.orders);
        return { success: true, orders: response.data.orders };
      } else {
        throw new Error(response.message || 'حدث خطأ أثناء تحميل الطلبات');
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      return { success: false, error: error.message };
    }
  };

  // دالة إضافة طلب جديد - Function to add a new order
  const addOrder = async (orderData) => {
    try {
      // Get the token from storage
      const token = await getToken();

      if (!token) {
        throw new Error('غير مصادق عليه'); // Not authenticated
      }

      // Create order via API
      const response = await API.ordersAPI.createOrder(orderData, token);

      if (response.success) {
        const newOrder = response.data.order;

        // Add to state
        setOrders((prevOrders) => [newOrder, ...prevOrders]);

        // Log product purchases for analytics
        newOrder.items.forEach((item) => {
          logProductPurchase(item.productId, newOrder.storeId, item.quantity);
        });

        return { success: true, order: newOrder };
      } else {
        throw new Error(response.message || 'حدث خطأ أثناء إنشاء الطلب');
      }
    } catch (error) {
      console.error('❌ Error adding order:', error);
      return { success: false, error: error.message };
    }
  };

  // القيم التي يوفرها السياق - Values provided by the context
  const value = {
    cartItems,
    orders,
    isLoading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    addOrder,
    loadOrders,
    getCartTotal: getCartTotal,
    getCartItemsCount,
    getCartSubtotal,
    getDeliveryFee,
    getTotalWithDelivery,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
