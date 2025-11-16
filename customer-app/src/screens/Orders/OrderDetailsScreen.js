import React, { useEffect, useRef, Fragment } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import Header from '../../components/Header';
import RTLText from '../../components/RTLText';
import CartItem from '../../components/CartItem'; // Re-using for order items
import COLORS from '../../constants/colors';
import SIZES from '../../constants/sizes';

const OrderDetailsScreen = () => {
  const route = useRoute();
  const { order, focusOnDriverLocation } = route.params || {};
  const scrollViewRef = useRef(null);

  // Helper function to get flat list data
  const getFlatListData = () => {
    const data = [];

    // Driver location map has been removed

    // Add items list
    if (order.items && order.items.length > 0) {
      data.push({ type: 'items', items: order.items.filter(Boolean) });
    }

    // Add order summary
    data.push({ type: 'summary', order });

    // Add customer information if exists
    if (order.customerInfo) {
      data.push({ type: 'customer', order });
    }

    // Add delivery address
    data.push({ type: 'address', order });

    // Add order notes if exists
    if (order.notes && order.notes.trim() !== '') {
      data.push({ type: 'notes', order });
    }

    return data;
  };

  // Removed focusOnDriverLocation effect since map functionality was removed

  const handleCallDriver = () => {
    if (order && order.driverInfo && order.driverInfo.phone) {
      Linking.openURL(`tel:${order.driverInfo.phone}`);
    }
  };

  const renderTimelineStep = ({ item, index }) => {
    const isLastStep = order.statusHistory && index === order.statusHistory.length - 1;
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

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="تفاصيل الطلب" showBackButton={true} />
        <View style={styles.centerContainer}>
          <RTLText style={styles.errorText}>لم يتم العثور على تفاصيل الطلب</RTLText>
        </View>
      </SafeAreaView>
    );
  }

  const renderFlatListItem = ({ item }) => {
    switch (item.type) {
      case 'items':
        return (
          <View style={styles.section}>
            <RTLText style={styles.sectionTitle}>المنتجات</RTLText>
            {item.items.map((item) => (
              <CartItem
                item={item}
                key={item.id || item.productId || Math.random()}
                isCartScreen={false}
              />
            ))}
          </View>
        );

      case 'summary':
        return (
          <View style={styles.section}>
            <RTLText style={styles.sectionTitle}>ملخص الطلب</RTLText>
            {item.order && item.order.storeName && (
              <View style={styles.summaryRow}>
                <RTLText style={styles.summaryLabel}>المتجر</RTLText>
                <RTLText style={styles.summaryValue}>{item.order.storeName}</RTLText>
              </View>
            )}
            <View style={styles.summaryRow}>
              <RTLText style={styles.summaryLabel}>المجموع الفرعي</RTLText>
              <RTLText style={styles.summaryValue}>د.إ {item.order.subtotal.toFixed(2)}</RTLText>
            </View>
            <View style={styles.summaryRow}>
              <RTLText style={styles.summaryLabel}>رسوم التوصيل</RTLText>
              <RTLText style={styles.summaryValue}>د.إ {item.order.deliveryFee.toFixed(2)}</RTLText>
            </View>
            <View style={styles.summaryRow}>
              <RTLText style={styles.summaryLabel}>طريقة الدفع</RTLText>
              <RTLText style={styles.summaryValue}>
                {item.order.paymentMethod === 'cash'
                  ? 'الدفع عند الاستلام'
                  : item.order.paymentMethod === 'fawry'
                    ? 'فوري'
                    : item.order.paymentMethod === 'vodafone_cash'
                      ? 'فودافون كاش'
                      : item.order.paymentMethod === 'orange_money'
                        ? 'أورانج ماني'
                        : item.order.paymentMethod}
              </RTLText>
            </View>
            {item.order && item.order.deliverySlot && (
              <View style={styles.summaryRow}>
                <RTLText style={styles.summaryLabel}>وقت التوصيل</RTLText>
                <RTLText style={styles.summaryValue}>{item.order.deliverySlot.name}</RTLText>
              </View>
            )}
            <View style={styles.summaryRowTotal}>
              <RTLText style={styles.summaryLabelTotal}>المجموع الكلي</RTLText>
              <RTLText style={styles.summaryValueTotal}>د.إ {item.order.total.toFixed(2)}</RTLText>
            </View>
          </View>
        );

      case 'customer':
        return (
          <View style={styles.section}>
            <RTLText style={styles.sectionTitle}>معلومات العميل</RTLText>
            <View style={styles.infoContainer}>
              <RTLText style={styles.infoText}>الاسم: {item.order.customerInfo.name}</RTLText>
              <RTLText style={styles.infoText}>الهاتف: {item.order.customerInfo.phone}</RTLText>
            </View>
          </View>
        );

      case 'address':
        return (
          <View style={styles.section}>
            <RTLText style={styles.sectionTitle}>عنوان التوصيل</RTLText>
            <View style={styles.addressContainer}>
              <RTLText style={styles.addressText}>
                {item.order.deliveryAddress && item.order.deliveryAddress.street
                  ? item.order.deliveryAddress.street
                  : 'N/A'}
              </RTLText>
              <RTLText style={styles.addressText}>
                {item.order.deliveryAddress && item.order.deliveryAddress.village
                  ? item.order.deliveryAddress.village
                  : 'N/A'}
              </RTLText>
            </View>
          </View>
        );

      case 'notes':
        return (
          <View style={styles.section}>
            <RTLText style={styles.sectionTitle}>ملاحظات</RTLText>
            <RTLText style={styles.notesText}>{item.order.notes}</RTLText>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={`الطلب #${order.id || 'N/A'}`} showBackButton={true} />
      <FlatList
        ref={scrollViewRef}
        data={getFlatListData()}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        renderItem={renderFlatListItem}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        ListHeaderComponent={
          // Order Timeline (moved to ListHeaderComponent to appear first)
          <View style={styles.section}>
            <RTLText style={styles.sectionTitle}>تتبع الطلب</RTLText>
            {order.statusHistory && order.statusHistory.length > 0
              ? order.statusHistory.map((item, index) => (
                  <Fragment key={item.id || item.date || index}>
                    {renderTimelineStep({ item, index })}
                  </Fragment>
                ))
              : null}
          </View>
        }
      />
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  errorText: {
    fontSize: SIZES.h3,
    color: COLORS.danger,
    textAlign: 'center',
  },
});

export default OrderDetailsScreen;
