import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../context/OrdersContext';
import { ordersService } from '../app/lib/api';
import websocketService, { OrderUpdate } from '../services/websocketService';
import { useAuthStore } from '../stores/authStore';
import Header from './Header';
import OrderStatusTimeline from './OrderStatusTimeline';
import DriverInfo from './DriverInfo';
import OrderRatingModal from './OrderRatingModal';
import CustomerSupportModal from './CustomerSupportModal';
import OrderIssueModal from './OrderIssueModal';
import { Order, OrderStatus } from '../types/Order';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

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
  orderId?: string;
}

export default function OrderTrackingScreen({ orderId: propOrderId }: OrderTrackingScreenProps) {
  const { id: paramOrderId } = useLocalSearchParams();
  const orderId = propOrderId || (paramOrderId as string);

  const { orders, refetchOrders } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Find order from context
    const foundOrder = orders.find((o) => o.id === orderId);
    setOrder(foundOrder || null);
  }, [orders, orderId]);

  useEffect(() => {
    if (!orderId) return;

    // Get auth token and connect to Socket.IO
    const { user } = useAuthStore.getState();
    const token = user?.token;

    if (token) {
      websocketService.connect(token).catch((error) => {
        console.error('Failed to connect to Socket.IO:', error);
      });
    }

    // Monitor connection status
    const unsubscribeConnection = websocketService.onConnectionChange((connected) => {
      setIsConnected(connected);
      setConnectionStatus(websocketService.getConnectionStatus());
    });

    // Subscribe to WebSocket updates for this order
    const unsubscribeOrderUpdate = websocketService.onOrderUpdate((update: OrderUpdate) => {
      if (update.orderId === orderId) {
        console.log('📨 Received order update:', update);

        setOrder((prevOrder) => {
          if (!prevOrder) return null;

          return {
            ...prevOrder,
            status: update.status as OrderStatus,
            driverLocation: update.driverLocation || prevOrder.driverLocation,
            estimatedDeliveryTime: update.estimatedDeliveryTime || prevOrder.estimatedDeliveryTime,
            statusHistory: [
              ...(prevOrder.statusHistory || []),
              {
                status: update.status as OrderStatus,
                timestamp: update.timestamp,
                note: update.message,
              },
            ],
          };
        });

        // Trigger pulse animation for status updates
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });

    const unsubscribeDriverLocation = websocketService.onDriverLocation((locationData) => {
      if (locationData.orderId === orderId) {
        console.log('📍 Received driver location:', locationData);

        setOrder((prevOrder) => {
          if (!prevOrder) return null;

          return {
            ...prevOrder,
            driverLocation: {
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              timestamp: locationData.timestamp,
              speed: locationData.speed,
            },
          };
        });
      }
    });

    // Subscribe to order updates
    websocketService.subscribeToOrder(orderId);
    setIsConnected(websocketService.isConnected());

    // Slide in animation
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    return () => {
      unsubscribeConnection();
      unsubscribeOrderUpdate();
      unsubscribeDriverLocation();
      websocketService.unsubscribeFromOrder(orderId);
    };
  }, [orderId, pulseAnim, slideAnim]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchOrders();

      // Also try to get fresh order data from API
      if (orderId) {
        try {
          const freshOrder = await ordersService.getById(orderId);
          if (freshOrder) {
            setOrder(freshOrder);
          }
        } catch (error) {
          console.log('Could not fetch fresh order data:', error);
        }
      }
    } catch (error) {
      console.error('Failed to refresh orders:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCancelOrder = () => {
    if (!order) return;

    // Show different options based on order status
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
    if (!order) return;

    try {
      setIsCancelling(true);
      await ordersService.cancel(order.id, reason);

      // If payment was made, also request refund
      if (order.payment?.status === 'paid') {
        try {
          await ordersService.requestRefund(order.id, reason, order.total);
        } catch (refundError) {
          console.warn('Refund request failed:', refundError);
        }
      }

      await refetchOrders();

      Alert.alert(
        'تم الإلغاء',
        order.payment?.status === 'paid'
          ? 'تم إلغاء الطلب وطلب الاسترداد. سيتم معالجة الاسترداد خلال 3-5 أيام عمل.'
          : 'تم إلغاء الطلب بنجاح'
      );
    } catch (error) {
      console.error('Failed to cancel order:', error);
      Alert.alert('خطأ', 'فشل في إلغاء الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleRateOrder = () => {
    setShowRatingModal(true);
  };

  const handleContactSupport = () => {
    setShowSupportModal(true);
  };

  const canCancelOrder = order && (order.status === 'pending' || order.status === 'confirmed');
  const canRateOrder = order && (order.status === 'delivered' || order.status === 'completed');
  const showDriverInfo = order && (order.status === 'out_for_delivery' || order.status === 'ready');
  // Removed map functionality

  if (!order) {
    return (
      <View className="flex-1 bg-gray-100">
        <Header />
        <View className="flex-1 items-center justify-center">
          <Ionicons name="receipt-outline" size={64} color={colors.neutral[400]} />
          <Text className="mt-4 text-lg text-neutral-600">الطلب غير موجود</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-3">
            <Text className="font-bold text-white">العودة</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      <Header />

      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />}>
        <Animated.View
          style={{
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
            opacity: slideAnim,
          }}>
          {/* Connection Status */}
          <View
            className={`mb-3 flex-row items-center justify-center rounded-lg p-2 ${
              isConnected ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
            <View
              className={`mr-2 h-2 w-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-yellow-500'
              }`}
            />
            <Text className={`text-sm ${isConnected ? 'text-green-700' : 'text-yellow-700'}`}>
              {isConnected ? 'متصل - تحديثات مباشرة' : 'غير متصل - تحديث يدوي'}
            </Text>
          </View>

          {/* Order Header */}
          <View className="mb-3 rounded-lg bg-white p-4 shadow">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-lg font-bold">طلب #{order.orderNumber || order.id}</Text>
              <View className="flex-row items-center">
                {order.isSynced !== undefined && (
                  <View
                    className={`mr-2 h-3 w-3 rounded-full ${
                      order.isSynced ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                  />
                )}
                <Text className="text-sm text-neutral-500">
                  {new Date(order.createdAt).toLocaleString('ar-EG')}
                </Text>
              </View>
            </View>

            <Animated.View
              style={{
                transform: [{ scale: pulseAnim }],
              }}
              className="mt-3 flex-row items-center justify-between border-t border-neutral-100 pt-3">
              <Text className="text-lg font-bold text-green-600">المجموع: {order.total} جنيه</Text>
              <View
                className="rounded-full px-3 py-1"
                style={{ backgroundColor: STATUS_COLORS[order.status] + '20' }}>
                <Text className="text-sm font-bold" style={{ color: STATUS_COLORS[order.status] }}>
                  {STATUS_LABELS[order.status]}
                </Text>
              </View>
            </Animated.View>

            {order.estimatedDeliveryTime && (
              <View className="mt-3 rounded-lg bg-blue-50 p-3">
                <Text className="font-medium text-blue-700">
                  الوقت المتوقع للتوصيل:{' '}
                  {new Date(order.estimatedDeliveryTime).toLocaleTimeString('ar-EG')}
                </Text>
              </View>
            )}
          </View>

          {/* Driver Info */}
          {showDriverInfo && (
            <View className="mb-3">
              <DriverInfo order={order} />
            </View>
          )}

          {/* Order Status Timeline */}
          <View className="mb-3 rounded-lg bg-white p-4 shadow">
            <Text className="mb-4 text-lg font-bold">تتبع الطلب</Text>
            <OrderStatusTimeline order={order} />
          </View>

          {/* Order Items */}
          <View className="mb-3 rounded-lg bg-white p-4 shadow">
            <Text className="mb-4 text-lg font-bold">تفاصيل الطلب</Text>
            {order.items.map((item, index) => (
              <View
                key={item.id || item.productId || index}
                className="flex-row items-center justify-between border-b border-neutral-100 py-2 last:border-b-0">
                <View className="flex-1">
                  <Text className="font-medium">{item.product?.name || 'منتج'}</Text>
                  <Text className="text-sm text-neutral-600">الكمية: {item.quantity}</Text>
                </View>
                <Text className="font-bold text-green-600">
                  {(item.product?.price || 0) * item.quantity} جنيه
                </Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View className="space-y-3">
            {canCancelOrder && (
              <TouchableOpacity
                onPress={handleCancelOrder}
                disabled={isCancelling}
                className={`items-center rounded-lg px-4 py-4 ${
                  isCancelling ? 'bg-red-400' : 'bg-red-600'
                }`}>
                <Text className="text-lg font-bold text-white">
                  {isCancelling ? 'جاري الإلغاء...' : 'إلغاء الطلب'}
                </Text>
              </TouchableOpacity>
            )}

            {canRateOrder && (
              <TouchableOpacity
                onPress={handleRateOrder}
                className="items-center rounded-lg bg-yellow-500 px-4 py-4">
                <Text className="text-lg font-bold text-white">تقييم الطلب</Text>
              </TouchableOpacity>
            )}

            {/* Report Issue Button - Show for delivered orders or if there are problems */}
            {(order.status === 'delivered' ||
              order.status === 'completed' ||
              order.status === 'out_for_delivery') && (
              <TouchableOpacity
                onPress={() => setShowIssueModal(true)}
                className="items-center rounded-lg bg-orange-600 px-4 py-4">
                <Text className="text-lg font-bold text-white">الإبلاغ عن مشكلة</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={handleContactSupport}
              className="items-center rounded-lg bg-blue-600 px-4 py-4">
              <Text className="text-lg font-bold text-white">خدمة العملاء</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push('/orders')}
              className="items-center rounded-lg bg-neutral-600 px-4 py-4">
              <Text className="text-lg font-bold text-white">عرض جميع الطلبات</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Rating Modal */}
      {showRatingModal && (
        <OrderRatingModal
          order={order}
          visible={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          onSubmit={(rating) => {
            console.log('Order rated:', rating);
            setShowRatingModal(false);
          }}
        />
      )}

      {/* Customer Support Modal */}
      {showSupportModal && (
        <CustomerSupportModal
          order={order}
          visible={showSupportModal}
          onClose={() => setShowSupportModal(false)}
        />
      )}

      {/* Order Issue Modal */}
      {showIssueModal && (
        <OrderIssueModal
          order={order}
          visible={showIssueModal}
          onClose={() => setShowIssueModal(false)}
          onIssueReported={() => {
            // Refresh orders after issue is reported
            refetchOrders();
          }}
        />
      )}
    </View>
  );
}
