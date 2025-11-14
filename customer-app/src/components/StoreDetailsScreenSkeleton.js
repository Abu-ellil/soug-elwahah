import React from 'react';
import { View } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import SIZES from '../constants/sizes';
import COLORS from '../constants/colors';

const StoreDetailsScreenSkeleton = () => {
  return (
    <View className="flex-1 p-4">
      {/* Image Skeleton */}
      <SkeletonLoader className="mb-4 h-[200px] w-full" backgroundColor={COLORS.lightGray} />

      {/* Header Skeleton */}
      <View className="mb-4">
        <SkeletonLoader className="mb-2 h-[30px] w-[70%]" backgroundColor={COLORS.lightGray} />
        <SkeletonLoader className="h-[20px] w-[50%]" backgroundColor={COLORS.lightGray} />
      </View>

      {/* Info Row Skeleton */}
      <View className="mb-4 flex-row justify-between">
        <SkeletonLoader className="h-[50px] w-[30%]" backgroundColor={COLORS.lightGray} />
        <SkeletonLoader className="h-[50px] w-[30%]" backgroundColor={COLORS.lightGray} />
        <SkeletonLoader className="h-[50px] w-[30%]" backgroundColor={COLORS.lightGray} />
      </View>

      {/* Product Skeletons */}
      {[...Array(3)].map((_, i) => (
        <View key={i} className="mb-4 flex-row">
          <SkeletonLoader className="mr-4 h-[100px] w-[100px]" backgroundColor={COLORS.lightGray} />
          <View className="flex-1 justify-center">
            <SkeletonLoader className="mb-2 h-[20px] w-[80%]" backgroundColor={COLORS.lightGray} />
            <SkeletonLoader className="h-[20px] w-[40%]" backgroundColor={COLORS.lightGray} />
          </View>
        </View>
      ))}
    </View>
  );
};

export default StoreDetailsScreenSkeleton;
