import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

const StatusBadge = ({ status, text }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return COLORS.available;
      case 'accepted':
        return COLORS.accepted;
      case 'picked_up':
        return COLORS.picked_up;
      case 'on_way':
        return COLORS.on_way;
      case 'delivered':
        return COLORS.delivered;
      case 'confirmed':
        return COLORS.secondary;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status) => {
    if (text) return text;
    
    switch (status) {
      case 'pending':
        return 'معلق';
      case 'accepted':
        return 'مقبول';
      case 'picked_up':
        return 'تم الاستلام';
      case 'on_way':
        return 'في الطريق';
      case 'delivered':
        return 'تم التسليم';
      case 'confirmed':
        return 'تم التأكيد';
      default:
        return status;
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getStatusColor(status) }]}>
      <Text style={styles.statusText}>{getStatusText(status)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default StatusBadge;