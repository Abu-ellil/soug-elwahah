import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveCart, getCart, clearCart as clearCartStorage, getToken } from '../utils/storage';
import { offlineDataManager } from '../utils/offlineDataManager';
import { API } from '../services/api';
import { useAnalyticsStore } from './analyticsStore';
import { useAuthStore } from './authStore';

export const useCartStore = create(
  persist(
    (set, get) => ({
      // الحالة - State
      cartItems: [],
      orders: [],
      isLoading: false,

      // الإجراءات - Actions
      loadCart: async () => {
        set({ isLoading: true });
        try {
          const cart = await getCart();
          set({ cartItems: cart });
        } catch (error) {
          console.error('خطأ في تحميل السلة:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      saveCartToStorage: async (items) => {
        try {
          await saveCart(items);
        } catch (error) {
          console.error('خطأ في حفظ السلة:', error);
        }
      },

      addToCart: (product, quantity = 1) => {
        const { isAuthenticated } = useAuthStore.getState();
        if (!isAuthenticated) {
          throw new Error('يجب تسجيل الدخول أولاً');
        }

        set((prevState) => {
          const cartItems = prevState.cartItems && Array.isArray(prevState.cartItems) 
            ? prevState.cartItems 
            : [];
          const existingItem = cartItems.find((item) => item.productId === product.id);

          let newItems;
          if (existingItem) {
            newItems = cartItems.map((item) =>
              item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item
            );
          } else {
            newItems = [
              ...cartItems,
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

          get().saveCartToStorage(newItems);
          return { cartItems: newItems };
        });
      },

      removeFromCart: (productId) => {
        set((prevState) => {
          const newItems = prevState.cartItems && Array.isArray(prevState.cartItems) 
            ? prevState.cartItems.filter((item) => item.productId !== productId) 
            : [];
          get().saveCartToStorage(newItems);
          return { cartItems: newItems };
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        set((prevState) => {
          const newItems = prevState.cartItems && Array.isArray(prevState.cartItems)
            ? prevState.cartItems.map((item) =>
                item.productId === productId ? { ...item, quantity } : item
              )
            : [];
          get().saveCartToStorage(newItems);
          return { cartItems: newItems };
        });
      },

      clearCart: () => {
        set({ cartItems: [] });
        clearCartStorage();
      },

      getCartTotal: () => {
        const { cartItems } = get();
        return cartItems && Array.isArray(cartItems) 
          ? cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
          : 0;
      },

      getCartItemsCount: () => {
        const { cartItems } = get();
        return cartItems && Array.isArray(cartItems) 
          ? cartItems.reduce((count, item) => count + item.quantity, 0)
          : 0;
      },

      getCartSubtotal: () => {
        return get().getCartTotal();
      },

      getDeliveryFee: () => {
        const { cartItems } = get();
        return (cartItems && Array.isArray(cartItems) && cartItems.length > 0) ? 10 : 0;
      },

      getTotalWithDelivery: () => {
        return get().getCartSubtotal() + get().getDeliveryFee();
      },

      loadOrders: async () => {
        set({ isLoading: true });
        try {
          const token = await getToken();
          if (!token) {
            throw new Error('غير مصادق عليه');
          }

          const response = await API.ordersAPI.getMyOrders(token);
          if (response.success) {
            set({ orders: response.data.orders });
            return { success: true, orders: response.data.orders };
          } else {
            throw new Error(response.message || 'حدث خطأ أثناء تحميل الطلبات');
          }
        } catch (error) {
          console.error('❌ Error loading orders:', error);
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      addOrder: async (orderData) => {
        set({ isLoading: true });
        try {
          const token = await getToken();
          if (!token) {
            throw new Error('غير مصادق عليه');
          }

          const response = await API.ordersAPI.createOrder(orderData, token);
          if (response.success) {
            const newOrder = response.data.order;

            set((prevState) => ({
              orders: [newOrder, ...prevState.orders],
              isLoading: false,
            }));

            // Log product purchases for analytics
            const { logProductPurchase } = useAnalyticsStore.getState();
            if (newOrder.items && Array.isArray(newOrder.items)) {
              newOrder.items.forEach((item) => {
                logProductPurchase(item.productId, newOrder.storeId, item.quantity);
              });
            }

            return { success: true, order: newOrder };
          } else {
            throw new Error(response.message || 'حدث خطأ أثناء إنشاء الطلب');
          }
        } catch (error) {
          console.error('❌ Error adding order:', error);
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage, {
        reviver: (key, value) => value,
        replacer: (key, value) => value,
      }),
      partialize: (state) => ({
        cartItems: state.cartItems,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.log('Error rehydrating cart storage:', error);
        }
      },
    }
  )
);
