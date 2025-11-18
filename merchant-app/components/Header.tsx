import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  onAdd: () => void;
}

export const Header = memo<HeaderProps>(({ onAdd }) => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>المنتجات</Text>
    <TouchableOpacity style={styles.addButton} onPress={onAdd}>
      <Ionicons name="add" size={24} color="white" />
    </TouchableOpacity>
  </View>
));

Header.displayName = 'Header';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    padding: 16,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
