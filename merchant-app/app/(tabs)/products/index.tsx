import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Alert,
  Image,
  FlatList,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useProductsStore } from '../../../stores/productsStore';
import { useAuthStore } from '../../../stores/authStore';

export default function ProductsIndex() {
  const router = useRouter();
  const { currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  
  const { 
    products, 
    isLoading, 
    refreshing, 
    hasApprovedStore, 
    fetchProducts, 
    handleRefresh,
    deleteProduct,
    toggleAvailability 
  } = useProductsStore();

  useEffect(() => {
    if (currentUser) {
      fetchProducts();
    }
  }, [currentUser, fetchProducts]);

  const handleDeleteProduct = (productId: string, productName: string) => {
    Alert.alert(
      'تأكيد الحذف',
      `هل أنت متأكد من حذف "${productName}"؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: () => deleteProduct(productId)
        }
      ]
    );
  };

  const handleEditProduct = (productId: string) => {
    router.push({
      pathname: '/(tabs)/products/add',
      params: { id: productId }
    });
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
                         (filter === 'available' && product.isAvailable) ||
                         (filter === 'unavailable' && !product.isAvailable);
    return matchesSearch && matchesFilter;
  });

  const renderProductCard = ({ item: product }: { item: any }) => (
    <View className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100">
      <View className="flex-row">
        {/* Product Image */}
        <View className="w-16 h-16 bg-gray-100 rounded-lg mr-4 justify-center items-center overflow-hidden">
          {product.image ? (
            <Image 
              source={{ uri: product.image }} 
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="cube-outline" size={24} color="#9CA3AF" />
          )}
        </View>

        {/* Product Info */}
        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <Text className="text-lg font-semibold text-gray-900 flex-1 mr-2">
              {product.name}
            </Text>
            <View className={`px-2 py-1 rounded-full ${
              product.isAvailable ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <Text className={`text-xs font-medium ${
                product.isAvailable ? 'text-green-800' : 'text-red-800'
              }`}>
                {product.isAvailable ? 'متوفر' : 'غير متوفر'}
              </Text>
            </View>
          </View>
          
          <Text className="text-xl font-bold text-blue-600 mb-1">
            ${product.price}
          </Text>
          
          {product.description && (
            <Text className="text-sm text-gray-600 mb-2" numberOfLines={2}>
              {product.description}
            </Text>
          )}
          
          <Text className="text-sm text-gray-500">
            المخزون: {product.stock} قطعة
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row justify-between mt-4 pt-4 border-t border-gray-100">
        <TouchableOpacity
          className="flex-1 bg-blue-50 px-4 py-2 rounded-lg mr-2"
          onPress={() => handleEditProduct(product._id)}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="create-outline" size={16} color="#3B82F6" />
            <Text className="text-blue-600 font-medium ml-2">تعديل</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          className={`flex-1 px-4 py-2 rounded-lg mr-2 ${
            product.isAvailable ? 'bg-orange-50' : 'bg-green-50'
          }`}
          onPress={() => toggleAvailability(product._id)}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons 
              name={product.isAvailable ? 'eye-off-outline' : 'eye-outline'} 
              size={16} 
              color={product.isAvailable ? "#F59E0B" : "#10B981"} 
            />
            <Text className={`font-medium ml-2 ${
              product.isAvailable ? 'text-orange-600' : 'text-green-600'
            }`}>
              {product.isAvailable ? 'إخفاء' : 'إظهار'}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="flex-1 bg-red-50 px-4 py-2 rounded-lg"
          onPress={() => handleDeleteProduct(product._id, product.name)}
        >
          <View className="flex-row items-center justify-center">
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text className="text-red-600 font-medium ml-2">حذف</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <LinearGradient colors={["#667eea", "#764ba2"]} className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white text-lg mt-4">جاري تحميل المنتجات...</Text>
      </LinearGradient>
    );
  }

  if (!hasApprovedStore) {
    return (
      <LinearGradient colors={["#667eea", "#764ba2"]} className="flex-1 items-center justify-center p-8">
        <View className="bg-white rounded-2xl p-8 items-center">
          <Ionicons name="storefront-outline" size={64} color="#9CA3AF" />
          <Text className="text-xl font-semibold text-gray-700 mt-4 text-center">
            تحتاج إلى متجر معتمد
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            لإدارة المنتجات، يجب أن يكون لديك متجر معتمد
          </Text>
          <TouchableOpacity
            className="bg-blue-500 px-6 py-3 rounded-lg mt-6"
            onPress={() => router.push('/(tabs)/setup/store-application')}
          >
            <Text className="text-white font-medium">طلب إنشاء متجر</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} className="flex-1">
      <View className="flex-1 pt-16">
        {/* Header */}
        <View className="px-4 pb-4">
          <Text className="text-3xl font-bold text-white mb-2">إدارة المنتجات</Text>
          <Text className="text-white/80">
            {filteredProducts.length} من {products.length} منتج
          </Text>
        </View>

        {/* Search and Filter */}
        <View className="px-4 mb-4">
          <View className="bg-white rounded-xl p-3 mb-3">
            <View className="flex-row items-center">
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                className="flex-1 mr-3 text-base"
                placeholder="البحث في المنتجات..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Filter Buttons */}
          <View className="flex-row">
            {[
              { key: 'all', label: 'الكل', count: products.length },
              { key: 'available', label: 'متوفر', count: products.filter(p => p.isAvailable).length },
              { key: 'unavailable', label: 'غير متوفر', count: products.filter(p => !p.isAvailable).length }
            ].map(({ key, label, count }) => (
              <TouchableOpacity
                key={key}
                className={`flex-1 px-3 py-2 rounded-lg mr-2 ${
                  filter === key ? 'bg-white' : 'bg-white/20'
                }`}
                onPress={() => setFilter(key as any)}
              >
                <Text className={`text-center text-sm font-medium ${
                  filter === key ? 'text-purple-700' : 'text-white'
                }`}>
                  {label} ({count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Products List */}
        <View className="flex-1 px-4">
          {filteredProducts.length === 0 ? (
            <View className="flex-1 items-center justify-center py-16">
              <Ionicons name="cube-outline" size={64} color="rgba(255,255,255,0.5)" />
              <Text className="text-white text-xl font-bold mt-4 mb-2">لا توجد منتجات</Text>
              <Text className="text-white/70 text-center px-8 mb-6">
                {searchQuery || filter !== 'all' 
                  ? 'لم يتم العثور على منتجات تطابق البحث'
                  : 'لم تقم بإضافة أي منتجات بعد'
                }
              </Text>
              {!searchQuery && filter === 'all' && (
                <TouchableOpacity
                  className="bg-white/20 px-6 py-3 rounded-lg"
                  onPress={() => router.push('/(tabs)/products/add')}
                >
                  <Text className="text-white font-medium">إضافة منتج جديد</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProductCard}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="#fff"
                  colors={['#fff']}
                />
              }
            />
          )}
        </View>
      </View>

      {/* Add Product FAB */}
      {hasApprovedStore && (
        <TouchableOpacity
          className="absolute bottom-8 right-8 bg-white w-14 h-14 rounded-full shadow-lg justify-center items-center"
          onPress={() => router.push('/(tabs)/products/add')}
        >
          <Ionicons name="add" size={24} color="#667eea" />
        </TouchableOpacity>
      )}
    </LinearGradient>
  );
}

