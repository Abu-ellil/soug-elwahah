import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';
import SIZES from '../constants/sizes';

const Header = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  showBack = false,
  children,
}) => {
  return (
    <SafeAreaView className="border-b bg-white" style={{ borderBottomColor: COLORS.border }}>
      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={{ height: SIZES.headerHeight }}>
        <View className="flex-row items-center">
          {showBack && (
            <TouchableOpacity
              onPress={onLeftPress}
              className="mr-2 h-10 w-10 items-center justify-center rounded-full">
              <Ionicons name="arrow-back" size={24} color={COLORS.text} />
            </TouchableOpacity>
          )}
          {leftIcon && !showBack && (
            <TouchableOpacity
              onPress={onLeftPress}
              className="mr-2 h-10 w-10 items-center justify-center rounded-full">
              <Ionicons name={leftIcon} size={24} color={COLORS.text} />
            </TouchableOpacity>
          )}
          <Text className="text-xl font-bold" style={{ color: COLORS.text }}>
            {title}
          </Text>
        </View>

        <View className="flex-row items-center">
          {children}
          {rightIcon && (
            <TouchableOpacity
              onPress={onRightPress}
              className="ml-2 h-10 w-10 items-center justify-center rounded-full">
              <Ionicons name={rightIcon} size={24} color={COLORS.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Header;
