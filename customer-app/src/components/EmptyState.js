import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

const EmptyState = ({
  icon = 'document-outline',
  title = 'لا توجد بيانات',
  message = 'لا توجد عناصر لعرضها حالياً',
  actionText,
  onActionPress,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <View className="flex-1 items-center justify-center p-8">
        <View
          className="mb-4 h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: COLORS.border + '50' }}>
          <Ionicons name={icon} size={40} color={COLORS.textSecondary} />
        </View>

        <Text className="mb-2 text-center text-xl font-bold" style={{ color: COLORS.text }}>
          {title}
        </Text>

        <Text className="mb-6 text-center text-base" style={{ color: COLORS.textSecondary }}>
          {message}
        </Text>

        {actionText && onActionPress && (
          <TouchableOpacity
            onPress={onActionPress}
            className="rounded-xl px-6 py-3"
            style={{ backgroundColor: COLORS.primary }}>
            <Text className="font-medium text-white">{actionText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

export default EmptyState;
