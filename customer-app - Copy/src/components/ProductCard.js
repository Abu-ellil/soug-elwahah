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
      className="mx-2 my-2 overflow-hidden rounded-xl bg-white shadow-sm"
      style={{
        width: 160,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
      <View className="relative">
        <Image source={{ uri: product.image }} className="h-24 w-full" resizeMode="cover" />
        {!product.isAvailable && (
          <View className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <Text className="text-sm font-bold text-white">غير متوفر</Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <Text className="mb-1 text-sm font-bold" style={{ color: COLORS.text }} numberOfLines={2}>
          {product.name}
        </Text>

        <Text
          className="mb-2 text-lg font-bold"
          style={{ color: COLORS.primary }}
          numberOfLines={1}
          ellipsizeMode="tail">
          {formatPrice(product.price)}
        </Text>

        {product.isAvailable ? (
          <TouchableOpacity
            onPress={handleAddToCart}
            className="flex-row items-center justify-center rounded-lg py-2"
            style={{ backgroundColor: COLORS.primary }}>
            <Ionicons name="add" size={16} color="white" />
            <Text className="mr-1 text-sm font-medium text-white">أضف للسلة</Text>
          </TouchableOpacity>
        ) : (
          <View
            className="flex-row items-center justify-center rounded-lg py-2"
            style={{ backgroundColor: COLORS.border }}>
            <Text
              className="text-sm font-medium"
              style={{ color: COLORS.textSecondary }}
              numberOfLines={1}
              ellipsizeMode="tail">
              غير متوفر
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
