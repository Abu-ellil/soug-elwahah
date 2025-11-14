import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { STORES } from '../../data/stores';
import { PRODUCTS } from '../../data/products';
import { CATEGORIES } from '../../data/categories';
import ProductCard from '../../components/ProductCard';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import COLORS from '../../constants/colors';
import SIZES from '../../constants/sizes';
import { formatDistance } from '../../utils/distance';
import StoreDetailsScreenSkeleton from '../../components/StoreDetailsScreenSkeleton';
import Toast from 'react-native-toast-message';
import { useCart } from '../../context/CartContext';

const StoreDetailsScreen = ({ navigation, route }) => {
  const { storeId } = route.params;
  const { getCartItemsCount, addToCart } = useCart();

  const [store, setStore] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      loadStoreData();
    }, [storeId])
  );

  const loadStoreData = async () => {
    setLoading(true);
    try {
      // Find store
      const foundStore = STORES.find(s => s.id === storeId);
      if (!foundStore) {
        Alert.alert('خطأ', 'المتجر غير موجود');
        navigation.goBack();
        return;
      }
      
      setStore(foundStore);
      
      // Get products for this store
      const products = PRODUCTS.filter(p => p.storeId === storeId);
      setStoreProducts(products);
      
      // Get store categories
      const storeCategories = CATEGORIES.filter(cat =>
        products.some(p => p.categoryId === cat.id)
      );
      setCategories(storeCategories);
      
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: 'فشل في تحميل بيانات المتجر',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? storeProducts.filter(product => product.categoryId === selectedCategory.id)
    : storeProducts;

  const handleCategoryPress = (category) => {
    setSelectedCategory(
      selectedCategory?.id === category.id ? null : category
    );
  };

  const handleAddToCart = (product, quantity = 1) => {
    try {
      addToCart(product, quantity);
      Toast.show({
        type: 'success',
        text1: 'تم الإضافة',
        text2: `تم إضافة ${product.name} إلى السلة`,
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: 'فشل في إضافة المنتج إلى السلة',
      });
    }
  };

  const handleStoreInfoPress = () => {
    // Navigate to store info screen (could be implemented later)
    console.log('Store info pressed');
  };

  if (loading) {
    return <StoreDetailsScreenSkeleton />;
  }

  if (!store) {
    return (
      <EmptyState
        icon="store"
        title="المتجر غير موجود"
        message="عذراً، هذا المتجر غير متاح"
        actionText="العودة"
        onActionPress={() => navigation.goBack()}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Store Header */}
      <View style={styles.storeHeader}>
        <Image source={{ uri: store.image }} style={styles.storeImage} />
        <View style={styles.overlay}>
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{store.name}</Text>
            <View style={styles.storeDetails}>
              <View style={styles.detailItem}>
                <Icon name="star" size={16} color={COLORS.warning} />
                <Text style={styles.detailText}>{store.rating}</Text>
              </View>
              <View style={styles.detailItem}>
                <Icon name="access-time" size={16} color={COLORS.card} />
                <Text style={styles.detailText}>{store.deliveryTime}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: store.isOpen ? COLORS.success : COLORS.danger }
              ]}>
                <Text style={styles.statusText}>
                  {store.isOpen ? 'مفتوح' : 'مغلق'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Header */}
      <Header 
        title={store.name}
        showBack
        onLeftPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <Icon name="shopping-cart" size={24} color={COLORS.text} />
            {getCartItemsCount() > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.badgeText}>{getCartItemsCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Store Categories */}
        {categories.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>الفئات</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesList}
            >
              <TouchableOpacity
                style={[
                  styles.categoryButton,
                  !selectedCategory && styles.categoryButtonActive
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  !selectedCategory && styles.categoryButtonTextActive
                ]}>
                  الكل
                </Text>
              </TouchableOpacity>
              
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory?.id === category.id && styles.categoryButtonActive
                  ]}
                  onPress={() => handleCategoryPress(category)}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    selectedCategory?.id === category.id && styles.categoryButtonTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory ? selectedCategory.name : 'جميع المنتجات'}
            </Text>
            <Text style={styles.productCount}>
              {filteredProducts.length} منتج
            </Text>
          </View>

          {filteredProducts.length > 0 ? (
            <FlatList
              data={filteredProducts}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => console.log('Product pressed:', item.name)}
                  onAddToCart={(product) => handleAddToCart(product)}
                />
              )}
              keyExtractor={(item) => item.id}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
              columnWrapperStyle={styles.productsRow}
            />
          ) : (
            <EmptyState
              icon="inventory"
              title="لا توجد منتجات"
              message={
                selectedCategory ?
                  `لا توجد منتجات في فئة ${selectedCategory.name}` :
                  'لا توجد منتجات متاحة حالياً'
              }
            />
          )}
        </View>

        {/* Store Info */}
        <TouchableOpacity style={styles.storeInfoCard} onPress={handleStoreInfoPress}>
          <View style={styles.storeInfoHeader}>
            <Text style={styles.storeInfoTitle}>معلومات المتجر</Text>
            <Icon name="info" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.storeInfoText}>
            متجر متخصص في {categories.map(c => c.name).join('، ')}
          </Text>
          <Text style={styles.storeInfoText}>
            وقت التوصيل: {store.deliveryTime}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Cart Button */}
      {getCartItemsCount() > 0 && (
        <TouchableOpacity
          style={styles.floatingCartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Icon name="shopping-cart" size={24} color={COLORS.white} />
          <View style={styles.floatingCartBadge}>
            <Text style={styles.floatingCartBadgeText}>
              {getCartItemsCount()}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  storeHeader: {
    position: 'relative',
    height: 200,
  },
  storeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  storeInfo: {
    padding: SIZES.padding,
  },
  storeName: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.card,
    marginBottom: SIZES.base,
    textAlign: 'right',
  },
  storeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: SIZES.base,
    marginBottom: SIZES.base / 2,
  },
  detailText: {
    fontSize: SIZES.body3,
    color: COLORS.card,
    marginLeft: 4,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.base / 2,
  },
  statusText: {
    fontSize: SIZES.caption,
    fontWeight: 'bold',
    color: COLORS.card,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: SIZES.base,
    backgroundColor: COLORS.card,
  },
  sectionTitle: {
    fontSize: SIZES.h6,
    fontWeight: 'bold',
    color: COLORS.text,
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.base,
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.base,
  },
  productCount: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
    textAlign: 'right',
  },
  categoriesList: {
    paddingHorizontal: SIZES.padding,
    paddingBottom: SIZES.base,
  },
  categoryButton: {
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    marginRight: SIZES.base,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.lightGray,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: SIZES.body3,
    color: COLORS.gray,
    textAlign: 'center',
  },
  categoryButtonTextActive: {
    color: COLORS.card,
    fontWeight: 'bold',
  },
  productsList: {
    paddingHorizontal: SIZES.padding,
  },
  productsRow: {
    justifyContent: 'space-between',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
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
  storeInfoCard: {
    margin: SIZES.padding,
    padding: SIZES.padding,
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
  },
  storeInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  storeInfoTitle: {
    fontSize: SIZES.h6,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'right',
  },
  storeInfoText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginBottom: 4,
    textAlign: 'right',
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  floatingCartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingCartBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default StoreDetailsScreen;
