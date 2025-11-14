import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

const EmptyState = ({
  icon = "document-outline",
  title = "لا توجد بيانات",
  message = "لا توجد عناصر لعرضها حالياً",
  actionText,
  onActionPress
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
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
          style={{ backgroundColor: COLORS.border + '50' }}
        >
          <Ionicons name={icon} size={40} color={COLORS.textSecondary} />
        </View>

        <Text
          className="text-xl font-bold text-center mb-2"
          style={{ color: COLORS.text }}
        >
          {title}
        </Text>

        <Text
          className="text-base text-center mb-6"
          style={{ color: COLORS.textSecondary }}
        >
          {message}
        </Text>

        {actionText && onActionPress && (
          <TouchableOpacity
            onPress={onActionPress}
            className="px-6 py-3 rounded-xl"
            style={{ backgroundColor: COLORS.primary }}
          >
            <Text className="text-white font-medium">
              {actionText}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

export default EmptyState;