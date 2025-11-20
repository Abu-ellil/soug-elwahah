import { create } from 'zustand';
import Toast from 'react-native-toast-message';
import { Product } from '../types/product';
import apiService from '../services/api';
import { useAuthStore } from './authStore';

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  refreshing: boolean;
  hasApprovedStore: boolean;
  fetchProducts: () => Promise<void>;
  handleRefresh: () => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  toggleAvailability: (productId: string) => Promise<void>;
  addProduct: (productData: any) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (productId: string, productData: any) => Promise<{ success: boolean; error?: string }>;
}

const checkApprovedStores = () => {
  const { currentUser } = useAuthStore.getState();
  return currentUser?.stores?.some(store => store.verificationStatus === 'approved') || false;
};

const handleApiError = (message?: string) => {
  if (message?.includes('معتمدة') || message?.includes('approved')) {
    // This will be handled by the set function call in the store methods
  } else {
    Toast.show({
      type: 'error',
      text1: 'خطأ',
      text2: message || 'فشل في تحميل المنتجات',
    });
  }
};

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  isLoading: true,
  refreshing: false,
  hasApprovedStore: false,

  fetchProducts: async () => {
    try {
      set({ isLoading: true });
      const approved = checkApprovedStores();
      set({ hasApprovedStore: approved });

      if (!approved) {
        set({ products: [], isLoading: false });
        return;
      }

      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      try {
        const response = await apiService.getProducts();
        clearTimeout(timeoutId);
        
        if (response.success && response.data) {
          set({ products: response.data.products || [], isLoading: false });
        } else {
          set({ isLoading: false });
          handleApiError(response.message);
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        set({ isLoading: false });
        
        if (fetchError.name === 'AbortError') {
          Toast.show({
            type: 'error',
            text1: 'انتهت المهلة',
            text2: 'استغرق تحميل المنتجات وقتاً أطول من المتوقع',
          });
        } else {
          handleApiError(fetchError.message);
        }
      }
    } catch (error: any) {
      set({ isLoading: false });
      handleApiError(error.message);
    }
  },

  handleRefresh: async () => {
    set({ refreshing: true });
    await get().fetchProducts();
    set({ refreshing: false });
  },

  deleteProduct: async (productId: string) => {
    try {
      const response = await apiService.deleteProduct(productId);
      if (response.success) {
        set(state => ({ 
          products: state.products.filter(p => p._id !== productId) 
        }));
        Toast.show({
          type: 'success',
          text1: 'تم',
          text2: 'تم حذف المنتج بنجاح',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'خطأ',
          text2: response.message || 'فشل في حذف المنتج',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: error.message || 'فشل في حذف المنتج',
      });
    }
  },

  toggleAvailability: async (productId: string) => {
    try {
      const response = await apiService.toggleProductAvailability(productId);
      if (response.success) {
        set(state => ({ 
          products: state.products.map(p =>
            p._id === productId ? { ...p, isAvailable: !p.isAvailable } : p
          )
        }));
        Toast.show({
          type: 'success',
          text1: 'تم',
          text2: 'تم تحديث حالة المنتج',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'خطأ',
          text2: response.message || 'فشل في تحديث حالة المنتج',
        });
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: error.message || 'فشل في تحديث حالة المنتج',
      });
    }
  },

  addProduct: async (productData: any) => {
    try {
      const response = await apiService.addProduct(productData);
      if (response.success) {
        await get().fetchProducts(); // Refresh the products list
        Toast.show({
          type: 'success',
          text1: 'تم',
          text2: 'تم إضافة المنتج بنجاح',
        });
        return { success: true };
      } else {
        Toast.show({
          type: 'error',
          text1: 'خطأ',
          text2: response.message || 'فشل في إضافة المنتج',
        });
        return { success: false, error: response.message };
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: error.message || 'فشل في إضافة المنتج',
      });
      return { success: false, error: error.message };
    }
  },

  updateProduct: async (productId: string, productData: any) => {
    try {
      const response = await apiService.updateProduct(productId, productData);
      if (response.success) {
        set(state => ({ 
          products: state.products.map(p =>
            p._id === productId ? { ...p, ...productData } : p
          )
        }));
        Toast.show({
          type: 'success',
          text1: 'تم',
          text2: 'تم تحديث المنتج بنجاح',
        });
        return { success: true };
      } else {
        Toast.show({
          type: 'error',
          text1: 'خطأ',
          text2: response.message || 'فشل في تحديث المنتج',
        });
        return { success: false, error: response.message };
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: error.message || 'فشل في تحديث المنتج',
      });
      return { success: false, error: error.message };
    }
  },
}));