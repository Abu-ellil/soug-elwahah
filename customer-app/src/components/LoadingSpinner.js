import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import COLORS from '../constants/colors';

const LoadingSpinner = ({
  size = 'large',
  color = COLORS.primary,
  text = 'جاري التحميل...',
  fullScreen = false,
}) => {
  const containerClass = fullScreen
    ? 'flex-1 items-center justify-center'
    : 'items-center justify-center py-8';

  return (
    <View className={containerClass}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text className="mt-4 text-base" style={{ color: COLORS.textSecondary }}>
          {text}
        </Text>
      )}
    </View>
  );
};

export default LoadingSpinner;
