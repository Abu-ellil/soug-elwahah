import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import apiService from '../../services/api';
import Toast from 'react-native-toast-message';

const PendingApprovalScreen = () => {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [stores, setStores] = useState<any[]>([]);

  const checkApprovalStatus = async () => {
    try {
      setIsLoading(true);
      // Get all stores for the user
      const storesResponse = await apiService.getMyStores();
      if (storesResponse && storesResponse.data && storesResponse.data.stores) {
        const userStores = storesResponse.data.stores;
        setStores(userStores);

        // Check if any store is approved
        const approvedStores = userStores.filter((store: any) => store.verificationStatus === 'approved');
        if (approvedStores.length > 0) {
          router.replace('/');
          Toast.show({
            type: 'success',
            text1: 'تم',
            text2: 'تم قبول أحد متاجرك! يمكنك الآن إدارة منتجاتك.',
          });
          return;
        }

        // Check if any store is rejected
        const rejectedStores = userStores.filter((store: any) => store.verificationStatus === 'rejected');
        if (rejectedStores.length > 0) {
          Toast.show({
            type: 'error',
            text1: 'تم الرفض',
            text2: 'تم رفض أحد متاجرك، يرجى الاتصال بالدعم.',
          });
        }
      }
    } catch (error) {
      console.error('Error checking approval status:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

 const handleRefresh = async () => {
    setRefreshing(true);
    await checkApprovalStatus();
  };

  useEffect(() => {
    // Check approval status on component mount
    checkApprovalStatus();
    
    // Set up interval to check status every 30 seconds
    const interval = setInterval(checkApprovalStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      <View className="flex-1 px-6 pt-10 pb-20">
        {/* Status Card */}
        <View className="mb-8 items-center">
          <View className="h-24 w-24 items-center justify-center rounded-full bg-yellow-100">
            <Ionicons name="time-outline" size={48} color="#F59E0B" />
          </View>
          <Text className="mt-4 text-2xl font-bold text-gray-800">في انتظار الموافقة</Text>
          <Text className="mt-2 text-center text-base text-gray-600">
            تم تقديم طلب تسجيل متجرك
          </Text>
        </View>

        {/* Information Card */}
        <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <View className="mb-4 flex-row items-center">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Ionicons name="information-circle-outline" size={24} color="#3B82F6" />
            </View>
            <Text className="text-lg font-semibold text-gray-800">حالة الحساب</Text>
          </View>

          <View className="mb-4">
            <Text className="text-base text-gray-600">
              اسم التاجر: <Text className="font-medium">{currentUser?.name || 'غير محدد'}</Text>
            </Text>
            <Text className="text-base text-gray-600">
              رقم الهاتف: <Text className="font-medium">{currentUser?.phone || 'غير محدد'}</Text>
            </Text>
            <Text className="text-base text-gray-600">
              حالة الحساب: <Text className="font-medium text-yellow-600">في انتظار الموافقة</Text>
            </Text>
          </View>

          <Text className="text-sm text-gray-500">
            سيتم مراجعة متجرك من قبل فريق الإدارة، وستتلقى إشعارًا فور قبول متجرك.
          </Text>
        </View>

        {/* Store Applications */}
        {stores.length > 0 && (
          <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
            <View className="mb-4 flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Ionicons name="storefront-outline" size={24} color="#10B981" />
              </View>
              <Text className="text-lg font-semibold text-gray-800">طلبات المتاجر</Text>
            </View>

            {stores.map((store: any) => (
              <View key={store._id} className="mb-4 p-4 bg-gray-50 rounded-lg">
                <View className="mb-2 flex-row justify-between items-center">
                  <Text className="text-base font-semibold text-gray-800">{store.name}</Text>
                  <View className={`px-3 py-1 rounded-full ${
                    store.verificationStatus === 'pending' ? 'bg-yellow-100' :
                    store.verificationStatus === 'approved' ? 'bg-green-100' :
                    store.verificationStatus === 'rejected' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <Text className={`text-sm font-medium ${
                      store.verificationStatus === 'pending' ? 'text-yellow-800' :
                      store.verificationStatus === 'approved' ? 'text-green-800' :
                      store.verificationStatus === 'rejected' ? 'text-red-800' : 'text-gray-800'
                    }`}>
                      {store.verificationStatus === 'pending' ? 'قيد المراجعة' :
                       store.verificationStatus === 'approved' ? 'مُعتمد' :
                       store.verificationStatus === 'rejected' ? 'مرفوض' : store.verificationStatus}
                    </Text>
                  </View>
                </View>

                {store.description && (
                  <Text className="text-sm text-gray-600 mb-2">{store.description}</Text>
                )}

                <View className="flex-row justify-between text-sm text-gray-500">
                  <Text>تاريخ التقديم: {new Date(store.createdAt).toLocaleDateString('ar-EG')}</Text>
                  {store.verificationStatus === 'pending' && (
                    <Text>قيد المراجعة من قبل الإدارة</Text>
                  )}
                </View>

                {store.verificationStatus === 'rejected' && store.rejectionReason && (
                  <View className="mt-2 p-2 bg-red-50 rounded">
                    <Text className="text-sm text-red-800">
                      سبب الرفض: {store.rejectionReason}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* What happens next */}
        <View className="mb-6 rounded-xl bg-white p-6 shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-gray-800">ما الذي سيحدث بعد الموافقة؟</Text>
          
          <View className="mb-3 flex-row items-center">
            <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-green-500">
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
            <Text className="text-base text-gray-600">القدرة على إضافة المنتجات إلى متجرك</Text>
          </View>
          
          <View className="mb-3 flex-row items-center">
            <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-green-500">
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
            <Text className="text-base text-gray-600">القدرة على إدارة الطلبات</Text>
          </View>
          
          <View className="flex-row items-center">
            <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-green-500">
              <Ionicons name="checkmark" size={16} color="white" />
            </View>
            <Text className="text-base text-gray-600">القدرة على عرض الإحصائيات</Text>
          </View>
        </View>

        {/* Refresh Button */}
        <TouchableOpacity
          onPress={handleRefresh}
          disabled={isLoading}
          className="items-center rounded-xl bg-blue-500 py-4">
          <Text className="text-lg font-bold text-white">
            {isLoading ? 'جاري التحقق...' : 'التحقق من الحالة'}
          </Text>
        </TouchableOpacity>

        {/* Create New Store Button */}
        <TouchableOpacity
          onPress={() => router.push('/(tabs)/store-application')}
          className="mt-4 items-center rounded-xl bg-green-500 py-4">
          <Text className="text-lg font-bold text-white">
            إنشاء متجر جديد
          </Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={async () => {
            await logout();
          }}
          className="mt-4 items-center rounded-xl border border-gray-300 py-4">
          <Text className="text-lg font-bold text-gray-700">تسجيل خروج</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PendingApprovalScreen;
