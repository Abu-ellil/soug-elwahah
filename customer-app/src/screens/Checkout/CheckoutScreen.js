import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationProvider';
import { useAuth } from '../../context/AuthContext';
import { API } from '../../services/api';
import Header from '../../components/Header';
import LoginPromptModal from '../../components/LoginPromptModal';
import COLORS from '../../constants/colors';
import SIZES from '../../constants/sizes';
import { formatPrice } from '../../utils/helpers';

// Delivery time slots - moved from villages.js
export const DELIVERY_SLOTS = [
  { id: 'morning', name: 'الصباح (9:00 - 12:00)', timeRange: '09:00-12:00', isAvailable: true },
  { id: 'noon', name: 'الظهيرة (12:00 - 15:00)', timeRange: '12:00-15:00', isAvailable: true },
  { id: 'evening', name: 'المساء (15:00 - 18:00)', timeRange: '15:00-18:00', isAvailable: true },
  { id: 'night', name: 'الليل (18:00 - 21:00)', timeRange: '18:00-21:00', isAvailable: true },
];

const CheckoutScreen = ({ navigation }) => {
  const { cartItems, getCartSubtotal, getTotalWithDelivery, clearCart, addOrder } = useCart();
  const { isAuthenticated, currentUser } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { userLocation, getCurrentLocation } = useLocation();

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const [deliveryInfo, setDeliveryInfo] = useState({
    selectedSlot: null,
    addressType: 'home', // home, work, other
  });

  const [paymentMethod, setPaymentMethod] = useState('cash'); // cash, fawry, vodafone_cash

  const paymentMethods = [
    { id: 'cash', name: 'الدفع عند الاستلام', icon: 'payments', color: COLORS.success },
    { id: 'fawry', name: 'فوري', icon: 'receipt', color: COLORS.primary },
    { id: 'vodafone_cash', name: 'فودافون كاش', icon: 'phone-android', color: COLORS.warning },
    { id: 'orange_money', name: 'أورانج ماني', icon: 'smartphone', color: COLORS.orange },
  ];

  const subtotal = getCartSubtotal();
  const deliveryFee = userLocation ? 10 : 0; // Default delivery fee
  const total = getTotalWithDelivery();

  const validateForm = () => {
    if (!customerInfo.name.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال الاسم');
      return false;
    }

    if (!customerInfo.phone.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال رقم الهاتف');
      return false;
    }

    if (!userLocation) {
      Alert.alert('خطأ', 'يرجى تفعيل GPS لتحديد موقعك');
      return false;
    }

    if (!customerInfo.address.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان التوصيل');
      return false;
    }

    if (!deliveryInfo.selectedSlot) {
      Alert.alert('خطأ', 'يرجى اختيار وقت التوصيل');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!validateForm()) return;

    // Validate cart items
    if (!cartItems || cartItems.length === 0) {
      Alert.alert('خطأ', 'السلة فارغة');
      return;
    }

    const firstItem = cartItems[0];
    if (!firstItem) {
      Alert.alert('خطأ', 'لا يمكن إنشاء الطلب - السلة فارغة');
      return;
    }

    if (!firstItem.storeId) {
      Alert.alert('خطأ', 'لا يمكن إنشاء الطلب - بيانات المتجر غير متوفرة');
      return;
    }

    // Validate that all cart items have valid storeIds
    const invalidItems = cartItems.filter((item) => !item.storeId);
    if (invalidItems.length > 0) {
      Alert.alert('خطأ', 'بعض المنتجات في السلة لا تحتوي على معلومات المتجر');
      return;
    }

    try {
      // Generate a more unique order ID
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000);
      const orderId = `ord${timestamp}${randomNum}`;

      // Get store details from API
      const storeResponse = await API.storesAPI.getStoreDetails(firstItem.storeId);
      const storeName = storeResponse.success
        ? storeResponse.data.store.name
        : `متجر ${firstItem.storeId}`;

      const newOrder = {
        id: orderId,
        userId: currentUser.id, // Use actual logged-in user ID
        storeId: firstItem.storeId,
        storeName: storeName,
        customerInfo: {
          name: customerInfo.name,
          phone: customerInfo.phone,
        },
        items: cartItems,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        status: 'pending',
        deliveryAddress: {
          street: customerInfo.address,
          coordinates: userLocation,
        },
        deliverySlot: deliveryInfo.selectedSlot,
        paymentMethod: paymentMethod,
        notes: customerInfo.notes,
        createdAt: new Date().toISOString(),
        statusHistory: [
          { status: 'تم استلام الطلب', date: new Date().toISOString(), icon: 'clipboard' },
        ],
      };

      console.log('🚀 Starting order creation process...');
      console.log('📦 New order data:', JSON.stringify(newOrder, null, 2));

      // Add order and wait for it to complete
      console.log('➕ Calling addOrder function...');
      const result = await addOrder(newOrder);
      console.log('✅ Order created successfully!', result);

      if (result.success) {
        // Clear cart after successful order creation
        clearCart();

        // Show success message
        Toast.show({
          type: 'success',
          text1: 'تم إنشاء الطلب',
          text2: 'سيتم التواصل معك قريباً لتأكيد الطلب',
        });

        // Navigate to orders screen
        navigation.navigate('Orders');
      } else {
        throw new Error(result.error || 'فشل في إنشاء الطلب');
      }
    } catch (error) {
      console.error('❌ Error creating order:', error);
      console.error('Error details:', error.message);
      console.error('Error stack:', error.stack);
      Alert.alert('خطأ', error.message || 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.');
    }
  };

  const renderInput = (
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    multiline = false
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multilineInput]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlign="right"
      />
    </View>
  );

  const renderPaymentMethod = (method) => (
    <TouchableOpacity
      key={method.id}
      style={[styles.paymentMethod, paymentMethod === method.id && styles.selectedPaymentMethod]}
      onPress={() => setPaymentMethod(method.id)}>
      <MaterialIcons
        name={method.icon}
        size={24}
        color={paymentMethod === method.id ? COLORS.white : method.color}
      />
      <Text
        style={[
          styles.paymentMethodText,
          paymentMethod === method.id && styles.selectedPaymentMethodText,
        ]}>
        {method.name}
      </Text>
      {paymentMethod === method.id && (
        <MaterialIcons name="check-circle" size={20} color={COLORS.white} />
      )}
    </TouchableOpacity>
  );

  const renderDeliverySlot = (slot) => (
    <TouchableOpacity
      key={slot.id}
      style={[styles.slotButton, deliveryInfo.selectedSlot?.id === slot.id && styles.selectedSlot]}
      onPress={() => setDeliveryInfo((prev) => ({ ...prev, selectedSlot: slot }))}>
      <Text
        style={[
          styles.slotText,
          deliveryInfo.selectedSlot?.id === slot.id && styles.selectedSlotText,
        ]}>
        {slot.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header title="إتمام الطلب" showBack onLeftPress={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات العميل</Text>

          {renderInput(
            'الاسم *',
            customerInfo.name,
            (text) => setCustomerInfo((prev) => ({ ...prev, name: text })),
            'أدخل اسمك الكامل'
          )}

          {renderInput(
            'رقم الهاتف *',
            customerInfo.phone,
            (text) => setCustomerInfo((prev) => ({ ...prev, phone: text })),
            '01xxxxxxxxx',
            'phone-pad'
          )}
        </View>

        {/* Delivery Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>معلومات التوصيل</Text>

          {/* Location Status */}
          <View style={styles.locationStatus}>
            <MaterialIcons name="location-on" size={20} color={COLORS.primary} />
            <Text style={styles.locationText}>
              {userLocation ? 'تم تحديد موقعك' : 'GPS غير متاح'}
            </Text>
          </View>

          {renderInput(
            'عنوان التوصيل *',
            customerInfo.address,
            (text) => setCustomerInfo((prev) => ({ ...prev, address: text })),
            'أدخل العنوان التفصيلي'
          )}

          {renderInput(
            'ملاحظات إضافية',
            customerInfo.notes,
            (text) => setCustomerInfo((prev) => ({ ...prev, notes: text })),
            'default',
            true
          )}
        </View>

        {/* Delivery Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>وقت التوصيل المفضل *</Text>
          <View style={styles.slotsContainer}>
            {DELIVERY_SLOTS.filter((slot) => slot.isAvailable).map(renderDeliverySlot)}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>طريقة الدفع</Text>
          <View style={styles.paymentMethods}>{paymentMethods.map(renderPaymentMethod)}</View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ملخص الطلب</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>المجموع الفرعي</Text>
            <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>رسوم التوصيل</Text>
            <Text style={styles.summaryValue}>
              {userLocation ? formatPrice(deliveryFee) : 'غير محدد'}
            </Text>
          </View>

          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>المجموع الكلي</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          <MaterialIcons name="shopping-cart-checkout" size={24} color={COLORS.white} />
          <Text style={styles.placeOrderText}>تأكيد الطلب</Text>
          <Text style={styles.placeOrderTotal}>{formatPrice(total)}</Text>
        </TouchableOpacity>
      </View>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        visible={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => navigation.navigate('Auth', { screen: 'Login' })}
        message="يجب تسجيل الدخول أولاً لتنفيذ هذه العملية"
      />
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
    paddingBottom: 100, // Space for footer button
  },
  section: {
    backgroundColor: COLORS.white,
    marginBottom: SIZES.base,
    padding: SIZES.padding,
  },
  sectionTitle: {
    fontSize: SIZES.h6,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.base,
    textAlign: 'right',
  },
  inputContainer: {
    marginBottom: SIZES.base,
  },
  inputLabel: {
    fontSize: SIZES.body2,
    color: COLORS.text,
    marginBottom: SIZES.base / 2,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadius,
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base,
    fontSize: SIZES.body2,
    color: COLORS.text,
    textAlign: 'right',
    backgroundColor: COLORS.white,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.base,
    backgroundColor: COLORS.primaryLight,
    borderRadius: SIZES.borderRadius,
    marginBottom: SIZES.base,
  },
  locationText: {
    fontSize: SIZES.body3,
    color: COLORS.primary,
    marginRight: SIZES.base,
    textAlign: 'right',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.base,
  },
  slotButton: {
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    backgroundColor: COLORS.white,
  },
  selectedSlot: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  slotText: {
    fontSize: SIZES.body3,
    color: COLORS.text,
    textAlign: 'center',
  },
  selectedSlotText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  paymentMethods: {
    gap: SIZES.base,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.base,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.white,
  },
  selectedPaymentMethod: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  paymentMethodText: {
    flex: 1,
    fontSize: SIZES.body2,
    color: COLORS.text,
    marginRight: SIZES.base,
    textAlign: 'right',
  },
  selectedPaymentMethodText: {
    color: COLORS.white,
    fontWeight: 'bold',
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.padding,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  placeOrderButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeOrderText: {
    fontSize: SIZES.h6,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  placeOrderTotal: {
    fontSize: SIZES.h5,
    fontWeight: 'bold',
    color: COLORS.white,
  },
});

export default CheckoutScreen;
