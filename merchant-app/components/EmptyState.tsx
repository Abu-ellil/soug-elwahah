import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface EmptyStateProps {
  isLoading: boolean;
  hasApprovedStore: boolean;
  onCreateStore: () => void;
}

export const EmptyState = memo<EmptyStateProps>(({ isLoading, hasApprovedStore, onCreateStore }) => {
  if (isLoading) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>جاري تحميل المنتجات...</Text>
      </View>
    );
  }

  if (!hasApprovedStore) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="storefront-outline" size={60} color="#D1D5DB" />
        <Text style={styles.emptyTitle}>لا توجد متاجر معتمدة</Text>
        <Text style={styles.emptySubtitle}>يجب أن يكون متجرك معتمدًا من الإدارة أولاً</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={onCreateStore}>
          <Text style={styles.primaryButtonText}>إنشاء متجر</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.emptyState}>
      <Ionicons name="cube-outline" size={60} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>لا توجد منتجات</Text>
      <Text style={styles.emptySubtitle}>اضغط على زر الإضافة لإضافة منتج جديد</Text>
    </View>
  );
});

EmptyState.displayName = 'EmptyState';

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
