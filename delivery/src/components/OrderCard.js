import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import StatusBadge from './StatusBadge';

const OrderCard = ({ order, onAccept, onDetails, isAvailable = false }) => {
  return (
    <View style={styles.card}>
      {/* Order Header */}
      <View style={styles.header}>
        <Text style={styles.orderId}>#{order.id}</Text>
        <Text style={styles.timeAgo}>{order.timeAgo || 'الآن'}</Text>
      </View>

      {/* Store Info */}
      <View style={styles.storeInfo}>
        <Ionicons name="storefront-outline" size={20} color={COLORS.primary} />
        <View style={styles.storeDetails}>
          <Text style={styles.storeName}>{order.storeName}</Text>
          <Text style={styles.distance}>{order.distance || '2.5 كم'}</Text>
        </View>
      </View>

      {/* Route Info */}
      <View style={styles.routeInfo}>
        <View style={styles.routeRow}>
          <Ionicons name="storefront-outline" size={16} color={COLORS.storeMarker} />
          <Text style={styles.routeText}>{order.storeAddress}</Text>
        </View>
        <View style={styles.routeRow}>
          <Ionicons name="home-outline" size={16} color={COLORS.customerMarker} />
          <Text style={styles.routeText}>{order.customerAddress}</Text>
        </View>
        <View style={styles.routeRow}>
          <Ionicons name="swap-horizontal" size={16} color={COLORS.textSecondary} />
          <Text style={styles.routeText}>المسافة: {order.totalDistance || '5.3 كم'}</Text>
          <Text style={styles.routeText}>الوقت: {order.estimatedTime || '15-20 دقيقة'}</Text>
        </View>
      </View>

      {/* Earnings */}
      <View style={styles.earnings}>
        <Text style={styles.earningsLabel}>أرباحك:</Text>
        <Text style={styles.earningsAmount}>{order.deliveryFee || '15'} جنيه</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {isAvailable && onAccept && (
          <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
            <Text style={styles.acceptButtonText}>قبول الطلب</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.detailsButton} onPress={onDetails}>
          <Text style={styles.detailsButtonText}>عرض التفاصيل</Text>
        </TouchableOpacity>
      </View>

      {/* Status Badge if not available */}
      {!isAvailable && order.status && (
        <View style={styles.statusContainer}>
          <StatusBadge status={order.status} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  timeAgo: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeDetails: {
    marginLeft: 12,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  distance: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  routeInfo: {
    marginBottom: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  routeText: {
    fontSize: 14,
    color: COLORS.text,
    marginRight: 8,
    flex: 1,
  },
  earnings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  earningsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  earningsAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: COLORS.success,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  acceptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  detailsButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
});

export default OrderCard;