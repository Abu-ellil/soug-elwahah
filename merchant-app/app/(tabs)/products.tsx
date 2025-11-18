import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import apiService from '../../services/api';
import Toast from 'react-native-toast-message';

// Define product type
interface Product {
  _id: string;
  id?: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  image?: string;
  isAvailable: boolean;
  category?: string;
}

const ProductsScreen = () => {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasApprovedStore, setHasApprovedStore] = useState(false);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);

      // Check if user has approved stores
      const hasApprovedStores = currentUser?.stores?.some((store: any) =>
        typeof store === 'object' ? store.verificationStatus === 'approved' : true
      );

      setHasApprovedStore(!!hasApprovedStores);

      if (!hasApprovedStores) {
        setProducts([]);
        return;
      }

      const response = await apiService.getProducts();
      if (response.success && response.data) {
        setProducts(response.data.products || []);
      } else {
        Toast.show({
          type: 'error',
          text1: 'خطأ',
          text2: response.message || 'فشل في تحميل المنتجات',
        });
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: error.message || 'فشل في تحميل المنتجات',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleDeleteProduct = async (productId: string) => {
    Alert.alert('حذف المنتج', 'هل أنت متأكد أنك تريد حذف هذا المنتج؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await apiService.deleteProduct(productId);
            if (response.success) {
              setProducts(products.filter((product) => product._id !== productId));
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
            console.error('Error deleting product:', error);
            Toast.show({
              type: 'error',
              text1: 'خطأ',
              text2: error.message || 'فشل في حذف المنتج',
            });
          }
        },
      },
    ]);
  };

  const handleToggleAvailability = async (productId: string) => {
    try {
      const response = await apiService.toggleProductAvailability(productId);
      if (response.success) {
        setProducts(products.map(product =>
          product._id === productId
            ? { ...product, isAvailable: !product.isAvailable }
            : product
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
      console.error('Error toggling product availability:', error);
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: error.message || 'فشل في تحديث حالة المنتج',
      });
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchProducts();
    }
  }, [currentUser]);

  const renderProduct = ({ item }: { item: Product }) => (
    <View className="bg-white rounded-3xl p-6 mb-4 shadow-2xl">
      <View className="flex-1 mb-4">
        <Text className="text-lg font-bold text-gray-800 mb-2">{item.name}</Text>
        <Text className="text-base text-gray-600 mb-3">{item.description}</Text>
        <Text className="text-lg font-bold text-blue-600 mb-2">{item.price} ج.م</Text>
        <Text className="text-base text-green-600 mb-3">المخزون: {item.stock}</Text>
        <View className={`self-start px-3 py-1 rounded-xl ${item.isAvailable ? 'bg-green-100' : 'bg-yellow-100'}`}>
          <Text className="text-sm font-medium text-gray-800">
            {item.isAvailable ? 'متوفر' : 'غير متوفر'}
          </Text>
        </View>
      </View>
      <View className="flex-row justify-between">
        <TouchableOpacity
          className="w-10 h-10 rounded-xl bg-yellow-500 items-center justify-center"
          onPress={() => router.push(`/product-form?id=${item._id}`)}>
          <Ionicons name="create-outline" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-10 h-10 rounded-xl bg-yellow-500 items-center justify-center"
          onPress={() => handleToggleAvailability(item._id)}>
          <Ionicons
            name={item.isAvailable ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-10 h-10 rounded-xl bg-red-500 items-center justify-center"
          onPress={() => handleDeleteProduct(item._id)}
        >
          <Ionicons name="trash-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      className="flex-1"
    >
      {/* Header */}
      <View className="flex-row justify-between items-center bg-white/10 px-6 py-4 mt-12 mx-6 rounded-3xl mb-6">
        <Text className="text-2xl font-bold text-white">المنتجات</Text>
        <TouchableOpacity
          className="w-12 h-12 rounded-2xl bg-white/20 items-center justify-center"
          onPress={() => router.push('/product-form')}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <Text className="text-lg text-white">جاري تحميل المنتجات...</Text>
            </View>
          ) : !hasApprovedStore ? (
            <View className="bg-white rounded-3xl p-8 mx-6 items-center shadow-2xl">
              <Ionicons name="storefront-outline" size={60} color="#D1D5DB" />
              <Text className="text-xl font-bold text-gray-800 mt-4">لا توجد متاجر معتمدة</Text>
              <Text className="text-base text-gray-600 mt-2 text-center">يجب أن يكون متجرك معتمدًا من الإدارة أولاً</Text>
              <TouchableOpacity
                className="bg-blue-600 px-8 py-3 rounded-xl mt-6"
                onPress={() => router.push('/welcome')}
              >
                <Text className="text-white font-bold text-lg">إنشاء متجر</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="bg-white rounded-3xl p-8 mx-6 items-center shadow-2xl">
              <Ionicons name="cube-outline" size={60} color="#D1D5DB" />
              <Text className="text-xl font-bold text-gray-800 mt-4">لا توجد منتجات</Text>
              <Text className="text-base text-gray-600 mt-2 text-center">اضغط على زر الإضافة لإضافة منتج جديد</Text>
            </View>
          )
        }
      />
    </LinearGradient>
  );
};

export default ProductsScreen;
