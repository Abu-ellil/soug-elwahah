import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../stores/authStore';
import apiService from '../../services/api';
import Toast from 'react-native-toast-message';
import { Product } from '../../types/product';

export const useProducts = () => {
  const { currentUser } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasApprovedStore, setHasApprovedStore] = useState(false);

  const checkApprovedStores = useCallback(() => {
    return currentUser?.stores?.some(store => store.verificationStatus === 'approved') || false;
  }, [currentUser]);

  const fetchProducts = useCallback(async () => {
    try {
      const approved = checkApprovedStores();
      setHasApprovedStore(approved);

      if (!approved) {
        setProducts([]);
        return;
      }

      const response = await apiService.getProducts();
      if (response.success && response.data) {
        setProducts(response.data.products || []);
      } else {
        handleApiError(response.message);
      }
    } catch (error: any) {
      handleApiError(error.message);
    }
  }, [checkApprovedStores]);

  const handleApiError = (message?: string) => {
    if (message?.includes('معتمدة') || message?.includes('approved')) {
      setHasApprovedStore(false);
      setProducts([]);
    } else {
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: message || 'فشل في تحميل المنتجات',
      });
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, [fetchProducts]);

  const deleteProduct = useCallback(async (productId: string) => {
    try {
      const response = await apiService.deleteProduct(productId);
      if (response.success) {
        setProducts(prev => prev.filter(p => p._id !== productId));
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
  }, []);

  const toggleAvailability = useCallback(async (productId: string) => {
    try {
      const response = await apiService.toggleProductAvailability(productId);
      if (response.success) {
        setProducts(prev => prev.map(p =>
          p._id === productId ? { ...p, isAvailable: !p.isAvailable } : p
        ));
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
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchProducts().finally(() => setIsLoading(false));
    }
  }, [currentUser, fetchProducts]);

  return {
    products,
    isLoading,
    refreshing,
    hasApprovedStore,
    fetchProducts,
    handleRefresh,
    deleteProduct,
    toggleAvailability,
  };
};
