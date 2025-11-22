import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocation } from '../../context/LocationProvider';
import StoreCard from '../../components/StoreCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import RangeSelector from '../../components/RangeSelector';
import COLORS from '../../constants/colors';
import { calculateDistance } from '../../utils/distance';
import { API } from '../../services/api';

const CategoryStoresScreen = ({ route }) => {
  const navigation = useNavigation();
  const { userLocation, deliveryRadius, availableStores, gpsEnabled, updateDeliveryRadius } =
    useLocation();
  const { categoryId } = route.params;

  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch category info from API
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await API.categoriesAPI.getCategories();
        if (response.success) {
          const foundCategory = response.data.categories.find((cat) => cat.id === categoryId);
          setCategory(foundCategory);
        }
      } catch (error) {
        console.error('Error fetching category:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId]);

  // Filter stores by category and location
  const categoryStores = useMemo(() => {
    if (!category) return [];

    return availableStores.filter((store) => store.categoryId === categoryId);
  }, [category, categoryId, availableStores]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Refresh categories
      const response = await API.categoriesAPI.getCategories();
      if (response.success) {
        const foundCategory = response.data.categories.find((cat) => cat.id === categoryId);
        setCategory(foundCategory);
      }
    } catch (error) {
      console.error('Error refreshing categories:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleStorePress = (store) => {
    navigation.navigate('StoreDetails', { storeId: store.id });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>المتاجر</Text>
      </View>

      {category && (
        <View style={styles.categoryInfo}>
          <View style={[styles.categoryIcon, { backgroundColor: category.color }]}>
            <Ionicons name={category.icon} size={24} color="white" />
          </View>
          <View style={styles.categoryDetails}>
            <Text style={styles.categoryName}>{category.name}</Text>
            <Text style={styles.storeCount}>{categoryStores.length} متجر متاح</Text>
          </View>
        </View>
      )}

      {/* Radius Selector Removed */}
    </View>
  );

  const renderStore = ({ item: store }) => (
    <StoreCard store={store} onPress={() => handleStorePress(store)} />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="storefront-outline"
      title="لا توجد متاجر"
      message={`لا توجد متاجر متاحة في فئة ${category?.name || ''}`}
    />
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!category) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>فئة غير موجودة</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categoryStores}
        renderItem={renderStore}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContainer,
          categoryStores.length === 0 && styles.emptyListContainer,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: 'white',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  storeCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  listContainer: {
    paddingVertical: 16,
  },
  emptyListContainer: {
    flex: 1,
  },
  radiusContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default CategoryStoresScreen;
