import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatDistance } from '../utils/distance';
import COLORS from '../constants/colors';

const StoreCard = ({ store, onPress }) => {
  const isOpen = store.isOpen;
  const statusColor = isOpen ? COLORS.success : COLORS.danger;
  const statusText = isOpen ? 'مفتوح' : 'مغلق';

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: store.image }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={12} color={COLORS.warning} />
          <Text style={styles.ratingText}>
            {store.rating}
          </Text>
        </View>
        <View style={styles.statusBadge}>
          <View
            style={[styles.statusDot, { backgroundColor: statusColor }]}
          />
          <Text
            style={[styles.statusText, { color: statusColor }]}
          >
            {statusText}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>
          {store.name}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>
              {store.distance ? formatDistance(store.distance) : 'غير محدد'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.infoText}>
              {store.deliveryTime}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 128,
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
    color: COLORS.text,
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: COLORS.text,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    marginRight: 4,
    color: COLORS.textSecondary,
  },
});

export default StoreCard;