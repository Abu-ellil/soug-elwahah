import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onToggleAvailability: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ProductCard = memo<ProductCardProps>(({ product, onToggleAvailability, onDelete }) => {
  const router = useRouter();

  const handleDelete = () => {
    Alert.alert('حذف المنتج', 'هل أنت متأكد أنك تريد حذف هذا المنتج؟', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'حذف', style: 'destructive', onPress: () => onDelete(product._id) },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.description}>{product.description}</Text>
        <Text style={styles.price}>{product.price} ج.م</Text>
        <Text style={styles.stock}>المخزون: {product.stock}</Text>
        <View style={[styles.badge, product.isAvailable ? styles.available : styles.unavailable]}>
          <Text style={styles.badgeText}>{product.isAvailable ? 'متوفر' : 'غير متوفر'}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <ActionButton
          icon="create-outline"
          color="#F59E0B"
          onPress={() => router.push(`/products/product-form?id=${product._id}`)}
        />
        <ActionButton
          icon={product.isAvailable ? "eye-off-outline" : "eye-outline"}
          color="#8B5CF6"
          onPress={() => onToggleAvailability(product._id)}
        />
        <ActionButton
          icon="trash-outline"
          color="#EF4444"
          onPress={handleDelete}
        />
      </View>
    </View>
  );
});

ProductCard.displayName = 'ProductCard';

interface ActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

const ActionButton = memo<ActionButtonProps>(({ icon, color, onPress }) => (
  <TouchableOpacity style={[styles.actionButton, { backgroundColor: color }]} onPress={onPress}>
    <Ionicons name={icon} size={20} color="white" />
  </TouchableOpacity>
));

ActionButton.displayName = 'ActionButton';

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  stock: {
    fontSize: 14,
    color: '#10B981',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  available: {
    backgroundColor: '#D1FAE5',
  },
  unavailable: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
  },
  actions: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
});
