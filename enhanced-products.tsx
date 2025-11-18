
import React, { memo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface ProductCardProps {
  product: Product;
  onToggleAvailability: (id: string) => void;
  onDelete: (id: string) => void;
  index: number;
}

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 48) / 2; // Account for padding and gap

export const ProductCard = memo<ProductCardProps>(({ 
  product, 
  onToggleAvailability, 
  onDelete, 
  index 
}) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleDelete = useCallback(() => {
    Alert.alert('حذف المنتج', 'هل أنت متأكد أنك تريد حذف هذا المنتج؟', [
      { text: 'إلغاء', style: 'cancel' },
      { 
        text: 'حذف', 
        style: 'destructive', 
        onPress: () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          onDelete(product._id);
        }
      },
    ]);
  }, [product._id, onDelete]);

  const handleToggleAvailability = useCallback(() => {
    Haptics.selectionAsync();
    onToggleAvailability(product._id);
  }, [product._id, onToggleAvailability]);

  const handleEdit = useCallback(() => {
    Haptics.selectionAsync();
    router.push(`/product-form?id=${product._id}`);
  }, [router, product._id]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoading(false);
  }, []);

  return (
    <View style={[styles.card, { width: CARD_WIDTH }]} accessibilityLabel={`منتج ${product.name}`}>
      <View style={styles.cardContent}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {imageLoading && (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={32} color="#D1D5DB" />
            </View>
          )}
          {product.image && !imageError ? (
            <Image
              source={{ uri: product.image }}
              style={styles.productImage}
              onLoad={handleImageLoad}
              onError={handleImageError}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="cube-outline" size={32} color="#D1D5DB" />
            </View>
          )}
          
          {/* Availability Badge */}
          <View style={[styles.badge, product.isAvailable ? styles.available : styles.unavailable]}>
            <Text style={styles.badgeText}>
              {product.isAvailable ? 'متوفر' : 'غير متوفر'}
            </Text>
          </View>
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
          <Text style={styles.price}>{product.price} ج.م</Text>
          <Text style={styles.stock}>المخزون: {product.stock}</Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <ActionButton
            icon="create-outline"
            color="#F59E0B"
            onPress={handleEdit}
            label="تعديل"
          />
          <ActionButton
            icon={product.isAvailable ? "eye-off-outline" : "eye-outline"}
            color="#8B5CF6"
            onPress={handleToggleAvailability}
            label={product.isAvailable ? "إخفاء" : "إظهار"}
          />
          <ActionButton
            icon="trash-outline"
            color="#EF4444"
            onPress={handleDelete}
            label="حذف"
          />
        </View>
      </View>
    </View>
  );
});

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
  label: string;
}

const ActionButton = memo<ActionButtonProps>(({ icon, color, onPress, label }) => (
  <TouchableOpacity 
    style={[styles.actionButton, { backgroundColor: color }]} 
    onPress={onPress}
    accessibilityLabel={label}
  >
    <Ionicons name={icon} size={16} color="white" />
  </TouchableOpacity>
));

// Loading Skeleton Component
const ProductCardSkeleton = memo(() => (
  <View style={[styles.card, { width: CARD_WIDTH }]}>
    <View style={styles.cardContent}>
      <View style={styles.skeletonImage} />
      <View style={styles.skeletonText} />
      <View style={[styles.skeletonText, { width: '60%' }]} />
      <View style={styles.skeletonText} />
      <View style={styles.actions}>
        <View style={[styles.actionButton, { backgroundColor: '#E5E7EB' }]} />
        <View style={[styles.actionButton, { backgroundColor: '#E5E7EB' }]} />
        <View style={[styles.actionButton, { backgroundColor: '#E5E7EB' }]} />
      </View>
    </View>
  </View>
));

interface EmptyStateProps {
  isLoading: boolean;
  hasApprovedStore: boolean;
  isConnected: boolean;
  error: string | null;
  onCreateStore: () => void;
  onRetry: () => void;
}

export const EmptyState = memo<EmptyStateProps>(({ 
  isLoading, 
  hasApprovedStore, 
  isConnected, 
  error,
  onCreateStore, 
  onRetry 
}) => {
  if (isLoading) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 6 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="warning-outline" size={60} color="#F59E0B" />
        <Text style={styles.emptyTitle}>حدث خطأ</Text>
        <Text style={styles.emptySubtitle}>{error}</Text>
        {isConnected && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryButtonText}>إعادة المحاولة</Text>
          </TouchableOpacity>
        )}
        {!isConnected && (
          <Text style={styles.connectionText}>تحقق من اتصال الإنترنت</Text>
        )}
      </View>
    );
  }

  if (!hasApprovedStore) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="storefront-outline" size={60} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>لا توجد متاجر معتمدة</Text>
        <Text style={styles.emptySubtitle}>يجب أن يكون متجرك معتمدًا من الإدارة أولاً</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={onCreateStore}>
          <Text style={styles.primaryButtonText}>إنشاء متجر</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.emptyState}>
      <Ionicons name="cube-outline" size={60} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>لا توجد منتجات</Text>
      <Text style={styles.emptySubtitle}>اضغط على زر الإضافة لإضافة منتج جديد</Text>
    </View>
  );
});

// Enhanced Header with Search and Filter
interface HeaderProps {
  onAdd: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}

export const Header = memo<HeaderProps>(({ 
  onAdd, 
  searchQuery, 
  onSearchChange,
  categories,
  selectedCategory,
  onCategoryChange 
}) => {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>المنتجات</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.searchButton} 
            onPress={() => setShowSearch(!showSearch)}
            accessibilityLabel="البحث"
          >
            <Ionicons name="search" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={onAdd} accessibilityLabel="إضافة منتج">
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="البحث في المنتجات..."
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholderTextColor="#9CA3AF"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange('')}>
                <Ionicons name="close-circle" size={18} color="#6B7280" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Category Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoryContainer}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipSelected
                ]}
                onPress={() => onCategoryChange(category === 'all' ? null : category)}
              >
                <Text style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextSelected
                ]}>
                  {category === 'all' ? 'الكل' : category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
});

// ========================================
// Enhanced Main Screen
// ========================================
import { FlatList, RefreshControl, TextInput, ScrollView } from 'react-native';

const ProductsScreen = () => {
  const router = useRouter();
  const {
    filteredProducts,
    isLoading,
    refreshing,
    hasApprovedStore,
    error,
    isConnected,
    searchQuery,
    selectedCategory,
    categories,
    handleRefresh,
    deleteProduct,
    toggleAvailability,
    searchProducts,
    filterByCategory,
    retryOperation,
  } = useProducts();

  const renderProduct = useCallback(({ item, index }: { item: Product; index: number }) => (
    <ProductCard
      product={item}
      onToggleAvailability={toggleAvailability}
      onDelete={deleteProduct}
      index={index}
    />
  ), [toggleAvailability, deleteProduct]);

  const keyExtractor = useCallback((item: Product) => item._id, []);

  const getItemLayout = useCallback((data: any, index: number) => ({
    length: 280, // Card height
    offset: 280 * index,
    index,
  }), []);

  return (
    <View style={styles.container}>
      <Header
        onAdd={() => router.push('/product-form')}
        searchQuery={searchQuery}
        onSearchChange={searchProducts}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={filterByCategory}
      />
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        getItemLayout={getItemLayout}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={8}
        windowSize={10}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
        ListEmptyComponent={
          <EmptyState
            isLoading={isLoading}
            hasApprovedStore={hasApprovedStore}
            isConnected={isConnected}
            error={error}
            onCreateStore={() => router.push('/welcome')}
            onRetry={retryOperation}
          />
        }
        ListHeaderComponent={
          error && isConnected ? (
            <TouchableOpacity style={styles.errorBanner} onPress={retryOperation}>
              <Ionicons name="refresh" size={16} color="white" />
              <Text style={styles.errorBannerText}>اضغط لإعادة المحاولة</Text>
            </TouchableOpacity>
          ) : null
        }
      />
    </View>
  );
};

// ========================================
// Enhanced Styles
// ========================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingTop: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  searchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'right',
  },
  categoryContainer: {
    flexDirection: 'row',
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 8,
  },
  categoryChipSelected: {
    backgroundColor: 'white',
  },
  categoryText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: '#3B82F6',
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    padding: 12,
  },
  imageContainer: {
    position: 'relative',
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  available: {
    backgroundColor: '#D1FAE5',
  },
  unavailable: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#1F2937',
  },
  productInfo: {
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  description: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 14,
  },
  price: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 2,
  },
  stock: {
    fontSize: 10,
    color: '#10B981',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonText: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 4,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  retryButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 16,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  connectionText: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 8,
    textAlign: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    gap: 8,
  },
  errorBannerText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
  },
});

export default ProductsScreen;
