import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
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
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription}>{item.description}</Text>
        <Text style={styles.productPrice}>{item.price} ج.م</Text>
        <Text style={styles.productStock}>المخزون: {item.stock}</Text>
        <View style={[styles.availabilityBadge, item.isAvailable ? styles.availableBadge : styles.unavailableBadge]}>
          <Text style={styles.availabilityText}>
            {item.isAvailable ? 'متوفر' : 'غير متوفر'}
          </Text>
        </View>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push(`/product-form?id=${item._id}`)}>
          <Ionicons name="create-outline" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => handleToggleAvailability(item._id)}>
          <Ionicons
            name={item.isAvailable ? "eye-off-outline" : "eye-outline"}
            size={20}
            color="white"
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteProduct(item._id)}>
          <Ionicons name="trash-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المنتجات</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/product-form')}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>جاري تحميل المنتجات...</Text>
            </View>
          ) : !hasApprovedStore ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={60} color="#D1D5DB" />
              <Text style={styles.emptyText}>لا توجد متاجر معتمدة</Text>
              <Text style={styles.emptySubtext}>يجب أن يكون متجرك معتمدًا من الإدارة أولاً</Text>
              <TouchableOpacity
                style={styles.createStoreButton}
                onPress={() => router.push('/welcome')}
              >
                <Text style={styles.createStoreButtonText}>إنشاء متجر</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={60} color="#D1D5DB" />
              <Text style={styles.emptyText}>لا توجد منتجات</Text>
              <Text style={styles.emptySubtext}>اضغط على زر الإضافة لإضافة منتج جديد</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    padding: 16,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  productStock: {
    fontSize: 14,
    color: '#10B981',
  },
  productActions: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  availabilityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  availableBadge: {
    backgroundColor: '#D1FAE5',
  },
  unavailableBadge: {
    backgroundColor: '#FEF3C7',
  },
  availabilityText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
  },
  toggleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  createStoreButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  createStoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ProductsScreen;
