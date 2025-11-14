import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import { SIZES } from '../constants/sizes';
import COLORS from '../constants/colors';

const HomeScreenSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <SkeletonLoader style={styles.location} backgroundColor={COLORS.lightGray} />
        <SkeletonLoader style={styles.notification} backgroundColor={COLORS.lightGray} />
      </View>

      {/* Search Bar Skeleton */}
      <SkeletonLoader style={styles.searchBar} backgroundColor={COLORS.lightGray} />

      {/* Categories Skeleton */}
      <View style={styles.categories}>
        {[...Array(4)].map((_, i) => (
          <SkeletonLoader key={i} style={styles.categoryCard} backgroundColor={COLORS.lightGray} />
        ))}
      </View>

      {/* Store Card Skeletons */}
      {[...Array(3)].map((_, i) => (
        <SkeletonLoader key={i} style={styles.storeCard} backgroundColor={COLORS.lightGray} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SIZES.padding,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding,
  },
  location: {
    width: '60%',
    height: 20,
  },
  notification: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  searchBar: {
    height: 50,
    marginBottom: SIZES.padding,
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.padding,
  },
  categoryCard: {
    width: 80,
    height: 100,
  },
  storeCard: {
    height: 200,
    marginBottom: SIZES.padding,
  },
});

export default HomeScreenSkeleton;
