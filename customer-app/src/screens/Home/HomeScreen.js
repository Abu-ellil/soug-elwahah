import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocation } from '../../context/LocationProvider';
import { useCart } from '../../context/CartContext';
import { useAnalytics } from '../../context/AnalyticsContext';
import { API } from '../../services/api';
import StoreCard from '../../components/StoreCard';
import CategoryCard from '../../components/CategoryCard';
import ProductCard from '../../components/ProductCard';
import SearchBar from '../../components/SearchBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import RangeSelector from '../../components/RangeSelector';
import COLORS from '../../constants/colors';
import SIZES from '../../constants/sizes';
import HomeScreenSkeleton from '../../components/HomeScreenSkeleton';
import { formatDistance, calculateDistance } from '../../utils/distance';
import { getStoresByVillage } from '../../utils/locationHelpers';
import DebugLocationSetter from '../../components/DebugLocationSetter';

const HomeScreen = ({ navigation }) => {
  const {
    userLocation,
    deliveryRadius,
    availableStores,
    loading,
    error,
    gpsEnabled,
    getCurrentLocation,
    updateDeliveryRadius,
    getVillageNameFromCoordinates,
  } = useLocation();
  const { addToCart } = useCart();
  const { getTopProducts } = useAnalytics();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [nearbyStores, setNearbyStores] = useState([]);
  const [randomProducts, setRandomProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [villageName, setVillageName] = useState('');

  useEffect(() => {
    // Use availableStores from context instead of local filtering
    setNearbyStores(availableStores);
  }, [availableStores]);

  // Update village name when location changes
  useEffect(() => {
    if (userLocation) {
      const fetchVillageName = async () => {
        const village = await getVillageNameFromCoordinates(userLocation);
        setVillageName(village || '');
      };
      fetchVillageName();
    } else {
      setVillageName('');
    }
  }, [userLocation, getVillageNameFromCoordinates]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await API.categoriesAPI.getCategories();
        if (response.success) {
          setCategories(response.data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products and update random products
  useEffect(() => {
    const fetchProducts = async () => {
      // For now, we'll use a simplified approach since we don't have an API to fetch all products
      // We'll generate random products from available stores
      try {
        // Generate random products based on available stores
        const randomStoreProducts = [];
        availableStores.forEach((store) => {
          // In a real implementation, we would fetch products for each store
          // For now, we'll create placeholder products
        });
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, [availableStores]);

  useEffect(() => {
    if (selectedCategory) {
      // In a real implementation, we would filter products by category
      // For now, we'll generate some random products
      const shuffled = allProducts
        .filter((p) => p.categoryId === selectedCategory.id)
        .sort(() => 0.5 - Math.random());
      setRandomProducts(shuffled.slice(0, 5));
    } else {
      const topProductData = getTopProducts(5);
      if (topProductData.length > 0) {
        const topProductIds = topProductData.map((p) => p.productId);
        // In a real implementation, we would get these products from the API
        const topProducts = allProducts.filter((p) => topProductIds.includes(p.id));
        setRandomProducts(topProducts);
      } else {
        // Fallback to random products if no analytics data
        const shuffled = allProducts.sort(() => 0.5 - Math.random());
        setRandomProducts(shuffled.slice(0, 5));
      }
    }
  }, [selectedCategory, getTopProducts, allProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getCurrentLocation();
    setRefreshing(false);
  };

  const handleStorePress = (store) => {
    navigation.navigate('StoreDetails', { storeId: store.id });
  };

  const handleCategoryPress = (category) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const filteredStores = nearbyStores.filter((store) => {
    const matchesSearch =
      searchQuery === '' || store.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || store.categoryId === selectedCategory.id;
    return matchesSearch && matchesCategory;
  });

  if (loading && !userLocation) {
    return <HomeScreenSkeleton />;
  }

  const renderProductsGrid = () => {
    if (randomProducts.length === 0) return null;

    const rows = [];
    for (let i = 0; i < randomProducts.length; i += 2) {
      rows.push(
        <View key={i} style={styles.productsRow}>
          <ProductCard
            key={randomProducts[i].id}
            product={randomProducts[i]}
            onPress={() =>
              navigation.navigate('StoreDetails', { storeId: randomProducts[i].storeId })
            }
            onAddToCart={addToCart}
            navigation={navigation}
          />
          {randomProducts[i + 1] && (
            <ProductCard
              key={randomProducts[i + 1].id}
              product={randomProducts[i + 1]}
              onPress={() =>
                navigation.navigate('StoreDetails', { storeId: randomProducts[i + 1].storeId })
              }
              onAddToCart={addToCart}
              navigation={navigation}
            />
          )}
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {userLocation
              ? villageName
                ? ` ${villageName}`
                : `موقعك الحالي: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
              : gpsEnabled
                ? 'تحديد الموقع...'
                : 'GPS غير متاح'}
          </Text>
        </View>

        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications-none" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="البحث في المحلات والمنتجات..."
        />
      </View>

      {/* Delivery Radius Selector */}
      {gpsEnabled && (
        <View style={styles.radiusContainer}>
          <RangeSelector
            value={deliveryRadius}
            onValueChange={updateDeliveryRadius}
            min={1}
            max={50}
            step={1}
            unit="كم"
            title="نطاق التوصيل"
          />
        </View>
      )}

      <FlatList
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        data={[{ key: 'content' }]}
        renderItem={() => (
          <View>
            {/* Debug Location Setter - Temporary for testing */}
            <DebugLocationSetter />
            
            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>الفئات</Text>
              <FlatList
                data={categories}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <CategoryCard
                    category={item}
                    isSelected={selectedCategory?.id === item.id}
                    onPress={() => handleCategoryPress(item)}
                  />
                )}
                contentContainerStyle={styles.categoriesList}
              />
            </View>

            {/* Stores Section Header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedCategory
                  ? `${selectedCategory.name} في منطقتك`
                  : `المتاجر المتاحة ${gpsEnabled ? `(داخل ${deliveryRadius} كم)` : ''}`}
              </Text>
              <Text style={styles.storesCountText}>{filteredStores.length} متجر</Text>
            </View>

            {/* Stores List */}
            {error ? (
              <EmptyState
                icon="error-outline"
                title="خطأ في تحميل البيانات"
                message={error}
                actionText="إعادة المحاولة"
                onActionPress={getCurrentLocation}
              />
            ) : filteredStores.length > 0 ? (
              <FlatList
                data={filteredStores}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <StoreCard
                    store={item}
                    onPress={() => handleStorePress(item)}
                    userLocation={userLocation}
                  />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.storesList}
              />
            ) : searchQuery || selectedCategory ? (
              <EmptyState
                icon="search"
                title="لا توجد نتائج"
                message={
                  searchQuery
                    ? `لا توجد متاجر تحتوي على "${searchQuery}"`
                    : 'لا توجد متاجر في هذه الفئة'
                }
                actionText="مسح البحث"
                onActionPress={() => {
                  setSearchQuery('');
                  setSelectedCategory(null);
                }}
              />
            ) : (
              <EmptyState
                icon="storefront"
                title="لا توجد متاجر"
                message={
                  gpsEnabled
                    ? `لا توجد متاجر متاحة في نطاق ${deliveryRadius} كم من موقعك`
                    : 'GPS غير متاح. يرجى تفعيل GPS لعرض المتاجر المتاحة'
                }
                actionText={gpsEnabled ? 'زيادة نطاق التوصيل' : 'تفعيل GPS'}
                onActionPress={() => {
                  if (gpsEnabled) {
                    updateDeliveryRadius(Math.min(deliveryRadius + 5, 20));
                  } else {
                    getCurrentLocation();
                  }
                }}
              />
            )}

            {/* Products Section */}
            {randomProducts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {selectedCategory
                    ? `منتجات من ${selectedCategory.name}`
                    : 'المنتجات الأكثر شراءً'}
                </Text>
                <View style={styles.productsGrid}>{renderProductsGrid()}</View>
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Orders')}>
                <MaterialIcons name="history" size={20} color={COLORS.primary} />
                <Text style={styles.actionText}>طلباتي</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Cart')}>
                <MaterialIcons name="shopping-cart" size={24} color={COLORS.primary} />
                <Text style={styles.actionText}>السلة</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.key}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    fontSize: SIZES.h6,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: SIZES.base,
    textAlign: 'right',
  },
  notificationButton: {
    padding: SIZES.base,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.card,
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.card,
  },
  radiusContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    backgroundColor: COLORS.card,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: SIZES.base,
    paddingVertical: SIZES.base,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.base,
  },
  sectionTitle: {
    fontSize: SIZES.h5,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'right',
  },
  storesCountText: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
    textAlign: 'right',
  },
  categoriesList: {
    paddingHorizontal: SIZES.padding,
  },
  storesList: {
    paddingHorizontal: SIZES.padding,
  },
  productsList: {
    paddingHorizontal: SIZES.padding,
  },
  productsGrid: {
    paddingHorizontal: SIZES.padding,
  },
  productsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.base,
  },
  quickActions: {
    flexDirection: 'row',
    padding: SIZES.padding,
    gap: SIZES.base,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.base,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  actionText: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: SIZES.base,
  },
});

export default HomeScreen;
