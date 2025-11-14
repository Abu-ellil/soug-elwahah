import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveCart, getCart, clearCart as clearCartStorage } from '../utils/storage';
import { MOCK_ORDERS } from '../data/orders';

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
  const [orders, setOrders] = useState(MOCK_ORDERS); // حالة الطلبات - Orders state
  const [isLoading, setIsLoading] = useState(true); // حالة التحميل - Loading state

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

  // دالة إضافة طلب جديد - Function to add a new order
  const addOrder = (order) => {
    setOrders((prevOrders) => [order, ...prevOrders]);
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
    getCartTotal: getCartTotal,
    getCartItemsCount,
    getCartSubtotal,
    getDeliveryFee,
    getTotalWithDelivery,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
