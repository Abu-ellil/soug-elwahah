import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatPrice, getStatusColor, getStatusText } from '../utils/helpers';
import COLORS from '../constants/colors';

const OrderCard = ({ order, onPress }) => {
  const statusColor = getStatusColor(order.status);
  const statusText = getStatusText(order.status);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-xl shadow-sm mx-4 my-2 p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text
          className="text-lg font-bold"
          style={{ color: COLORS.text }}
        >
          طلب #{order.id.slice(-4)}
        </Text>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: statusColor + '20' }}
        >
          <Text
            className="text-sm font-medium"
            style={{ color: statusColor }}
          >
            {statusText}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-2">
        <Ionicons name="storefront-outline" size={16} color={COLORS.textSecondary} />
        <Text
          className="text-sm mr-2"
          style={{ color: COLORS.textSecondary }}
        >
          {order.storeName || 'اسم المحل'}
        </Text>
      </View>

      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Ionicons name="cube-outline" size={16} color={COLORS.textSecondary} />
          <Text
            className="text-sm mr-2"
            style={{ color: COLORS.textSecondary }}
          >
            {order.items?.length || 0} منتج
          </Text>
        </View>
        <Text
          className="text-lg font-bold"
          style={{ color: COLORS.primary }}
        >
          {formatPrice(order.total)}
        </Text>
      </View>

      <View className="flex-row items-center">
        <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
        <Text
          className="text-sm mr-2"
          style={{ color: COLORS.textSecondary }}
        >
          {formatDate(order.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default OrderCard;