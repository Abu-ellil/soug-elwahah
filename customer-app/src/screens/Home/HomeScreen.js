import React, { useState, useEffect, useCallback } from 'react';
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
import { STORES } from '../../data/stores';
import { CATEGORIES } from '../../data/categories';
import StoreCard from '../../components/StoreCard';
import CategoryCard from '../../components/CategoryCard';
import SearchBar from '../../components/SearchBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import VillagePicker from '../../components/VillagePicker';
import COLORS from '../../constants/colors';
import SIZES from '../../constants/sizes';
import HomeScreenSkeleton from '../../components/HomeScreenSkeleton';
import { formatDistance } from '../../utils/distance';
import { getStoresByVillage } from '../../utils/locationHelpers';

const HomeScreen = ({ navigation }) => {
  const {
    userLocation,
    selectedVillage,
    availableVillages,
    loading,
    error,
    getCurrentLocation,
    selectVillage,
  } = useLocation();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [villagePickerVisible, setVillagePickerVisible] = useState(false);
  const [nearbyStores, setNearbyStores] = useState([]);

  useEffect(() => {
    loadStores();
  }, [loadStores]);

  const loadStores = useCallback(() => {
    let stores = STORES;

    // Filter by selected village
    if (selectedVillage) {
      stores = getStoresByVillage(stores, selectedVillage.id);
    }

    // Calculate distances if user location is available
    if (userLocation) {
      stores = stores
        .map((store) => ({
          ...store,
          distance: userLocation ? calculateDistance(userLocation, store.coordinates) : 0,
        }))
        .sort((a, b) => a.distance - b.distance);
    }

    setNearbyStores(stores);
  }, [selectedVillage, userLocation]);

  const calculateDistance = (loc1, loc2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
    const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((loc1.lat * Math.PI) / 180) *
        Math.cos((loc2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

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
      navigation.navigate('CategoryStores', { categoryId: category.id });
    }
  };

  const handleLocationPress = () => {
    setVillagePickerVisible(true);
  };

  const handleVillageSelect = (village) => {
    selectVillage(village);
    setVillagePickerVisible(false);
  };

  const filteredStores = nearbyStores.filter((store) => {
    const matchesSearch =
      searchQuery === '' || store.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || store.categoryId === selectedCategory.id;
    return matchesSearch && matchesCategory;
  });

  if (loading && !userLocation && !selectedVillage) {
    return <HomeScreenSkeleton />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLocationPress} style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
          <Text style={styles.locationText} numberOfLines={1}>
            {selectedVillage?.name || 'اختر المنطقة'}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications-none" size={24} color={COLORS.text} />
          {availableVillages && availableVillages.length > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{availableVillages.length}</Text>
            </View>
          )}
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

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>الفئات</Text>
          <FlatList
            data={CATEGORIES}
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
              ? `${selectedCategory.name} في ${selectedVillage?.name || 'المنطقة المختارة'}`
              : 'المتاجر المتاحة'}
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
            renderItem={({ item }) => (
              <StoreCard
                store={item}
                onPress={() => handleStorePress(item)}
                userLocation={userLocation}
              />
            )}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.storesList}
          />
        ) : searchQuery || selectedCategory ? (
          <EmptyState
            icon="search-off"
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
            message="لا توجد متاجر متاحة في هذه المنطقة حالياً"
            actionText="تغيير المنطقة"
            onActionPress={handleLocationPress}
          />
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Orders')}>
            <MaterialIcons name="history" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>طلباتي</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Cart')}>
            <MaterialIcons name="shopping-cart" size={24} color={COLORS.primary} />
            <Text style={styles.actionText}>السلة</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Village Picker */}
      <VillagePicker
        visible={villagePickerVisible}
        onClose={() => setVillagePickerVisible(false)}
        onSelect={handleVillageSelect}
        currentLocation={userLocation}
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
