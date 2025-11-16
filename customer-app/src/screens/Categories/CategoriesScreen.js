import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { CATEGORIES } from '../../data/categories';
import CategoryCard from '../../components/CategoryCard';
import SearchBar from '../../components/SearchBar';
import COLORS from '../../constants/colors';
import SIZES from '../../constants/sizes';

const CategoriesScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) {
      return CATEGORIES;
    }
    return CATEGORIES.filter(category =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleCategoryPress = (category) => {
    navigation.navigate('Home', {
      screen: 'CategoryStores',
      params: { categoryId: category.id }
    });
  };

  const renderCategory = ({ item: category }) => (
    <CategoryCard
      category={category}
      onPress={() => handleCategoryPress(category)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="grid" size={32} color={COLORS.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>الفئات</Text>
            <Text style={styles.headerSubtitle}>اختر الفئة التي تريدها</Text>
          </View>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="البحث في الفئات..."
        />
      </View>

      <View style={styles.content}>
        {filteredCategories.length > 0 ? (
          <FlatList
            data={filteredCategories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              searchQuery ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{`لا توجد فئات تحتوي على "${searchQuery}"`}</Text>
                </View>
              ) : null
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>لا توجد فئات متاحة</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  header: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default CategoriesScreen;