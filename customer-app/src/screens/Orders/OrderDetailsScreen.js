import React from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';

import Header from '../../components/Header';
import RTLText from '../../components/RTLText';
import CartItem from '../../components/CartItem'; // Re-using for order items
import { COLORS } from '../../constants/colors';
import { SIZES } from '../../constants/sizes';

const OrderDetailsScreen = () => {
  const route = useRoute();
  const { order } = route.params;

  const renderTimelineStep = ({ item, index }) => {
    const isLastStep = index === order.statusHistory.length - 1;
    const isCompleted = true; // In a real app, you'd compare with current status
    return (
      <View style={styles.timelineStep}>
        <View style={styles.timelineIconContainer}>
          <View style={[styles.timelineIcon, isCompleted ? styles.completedIcon : styles.pendingIcon]}>
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
      <ScrollView>
        {/* Order Timeline */}
        <View style={styles.section}>
          <RTLText style={styles.sectionTitle}>تتبع الطلب</RTLText>
          <FlatList
            data={order.statusHistory}
            renderItem={renderTimelineStep}
            keyExtractor={(item) => item.status}
            scrollEnabled={false}
          />
        </View>

        {/* Items List */}
        <View style={styles.section}>
          <RTLText style={styles.sectionTitle}>المنتجات</RTLText>
          {order.items.map(item => (
            <CartItem item={item} key={item.id} isCartScreen={false} />
          ))}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <RTLText style={styles.sectionTitle}>ملخص الطلب</RTLText>
          <View style={styles.summaryRow}>
            <RTLText style={styles.summaryLabel}>المجموع الفرعي</RTLText>
            <RTLText style={styles.summaryValue}>د.إ {order.subtotal.toFixed(2)}</RTLText>
          </View>
          <View style={styles.summaryRow}>
            <RTLText style={styles.summaryLabel}>رسوم التوصيل</RTLText>
            <RTLText style={styles.summaryValue}>د.إ {order.deliveryFee.toFixed(2)}</RTLText>
          </View>
          <View style={styles.summaryRowTotal}>
            <RTLText style={styles.summaryLabelTotal}>المجموع الكلي</RTLText>
            <RTLText style={styles.summaryValueTotal}>د.إ {order.total.toFixed(2)}</RTLText>
          </View>
        </View>

         {/* Delivery Address */}
         <View style={styles.section}>
          <RTLText style={styles.sectionTitle}>عنوان التوصيل</RTLText>
          <View style={styles.addressContainer}>
            <RTLText style={styles.addressText}>{order.deliveryAddress.street}</RTLText>
            <RTLText style={styles.addressText}>{order.deliveryAddress.village}</RTLText>
          </View>
        </View>

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
});

export default OrderDetailsScreen;
