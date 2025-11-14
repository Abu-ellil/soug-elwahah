import React from 'react';
import { View } from 'react-native';
import SkeletonLoader from './SkeletonLoader';
import SIZES from '../constants/sizes';
import COLORS from '../constants/colors';

const StoreDetailsScreenSkeleton = () => {
  return (
    <View className="flex-1 p-4">
      {/* Image Skeleton */}
      <SkeletonLoader className="w-full h-[200px] mb-4" backgroundColor={COLORS.lightGray} />

      {/* Header Skeleton */}
      <View className="mb-4">
        <SkeletonLoader className="w-[70%] h-[30px] mb-2" backgroundColor={COLORS.lightGray} />
        <SkeletonLoader className="w-[50%] h-[20px]" backgroundColor={COLORS.lightGray} />
      </View>

      {/* Info Row Skeleton */}
      <View className="flex-row justify-between mb-4"> 
        <SkeletonLoader className="w-[30%] h-[50px]" backgroundColor={COLORS.lightGray} />
        <SkeletonLoader className="w-[30%] h-[50px]" backgroundColor={COLORS.lightGray} />
        <SkeletonLoader className="w-[30%] h-[50px]" backgroundColor={COLORS.lightGray} />
      </View> 

      {/* Product Skeletons */}
      {[...Array(3)].map((_, i) => (
        <View key={i} className="flex-row mb-4">
          <SkeletonLoader className="w-[100px] h-[100px] mr-4" backgroundColor={COLORS.lightGray} />
          <View className="flex-1 justify-center">
            <SkeletonLoader className="w-[80%] h-[20px] mb-2" backgroundColor={COLORS.lightGray} />
            <SkeletonLoader className="w-[40%] h-[20px]" backgroundColor={COLORS.lightGray} />
          </View>
        </View>
      ))}
    </View>
  );
};

export default StoreDetailsScreenSkeleton;
