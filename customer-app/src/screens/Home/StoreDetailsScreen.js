import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useCart } from '../../context/CartContext';
import { PRODUCTS, CATEGORIES } from '../../data';
import ProductCard from '../../components/ProductCard';
import Header from '../../components/Header';
import { formatDistance } from '../../utils/distance';
import COLORS from '../../constants/colors';

const { width } = Dimensions.get('window');

const StoreDetailsScreen = ({ navigation }) => {
  const route = useRoute();
  const { store } = route.params;
  const { getCartItemsCount } = useCart();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [storeProducts, setStoreProducts] = useState([]);

  useEffect(() => {
    // Get products for this store
    const products = PRODUCTS.filter(product => product.storeId === store.id);
    setStoreProducts(products);
  }, [store.id]);

  const filteredProducts = selectedCategory
    ? storeProducts.filter(product => product.categoryId === selectedCategory.id)
    : storeProducts;

  const storeCategories = CATEGORIES.filter(category =>
    storeProducts.some(product => product.categoryId === category.id)
  );

  const handleCategoryPress = (category) => {
    setSelectedCategory(selectedCategory?.id === category.id ? null : category);
  };

  const handleProductPress = (product) => {
    // Could navigate to product details
    console.log('Product pressed:', product.name);
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  return (
    <View className="flex-1 bg-white">
      {/* Store Header Image */}
      <View className="relative">
        <Image
          source={{ uri: store.image }}
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black bg-opacity-30" />
        <View className="absolute bottom-4 right-4 left-4">
          <Text className="text-white text-2xl font-bold mb-1">
            {store.name}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text className="text-white mr-1">{store.rating}</Text>
            <Text className="text-white mx-2">•</Text>
            <Ionicons name="location-outline" size={16} color="white" />
            <Text className="text-white mr-1">
              {store.distance ? formatDistance(store.distance) : 'غير محدد'}
            </Text>
            <Text className="text-white mx-2">•</Text>
            <Ionicons name="time-outline" size={16} color="white" />
            <Text className="text-white mr-1">{store.deliveryTime}</Text>
          </View>
        </View>
      </View>

      {/* Header */}
      <Header
        showBack
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView className="flex-1">
        {/* Categories Tabs */}
        <View className="px-4 py-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            <TouchableOpacity
              onPress={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full mr-2 ${
                !selectedCategory ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <Text
                className={`font-medium ${
                  !selectedCategory ? 'text-white' : 'text-gray-700'
                }`}
              >
                الكل
              </Text>
            </TouchableOpacity>
            {storeCategories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategoryPress(category)}
                className={`px-4 py-2 rounded-full mr-2 ${
                  selectedCategory?.id === category.id ? 'bg-primary' : 'bg-gray-200'
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectedCategory?.id === category.id ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View className="px-4 pb-20">
          {filteredProducts.length > 0 ? (
            <FlatList
              data={filteredProducts}
              numColumns={2}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ProductCard
                  product={item}
                  onPress={() => handleProductPress(item)}
                />
              )}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              ItemSeparatorComponent={() => <View className="h-4" />}
            />
          ) : (
            <View className="items-center py-8">
              <Text className="text-gray-500 text-center">
                لا توجد منتجات في هذه الفئة
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Cart Button */}
      {getCartItemsCount() > 0 && (
        <TouchableOpacity
          onPress={handleCartPress}
          className="absolute bottom-20 right-4 w-14 h-14 rounded-full items-center justify-center shadow-lg"
          style={{
            backgroundColor: COLORS.primary,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          <Ionicons name="basket" size={24} color="white" />
          <View className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center">
            <Text className="text-white text-xs font-bold">
              {getCartItemsCount()}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default StoreDetailsScreen;