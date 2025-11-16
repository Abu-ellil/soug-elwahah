import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatPrice } from '../utils/helpers';
import COLORS from '../constants/colors';
import SIZES from '../constants/sizes';
import ImageWithFallback from './ImageWithFallback';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const handleIncrease = () => {
    onUpdateQuantity(item.productId, item.quantity + 1);
  };

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.productId, item.quantity - 1);
    } else {
      Alert.alert('تأكيد الحذف', 'هل تريد حذف هذا المنتج من السلة؟', [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: () => onRemove(item.productId),
        },
      ]);
    }
  };

  const handleRemove = () => {
    Alert.alert('حذف المنتج', `هل تريد حذف "${item.name}" من السلة؟`, [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'حذف',
        style: 'destructive',
        onPress: () => onRemove(item.productId),
      },
    ]);
  };

  const itemTotal = item.price * item.quantity;

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageWithFallback source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <TouchableOpacity
            onPress={handleRemove}
            style={styles.removeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <MaterialIcons name="close" size={20} color={COLORS.gray} />
          </TouchableOpacity>
        </View>

        <Text style={styles.price} numberOfLines={1}>
          {formatPrice(item.price)}
        </Text>

        <View style={styles.footer}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              onPress={handleDecrease}
              style={styles.quantityButton}
              disabled={item.quantity <= 1}>
              <MaterialIcons
                name="remove"
                size={16}
                color={item.quantity <= 1 ? COLORS.gray : COLORS.text}
              />
            </TouchableOpacity>

            <Text style={styles.quantity} numberOfLines={1}>
              {item.quantity}
            </Text>

            <TouchableOpacity
              onPress={handleIncrease}
              style={[styles.quantityButton, styles.increaseButton]}>
              <MaterialIcons name="add" size={16} color={COLORS.card} />
            </TouchableOpacity>
          </View>

          <Text style={styles.totalPrice}>{formatPrice(itemTotal)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  content: {
    padding: SIZES.padding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.base / 2,
  },
  name: {
    fontSize: SIZES.body2,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
    marginRight: SIZES.base,
  },
  removeButton: {
    padding: SIZES.base / 2,
    borderRadius: SIZES.borderRadius / 2,
  },
  price: {
    fontSize: SIZES.body2,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SIZES.base,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadius,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  increaseButton: {
    backgroundColor: COLORS.primary,
  },
  quantity: {
    fontSize: SIZES.body1,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 32,
    textAlign: 'center',
    paddingHorizontal: SIZES.base,
  },
  totalPrice: {
    fontSize: SIZES.h6,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'right',
  },
});

export default CartItem;
