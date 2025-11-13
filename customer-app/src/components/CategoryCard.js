import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

const CategoryCard = ({ category, isSelected, onPress }) => {
  const backgroundColor = isSelected ? category.color : COLORS.card;
  const textColor = isSelected ? 'white' : COLORS.text;
  const iconColor = isSelected ? 'white' : category.color;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="rounded-xl p-4 mx-2 items-center justify-center"
      style={{
        backgroundColor,
        minWidth: 80,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View
        className="w-12 h-12 rounded-full items-center justify-center mb-2"
        style={{
          backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : category.color + '20'
        }}
      >
        <Ionicons
          name={category.icon}
          size={24}
          color={iconColor}
        />
      </View>
      <Text
        className="text-sm font-medium text-center"
        style={{ color: textColor }}
        numberOfLines={2}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

export default CategoryCard;