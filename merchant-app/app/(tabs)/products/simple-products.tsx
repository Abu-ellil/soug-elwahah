import { View, Text, FlatList, RefreshControl, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../../stores/authStore';
import apiService from '../../../services/api';
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

const SimpleProductsScreen = () => {
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
          text1: 'Error',
          text2: response.message || 'Failed to load products',
        });
      }
    } catch (error: any) {
      console.error('Error fetching products:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load products',
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

  useEffect(() => {
    if (currentUser) {
      fetchProducts();
    }
  }, [currentUser]);

  const renderProduct = ({ item }: { item: Product }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-lg border border-gray-100">
      <View className="flex-row">
        {/* Product Image */}
        <View className="mr-4">
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              className="w-20 h-20 rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-20 h-20 rounded-xl bg-gray-200 items-center justify-center">
              <Ionicons name="image-outline" size={32} color="#9CA3AF" />
            </View>
          )}
        </View>

        {/* Product Details */}
        <View className="flex-1 justify-between">
          <View>
            <Text className="text-lg font-bold text-gray-800 mb-1" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {item.description}
            </Text>
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-xl font-bold text-blue-600">
              {item.price} ج.م
            </Text>
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-500 mr-2">
                Stock: {item.stock}
              </Text>
              <View className={`px-2 py-1 rounded-lg ${
                item.isAvailable ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Text className={`text-xs font-medium ${
                  item.isAvailable ? 'text-green-800' : 'text-red-800'
                }`}>
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#4F46E5', '#7C3AED']}
      className="flex-1"
    >
      {/* Header */}
      <View className="px-6 pt-16 pb-6">
        <Text className="text-3xl font-bold text-white text-center mb-2">
          My Store Products
        </Text>
        <Text className="text-white/80 text-center text-base">
          {products.length} product{products.length !== 1 ? 's' : ''} available
        </Text>
      </View>

      {/* Products List */}
      <View className="flex-1 bg-white rounded-t-3xl">
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ 
            padding: 20, 
            paddingBottom: 100 
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            isLoading ? (
              <View className="flex-1 items-center justify-center py-20">
                <View className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <Text className="text-lg text-gray-600">Loading products...</Text>
              </View>
            ) : !hasApprovedStore ? (
              <View className="flex-1 items-center justify-center py-20 px-8">
                <Ionicons name="storefront-outline" size={80} color="#E5E7EB" />
                <Text className="text-xl font-bold text-gray-800 mt-6 text-center">
                  No Approved Store
                </Text>
                <Text className="text-base text-gray-600 mt-2 text-center">
                  Your store needs to be approved by the administration first
                </Text>
              </View>
            ) : (
              <View className="flex-1 items-center justify-center py-20 px-8">
                <Ionicons name="cube-outline" size={80} color="#E5E7EB" />
                <Text className="text-xl font-bold text-gray-800 mt-6 text-center">
                  No Products Yet
                </Text>
                <Text className="text-base text-gray-600 mt-2 text-center">
                  Start by adding your first product to your store
                </Text>
              </View>
            )
          }
        />
      </View>
    </LinearGradient>
  );
};

export default SimpleProductsScreen;