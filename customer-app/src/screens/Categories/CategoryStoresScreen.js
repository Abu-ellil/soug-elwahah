import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useLocation } from '../../context/LocationProvider';
import { STORES } from '../../data/stores';
import { CATEGORIES } from '../../data/categories';
import StoreCard from '../../components/StoreCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import COLORS from '../../constants/colors';

const CategoryStoresScreen = ({ route }) => {
  const navigation = useNavigation();
  const { currentVillage } = useLocation();
  const { categoryId } = route.params;

  const [refreshing, setRefreshing] = useState(false);

  // Get category info
  const category = useMemo(() => {
    return CATEGORIES.find((cat) => cat.id === categoryId);
  }, [categoryId]);

  // Filter stores by category
  const categoryStores = useMemo(() => {
    if (!category) return [];
    return STORES.filter((store) => store.categoryId === categoryId);
  }, [category, categoryId]);

  // Calculate store distances from current location
  const storesWithDistance = useMemo(() => {
    return categoryStores.map((store) => {
      let distance = null;
      if (currentVillage && store.coordinates && currentVillage.coordinates) {
        // Simple distance calculation (in a real app, you'd use proper distance calculation)
        const latDiff = Math.abs(store.coordinates.lat - currentVillage.coordinates.lat);
        const lngDiff = Math.abs(store.coordinates.lng - currentVillage.coordinates.lng);
        distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111; // Rough conversion to km
      }
      return { ...store, distance };
    });
  }, [categoryStores, currentVillage]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
    </View>
  );

  const renderStore = ({ item: store }) => (
    <StoreCard store={store} onPress={() => handleStorePress(store)} />
  );

  const renderEmpty = () => (
    <EmptyState
      icon="storefront-outline"
      title="لا توجد متاجر"
      description={`لا توجد متاجر متاحة في فئة ${category?.name || ''} حالياً`}
    />
  );

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
        data={storesWithDistance}
        renderItem={renderStore}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContainer,
          storesWithDistance.length === 0 && styles.emptyListContainer,
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
  errorText: {
    fontSize: 18,
    color: COLORS.danger,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default CategoryStoresScreen;
