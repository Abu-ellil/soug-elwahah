import React, { useEffect, useRef, Fragment } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import Header from '../../components/Header';
import RTLText from '../../components/RTLText';
import CartItem from '../../components/CartItem'; // Re-using for order items
import DriverLocationMap from '../../components/DriverLocationMap';
import COLORS from '../../constants/colors';
import SIZES from '../../constants/sizes';

const OrderDetailsScreen = () => {
  const route = useRoute();
  const { order, focusOnDriverLocation } = route.params;
  const scrollViewRef = useRef(null);

  useEffect(() => {
    if (focusOnDriverLocation && scrollViewRef.current) {
      // Scroll to the map section after components are rendered
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 400, animated: true });
      }, 500);
    }
  }, [focusOnDriverLocation]);

  const handleCallDriver = () => {
    if (order.driverInfo && order.driverInfo.phone) {
      Linking.openURL(`tel:${order.driverInfo.phone}`);
    }
  };

  const renderTimelineStep = ({ item, index }) => {
    const isLastStep = index === order.statusHistory.length - 1;
    const isCompleted = true; // In a real app, you'd compare with current status
    return (
      <View style={styles.timelineStep}>
        <View style={styles.timelineIconContainer}>
          <View
            style={[styles.timelineIcon, isCompleted ? styles.completedIcon : styles.pendingIcon]}>
            <Feather name={item.icon || 'check-circle'} size={20} color={COLORS.white} />
          </View>
          {!isLastStep && <View style={styles.timelineConnector} />}
        </View>
        <View style={styles.timelineDetails}>
          <RTLText style={styles.statusTitle}>{item.status}</RTLText>
          <RTLText style={styles.statusDate}>{new Date(item.date).toLocaleString('ar-AE')}</RTLText>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={`الطلب #${order.id}`} showBackButton={true} />
      <ScrollView ref={scrollViewRef}>
        {/* Order Timeline */}
        <View style={styles.section}>
          <RTLText style={styles.sectionTitle}>تتبع الطلب</RTLText>
          {order.statusHistory.map((item, index) => (
            <Fragment key={item.id || item.date || index}>
              {renderTimelineStep({ item, index })}
            </Fragment>
          ))}
        </View>

        {/* Driver Location Map - Only show for delivering orders */}
        {order.status === 'delivering' && order.driverLocation && (
          <View style={styles.section}>
            <RTLText style={styles.sectionTitle}>موقع السائق</RTLText>

            {/* Driver Information */}
            {order.driverInfo && (
              <View style={styles.driverInfoContainer}>
                <View style={styles.driverInfoRow}>
                  <Feather name="user" size={20} color={COLORS.primary} />
                  <RTLText style={styles.driverInfoText}>
                    {order.driverInfo.name} - سائق التوصيل
                  </RTLText>
                </View>
                <View style={[styles.driverInfoRow, styles.driverInfoActions]}>
                  <Feather name="phone" size={20} color={COLORS.primary} />
                  <RTLText style={styles.driverInfoText}>{order.driverInfo.phone}</RTLText>
                  <TouchableOpacity style={styles.callButton} onPress={handleCallDriver}>
                    <Feather name="phone-call" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <DriverLocationMap
              driverLocation={order.driverLocation}
              deliveryAddress={order.deliveryAddress}
              orderStatus={order.status}
            />
          </View>
        )}

        {/* Items List */}
        <View style={styles.section}>
          <RTLText style={styles.sectionTitle}>المنتجات</RTLText>
          {order.items.map((item) => (
            <CartItem
              item={item}
              key={item.id || item.productId || Math.random()}
              isCartScreen={false}
            />
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <RTLText style={styles.sectionTitle}>ملخص الطلب</RTLText>
          {order.storeName && (
            <View style={styles.summaryRow}>
              <RTLText style={styles.summaryLabel}>المتجر</RTLText>
              <RTLText style={styles.summaryValue}>{order.storeName}</RTLText>
            </View>
          )}
          <View style={styles.summaryRow}>
            <RTLText style={styles.summaryLabel}>المجموع الفرعي</RTLText>
            <RTLText style={styles.summaryValue}>د.إ {order.subtotal.toFixed(2)}</RTLText>
          </View>
          <View style={styles.summaryRow}>
            <RTLText style={styles.summaryLabel}>رسوم التوصيل</RTLText>
            <RTLText style={styles.summaryValue}>د.إ {order.deliveryFee.toFixed(2)}</RTLText>
          </View>
          <View style={styles.summaryRow}>
            <RTLText style={styles.summaryLabel}>طريقة الدفع</RTLText>
            <RTLText style={styles.summaryValue}>
              {order.paymentMethod === 'cash'
                ? 'الدفع عند الاستلام'
                : order.paymentMethod === 'fawry'
                  ? 'فوري'
                  : order.paymentMethod === 'vodafone_cash'
                    ? 'فودافون كاش'
                    : order.paymentMethod === 'orange_money'
                      ? 'أورانج ماني'
                      : order.paymentMethod}
            </RTLText>
          </View>
          {order.deliverySlot && (
            <View style={styles.summaryRow}>
              <RTLText style={styles.summaryLabel}>وقت التوصيل</RTLText>
              <RTLText style={styles.summaryValue}>{order.deliverySlot.name}</RTLText>
            </View>
          )}
          <View style={styles.summaryRowTotal}>
            <RTLText style={styles.summaryLabelTotal}>المجموع الكلي</RTLText>
            <RTLText style={styles.summaryValueTotal}>د.إ {order.total.toFixed(2)}</RTLText>
          </View>
        </View>

        {/* Customer Information */}
        {order.customerInfo && (
          <View style={styles.section}>
            <RTLText style={styles.sectionTitle}>معلومات العميل</RTLText>
            <View style={styles.infoContainer}>
              <RTLText style={styles.infoText}>الاسم: {order.customerInfo.name}</RTLText>
              <RTLText style={styles.infoText}>الهاتف: {order.customerInfo.phone}</RTLText>
            </View>
          </View>
        )}

        {/* Delivery Address */}
        <View style={styles.section}>
          <RTLText style={styles.sectionTitle}>عنوان التوصيل</RTLText>
          <View style={styles.addressContainer}>
            <RTLText style={styles.addressText}>{order.deliveryAddress.street}</RTLText>
            <RTLText style={styles.addressText}>{order.deliveryAddress.village}</RTLText>
          </View>
        </View>

        {/* Order Notes */}
        {order.notes && order.notes.trim() !== '' && (
          <View style={styles.section}>
            <RTLText style={styles.sectionTitle}>ملاحظات</RTLText>
            <RTLText style={styles.notesText}>{order.notes}</RTLText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  section: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.padding,
    marginVertical: SIZES.base,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    marginBottom: SIZES.padding,
    color: COLORS.primary,
    textAlign: 'right',
  },
  // Timeline
  timelineStep: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
  },
  timelineIconContainer: {
    alignItems: 'center',
    marginHorizontal: SIZES.base,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIcon: {
    backgroundColor: COLORS.success,
  },
  pendingIcon: {
    backgroundColor: COLORS.gray,
  },
  timelineConnector: {
    width: 2,
    height: 40, // Adjust height as needed
    backgroundColor: COLORS.lightGray,
  },
  timelineDetails: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  statusTitle: {
    fontSize: SIZES.body3,
    fontWeight: 'bold',
  },
  statusDate: {
    fontSize: SIZES.body4,
    color: COLORS.gray,
  },
  // Summary
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: SIZES.base,
  },
  summaryRowTotal: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: SIZES.base,
    paddingTop: SIZES.base,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  summaryLabel: {
    fontSize: SIZES.body3,
    color: COLORS.dark,
  },
  summaryValue: {
    fontSize: SIZES.body3,
    color: COLORS.dark,
  },
  summaryLabelTotal: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  summaryValueTotal: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  // Address
  addressContainer: {
    alignItems: 'flex-end',
  },
  addressText: {
    fontSize: SIZES.body3,
    color: COLORS.dark,
    marginBottom: SIZES.base / 2,
  },
  // Customer Info
  infoContainer: {
    alignItems: 'flex-end',
  },
  infoText: {
    fontSize: SIZES.body3,
    color: COLORS.dark,
    marginBottom: SIZES.base / 2,
  },
  // Notes
  notesText: {
    fontSize: SIZES.body3,
    color: COLORS.dark,
    textAlign: 'right',
    lineHeight: SIZES.body3 * 1.5,
  },
  // Driver Info
  driverInfoContainer: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SIZES.radius,
    padding: SIZES.base,
    marginBottom: SIZES.base,
  },
  driverInfoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: SIZES.base / 2,
  },
  driverInfoActions: {
    justifyContent: 'space-between',
  },
  driverInfoText: {
    fontSize: SIZES.body3,
    color: COLORS.dark,
    marginRight: SIZES.base,
  },
  callButton: {
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default OrderDetailsScreen;
