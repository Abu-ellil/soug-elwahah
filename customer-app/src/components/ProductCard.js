import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import COLORS from '../constants/colors';

const ProductCard = ({ product, onPress }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product, 1);
    // يمكن إضافة animation هنا
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl shadow-sm mx-2 my-2 overflow-hidden"
      style={{
        width: 160,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="relative">
        <Image
          source={{ uri: product.image }}
          className="w-full h-24"
          resizeMode="cover"
        />
        {!product.isAvailable && (
          <View className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Text className="text-white font-bold text-sm">غير متوفر</Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <Text
          className="text-sm font-bold mb-1"
          style={{ color: COLORS.text }}
          numberOfLines={2}
        >
          {product.name}
        </Text>

        <Text
          className="text-lg font-bold mb-2"
          style={{ color: COLORS.primary }}
        >
          {formatPrice(product.price)}
        </Text>

        {product.isAvailable ? (
          <TouchableOpacity
            onPress={handleAddToCart}
            className="rounded-lg py-2 flex-row items-center justify-center"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Ionicons name="add" size={16} color="white" />
            <Text className="text-white font-medium text-sm mr-1">
              أضف للسلة
            </Text>
          </TouchableOpacity>
        ) : (
          <View
            className="rounded-lg py-2 flex-row items-center justify-center"
            style={{ backgroundColor: COLORS.border }}
          >
            <Text
              className="text-sm font-medium"
              style={{ color: COLORS.textSecondary }}
            >
              غير متوفر
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;