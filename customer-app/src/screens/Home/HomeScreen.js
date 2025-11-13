import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../../context/LocationContext';
import { CATEGORIES } from '../../data';
import StoreCard from '../../components/StoreCard';
import CategoryCard from '../../components/CategoryCard';
import SearchBar from '../../components/SearchBar';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import COLORS from '../../constants/colors';

const HomeScreen = ({ navigation }) => {
  const {
    currentVillage,
    nearbyStores,
    isLoading: locationLoading,
    error: locationError,
    getCurrentLocation
  } = useLocation();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (!currentVillage && !locationLoading) {
      getCurrentLocation();
    }
  }, [currentVillage, locationLoading]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getCurrentLocation();
    setRefreshing(false);
  };

  const handleStorePress = (store) => {
    navigation.navigate('StoreDetails', { store });
  };

  const handleCategoryPress = (category) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
      navigation.navigate('CategoryStores', { category });
    }
  };

  const handleLocationPress = () => {
    // Navigate to location selection screen
    // For now, just refresh location
    getCurrentLocation();
  };

  const filteredStores = nearbyStores.filter(store => {
    if (searchQuery) {
      return store.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  if (locationLoading && !currentVillage) {
    return <LoadingSpinner fullScreen text="جاري تحديد موقعك..." />;
  }

  if (locationError) {
    return (
      <EmptyState
        icon="location-outline"
        title="خطأ في تحديد الموقع"
        message="يرجى السماح بالوصول للموقع لعرض المحلات القريبة"
        actionText="إعادة المحاولة"
        onActionPress={getCurrentLocation}
      />
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity
            onPress={handleLocationPress}
            className="flex-row items-center"
          >
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />
            <Text className="text-lg font-bold mr-2" style={{ color: COLORS.text }}>
              {currentVillage?.name || 'تحديد الموقع'}
            </Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="البحث في المحلات والمنتجات..."
        />
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Categories */}
        <View className="px-4 py-4">
          <Text className="text-lg font-bold mb-3" style={{ color: COLORS.text }}>
            الفئات
          </Text>
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
            ItemSeparatorComponent={() => <View className="w-2" />}
          />
        </View>

        {/* Nearby Stores */}
        <View className="px-4 pb-4">
          <Text className="text-lg font-bold mb-3" style={{ color: COLORS.text }}>
            المحلات القريبة منك
          </Text>

          {filteredStores.length > 0 ? (
            filteredStores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onPress={() => handleStorePress(store)}
              />
            ))
          ) : (
            <EmptyState
              icon="storefront-outline"
              title="لا توجد محلات"
              message="لا توجد محلات متاحة في منطقتك حالياً"
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeScreen;