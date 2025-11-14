import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationProvider';
import { STORES } from '../../data/stores';
import CartItem from '../../components/CartItem';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import COLORS from '../../constants/colors';
import SIZES from '../../constants/sizes';
import { formatPrice } from '../../utils/helpers';

const CartScreen = ({ navigation }) => {
  const {
    cartItems,
    isLoading,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartSubtotal,
    getDeliveryFee,
    getTotalWithDelivery,
  } = useCart();

  const { selectedVillage } = useLocation();
  const [stores, setStores] = useState([]);

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = () => {
    const cartStoreIds = [...new Set(cartItems.map(item => item.storeId))];
    const cartStores = cartStoreIds.map(storeId => 
      STORES.find(store => store.id === storeId)
    ).filter(Boolean);
    setStores(cartStores);
  };

  const handleClearCart = () => {
    Alert.alert(
      'تفريغ السلة',
      'هل تريد تفريغ السلة بالكامل؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تفريغ', style: 'destructive', onPress: clearCart }
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('تنبيه', 'السلة فارغة');
      return;
    }

    if (!selectedVillage) {
      Alert.alert(
        'تحديد الموقع',
        'يرجى تحديد موقع التوصيل أولاً',
        [
          { text: 'إلغاء', style: 'cancel' },
          { text: 'تحديد الموقع', onPress: () => navigation.navigate('Home') }
        ]
      );
      return;
    }

    navigation.navigate('Checkout');
  };

  const getStoreName = (storeId) => {
    const store = STORES.find(s => s.id === storeId);
    return store ? store.name : 'متجر غير معروف';
  };

  const getItemsByStore = () => {
    const grouped = {};
    cartItems.forEach(item => {
      if (!grouped[item.storeId]) {
        grouped[item.storeId] = [];
      }
      grouped[item.storeId].push(item);
    });
    return grouped;
  };

  const itemsByStore = getItemsByStore();
  const subtotal = getCartSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotalWithDelivery();

  if (isLoading) {
    return <LoadingSpinner fullScreen text="جاري تحميل السلة..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title="سلة التسوق"
        showBack
        onLeftPress={() => navigation.goBack()}
        rightComponent={
          cartItems.length > 0 && (
            <TouchableOpacity onPress={handleClearCart} style={styles.clearButton}>
              <Icon name="delete-outline" size={24} color={COLORS.danger} />
            </TouchableOpacity>
          )
        }
      />

      {/* Cart Content */}
      {cartItems.length === 0 ? (
        <EmptyState
          icon="shopping-cart"
          title="السلة فارغة"
          message="أضف منتجات إلى السلة لبدء التسوق"
          actionText="تسوق الآن"
          onActionPress={() => navigation.navigate('Home')}
        />
      ) : (
        <View style={styles.content}>
          {/* Delivery Info */}
          {selectedVillage && (
            <View style={styles.deliveryInfo}>
              <Icon name="location-on" size={20} color={COLORS.primary} />
              <Text style={styles.deliveryText}>
                التوصيل إلى: {selectedVillage.name}
              </Text>
            </View>
          )}

          {/* Stores Summary */}
          <View style={styles.storesSection}>
            <Text style={styles.sectionTitle}>المتاجر ({stores.length})</Text>
            {stores.map(store => (
              <View key={store.id} style={styles.storeInfo}>
                <Icon name="store" size={16} color={COLORS.primary} />
                <Text style={styles.storeName}>{store.name}</Text>
                <View style={[
                  styles.storeStatus,
                  { backgroundColor: store.isOpen ? COLORS.success : COLORS.danger }
                ]}>
                  <Text style={styles.storeStatusText}>
                    {store.isOpen ? 'مفتوح' : 'مغلق'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Cart Items */}
          <FlatList
            data={cartItems}
            renderItem={({ item }) => (
              <CartItem
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
              />
            )}
            keyExtractor={(item) => item.productId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cartItemsList}
          />

          {/* Order Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>ملخص الطلب</Text>
            
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>المجموع الفرعي</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>رسوم التوصيل</Text>
              <Text style={styles.summaryValue}>
                {deliveryFee > 0 ? formatPrice(deliveryFee) : 'مجاني'}
              </Text>
            </View>

            {selectedVillage && (
              <View style={styles.summaryRow}>
                <Text style={styles.deliveryVillage}>
                  إلى {selectedVillage.name}
                </Text>
                <Text style={styles.deliveryTime}>
                  {selectedVillage.deliveryTime}
                </Text>
              </View>
            )}

            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>المجموع الكلي</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Checkout Button */}
      {cartItems.length > 0 && (
        <View style={styles.checkoutContainer}>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Icon name="payment" size={24} color={COLORS.white} />
            <Text style={styles.checkoutText}>إتمام الطلب</Text>
            <Text style={styles.checkoutTotal}>{formatPrice(total)}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  content: {
    flex: 1,
  },
  clearButton: {
    padding: SIZES.base,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    margin: SIZES.padding,
    padding: SIZES.base,
    borderRadius: SIZES.borderRadius,
  },
  deliveryText: {
    fontSize: SIZES.body2,
    color: COLORS.primary,
    marginRight: SIZES.base,
    fontWeight: '600',
    textAlign: 'right',
  },
  storesSection: {
    backgroundColor: COLORS.card,
    margin: SIZES.padding,
    marginTop: 0,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
  },
  sectionTitle: {
    fontSize: SIZES.h6,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
    textAlign: 'right',
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base / 2,
  },
  storeName: {
    fontSize: SIZES.body3,
    color: COLORS.text,
    marginRight: SIZES.base,
    flex: 1,
    textAlign: 'right',
  },
  storeStatus: {
    paddingHorizontal: SIZES.base / 2,
    paddingVertical: 2,
    borderRadius: SIZES.borderRadius / 2,
  },
  storeStatusText: {
    fontSize: SIZES.caption,
    color: COLORS.card,
    fontWeight: 'bold',
  },
  cartItemsList: {
    paddingHorizontal: SIZES.padding,
  },
  summaryContainer: {
    backgroundColor: COLORS.card,
    margin: SIZES.padding,
    marginTop: 0,
    padding: SIZES.padding,
    borderRadius: SIZES.borderRadius,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base / 2,
  },
  summaryLabel: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  summaryValue: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    fontWeight: '600',
    textAlign: 'right',
  },
  deliveryVillage: {
    fontSize: SIZES.body3,
    color: COLORS.primary,
    textAlign: 'right',
    flex: 1,
  },
  deliveryTime: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: SIZES.base,
    marginTop: SIZES.base,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: SIZES.h6,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'right',
  },
  totalValue: {
    fontSize: SIZES.h5,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'right',
  },
  checkoutContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkoutText: {
    fontSize: SIZES.h6,
    fontWeight: 'bold',
    color: COLORS.card,
  },
  checkoutTotal: {
    fontSize: SIZES.h5,
    fontWeight: 'bold',
    color: COLORS.card,
  },
});

export default CartScreen;