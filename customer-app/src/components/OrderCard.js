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
      className="mx-4 my-2 rounded-xl bg-white p-4 shadow-sm"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-lg font-bold" style={{ color: COLORS.text }}>
          طلب #{order.id.slice(-4)}
        </Text>
        <View className="rounded-full px-3 py-1" style={{ backgroundColor: statusColor + '20' }}>
          <Text className="text-sm font-medium" style={{ color: statusColor }}>
            {statusText}
          </Text>
        </View>
      </View>

      <View className="mb-2 flex-row items-center">
        <Ionicons name="storefront-outline" size={16} color={COLORS.textSecondary} />
        <Text className="mr-2 text-sm" style={{ color: COLORS.textSecondary }}>
          {order.storeName || 'اسم المحل'}
        </Text>
      </View>

      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Ionicons name="cube-outline" size={16} color={COLORS.textSecondary} />
          <Text className="mr-2 text-sm" style={{ color: COLORS.textSecondary }}>
            {order.items?.length || 0} منتج
          </Text>
        </View>
        <Text className="text-lg font-bold" style={{ color: COLORS.primary }}>
          {formatPrice(order.total)}
        </Text>
      </View>

      <View className="flex-row items-center">
        <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
        <Text className="mr-2 text-sm" style={{ color: COLORS.textSecondary }}>
          {formatDate(order.createdAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default OrderCard;
