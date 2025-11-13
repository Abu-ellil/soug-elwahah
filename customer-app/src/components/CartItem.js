import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';
import COLORS from '../constants/colors';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleIncrease = () => {
    updateQuantity(item.productId, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.productId, item.quantity - 1);
    } else {
      removeFromCart(item.productId);
    }
  };

  const handleRemove = () => {
    removeFromCart(item.productId);
  };

  return (
    <View className="bg-white rounded-xl p-4 mx-4 my-2 flex-row items-center">
      <Image
        source={{ uri: item.image }}
        className="w-16 h-16 rounded-lg mr-4"
        resizeMode="cover"
      />

      <View className="flex-1">
        <Text
          className="text-base font-bold mb-1"
          style={{ color: COLORS.text }}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        <Text
          className="text-lg font-bold"
          style={{ color: COLORS.primary }}
        >
          {formatPrice(item.price)}
        </Text>
      </View>

      <View className="flex-row items-center">
        <TouchableOpacity
          onPress={handleDecrease}
          className="w-8 h-8 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: COLORS.border }}
        >
          <Ionicons name="remove" size={16} color={COLORS.text} />
        </TouchableOpacity>

        <Text
          className="text-lg font-bold mx-3 min-w-8 text-center"
          style={{ color: COLORS.text }}
        >
          {item.quantity}
        </Text>

        <TouchableOpacity
          onPress={handleIncrease}
          className="w-8 h-8 rounded-full items-center justify-center mr-2"
          style={{ backgroundColor: COLORS.primary }}
        >
          <Ionicons name="add" size={16} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleRemove}
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: COLORS.danger + '20' }}
        >
          <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartItem;