import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../../stores/cartStore'; // Using cart store which has order functionality
import { useAuthStore } from '../../../stores/authStore';
import { Order, OrderItem, OrderStatus } from '../../../types/Order';
import COLORS from '../../../constants/colors';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  preparing: '#3b82f6',
  ready: '#10b981',
  out_for_delivery: '#f97316',
  delivered: '#22c55e',
  completed: '#22c55e',
  cancelled: '#ef4444',
  disputed: '#ef4444',
  refunded: '#6b7280',
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  preparing: 'جاري التحضير',
  ready: 'جاهز للتسليم',
  out_for_delivery: 'في الطريق',
  delivered: 'تم التوصيل',
  completed: 'مكتمل',
  cancelled: 'ملغي',
  disputed: 'متنازع عليه',
  refunded: 'مسترجع',
};

interface OrderTrackingScreenProps {
  route?: {
    params?: {
      orderId?: string;
    };
  };
  navigation?: any;
}

const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({ route, navigation }) => {
  const orderId = route?.params?.orderId;
  const { orders, loadOrders } = useCartStore();
  const { currentUser } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (orderId) {
      const foundOrder = orders.find((o: any) => o.id === orderId);
      setOrder(foundOrder || null);
    }
  }, [orderId, orders]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOrders();
    if (orderId) {
      const freshOrder = orders.find((o: any) => o.id === orderId);
      setOrder(freshOrder || null);
    }
    setIsRefreshing(false);
  };

  const handleCancelOrder = () => {
    if (!order) return;

    const canRefund = order.payment?.status === 'paid';

    Alert.alert(
      'إلغاء الطلب',
      canRefund ? 'هل تريد إلغاء الطلب واسترداد المبلغ؟' : 'هل أنت متأكد أنك تريد إلغاء هذا الطلب؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: canRefund ? 'إلغاء واسترداد' : 'نعم، إلغاء',
          style: 'destructive',
          onPress: () => showCancellationOptions(),
        },
      ]
    );
  };

  const showCancellationOptions = () => {
    Alert.alert('سبب الإلغاء', 'يرجى اختيار سبب إلغاء الطلب:', [
      { text: 'إلغاء', style: 'cancel' },
      { text: 'غيرت رأيي', onPress: () => cancelOrder('غيرت رأيي') },
      { text: 'طلبت بالخطأ', onPress: () => cancelOrder('طلبت بالخطأ') },
      { text: 'تأخير في التوصيل', onPress: () => cancelOrder('تأخير في التوصيل') },
      { text: 'سبب آخر', onPress: () => cancelOrder('سبب آخر') },
    ]);
  };

  const cancelOrder = async (reason: string) => {
    try {
      Alert.alert('تم الإلغاء', 'تم إلغاء الطلب بنجاح');
      // In a real implementation, you would call an API to cancel the order
    } catch (error) {
      console.error('Failed to cancel order:', error);
      Alert.alert('خطأ', 'فشل في إلغاء الطلب. يرجى المحاولة مرة أخرى.');
    }
  };

  const canCancelOrder = order && (order.status === 'pending' || order.status === 'confirmed');

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>تتبع الطلب</Text>
          <View style={{ width: 24 }} /> {/* Spacer */}
        </View>

        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color={COLORS.gray} />
          <Text style={styles.emptyText}>الطلب غير موجود</Text>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>العودة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تتبع الطلب</Text>
        <View style={{ width: 24 }} /> {/* Spacer */}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderInfoRow}>
            <Text style={styles.orderNumber}>طلب #{order.orderNumber || order.id}</Text>
            <Text style={styles.orderDate}>
              {new Date(order.createdAt).toLocaleString('ar-EG')}
            </Text>
          </View>

          <View
            style={[
              styles.statusContainer,
              { backgroundColor: `${STATUS_COLORS[order.status]}20` },
            ]}>
            <Text style={[styles.statusText, { color: STATUS_COLORS[order.status] }]}>
              {STATUS_LABELS[order.status]}
            </Text>
          </View>

          <Text style={styles.orderTotal}>المجموع: {order.total} جنيه</Text>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>تفاصيل الطلب</Text>
          {order.items && Array.isArray(order.items) && order.items.map((item: OrderItem, index: number) => (
            <View key={item.id || item.productId || index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product?.name || 'منتج'}</Text>
                <Text style={styles.itemQuantity}>الكمية: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                {(item.product?.price || 0) * item.quantity} جنيه
              </Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {canCancelOrder && (
            <TouchableOpacity onPress={handleCancelOrder} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>إلغاء الطلب</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => navigation?.navigate('Orders')}
            style={styles.viewAllButton}>
            <Text style={styles.viewAllButtonText}>عرض جميع الطلبات</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 16,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.card,
    fontWeight: 'bold',
    fontSize: 16,
  },
  orderHeader: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  orderDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  section: {
    backgroundColor: COLORS.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemQuantity: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  buttonContainer: {
    gap: 12,
  },
  cancelButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.card,
    fontWeight: 'bold',
    fontSize: 16,
  },
  viewAllButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: COLORS.card,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default OrderTrackingScreen;
