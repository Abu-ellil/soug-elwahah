import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { SIZES } from '../constants/sizes';
import COLORS from '../constants/colors';

const StoreDetailsScreenSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Image Skeleton */}
      <SkeletonLoader style={styles.image} backgroundColor={COLORS.lightGray} />

      {/* Header Skeleton */}
      <View style={styles.header}>
        <SkeletonLoader style={styles.title} backgroundColor={COLORS.lightGray} />
        <SkeletonLoader style={styles.subtitle} backgroundColor={COLORS.lightGray} />
      </View>

      {/* Info Row Skeleton */}
      <View style={styles.infoRow}>
        <SkeletonLoader style={styles.infoItem} backgroundColor={COLORS.lightGray} />
        <SkeletonLoader style={styles.infoItem} backgroundColor={COLORS.lightGray} />
        <SkeletonLoader style={styles.infoItem} backgroundColor={COLORS.lightGray} />
      </View>

      {/* Product Skeletons */}
      {[...Array(3)].map((_, i) => (
        <View key={i} style={styles.productCard}>
          <SkeletonLoader style={styles.productImage} backgroundColor={COLORS.lightGray} />
          <View style={styles.productInfo}>
            <SkeletonLoader style={styles.productTitle} backgroundColor={COLORS.lightGray} />
            <SkeletonLoader style={styles.productPrice} backgroundColor={COLORS.lightGray} />
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: SIZES.padding,
  },
  header: {
    marginBottom: SIZES.padding,
  },
  title: {
    width: '70%',
    height: 30,
    marginBottom: SIZES.base,
  },
  subtitle: {
    width: '50%',
    height: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding,
  },
  infoItem: {
    width: '30%',
    height: 50,
  },
  productCard: {
    flexDirection: 'row',
    marginBottom: SIZES.padding,
  },
  productImage: {
    width: 100,
    height: 100,
    marginRight: SIZES.padding,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  productTitle: {
    width: '80%',
    height: 20,
    marginBottom: SIZES.base,
  },
  productPrice: {
    width: '40%',
    height: 20,
  },
});

export default StoreDetailsScreenSkeleton;
