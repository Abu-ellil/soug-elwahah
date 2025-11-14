import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'البحث في المحلات والمنتجات...',
  onClear,
}) => {
  const handleClear = () => {
    onChangeText('');
    onClear && onClear();
  };

  return (
    <View className="mx-4 my-2 flex-row items-center rounded-xl bg-white px-4 py-3 shadow-sm">
      <Ionicons name="search" size={20} color={COLORS.textSecondary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textSecondary}
        className="mr-3 flex-1 text-base"
        style={{ color: COLORS.text, textAlign: 'right' }}
        returnKeyType="search"
      />
      {value ? (
        <TouchableOpacity onPress={handleClear}>
          <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SearchBar;
