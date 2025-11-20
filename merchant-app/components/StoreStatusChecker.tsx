import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import apiService from '../services/api';

export const StoreStatusChecker: React.FC = () => {
  const { currentUser } = useAuthStore();
  const [storeStatus, setStoreStatus] = useState<any>(null);

  useEffect(() => {
    checkStoreStatus();
  }, [currentUser]);

  const checkStoreStatus = async () => {
    if (!currentUser) return;

    try {
      // Try to get user profile to see store status
      const response = await apiService.getProfile();
      if (response.success && response.data) {
        setStoreStatus(response.data);
      }
    } catch (error: any) {
      console.error('Error checking store status:', error);
    }
  };

  const getStoreStatusText = () => {
    if (!storeStatus?.stores || storeStatus.stores.length === 0) {
      return {
        status: 'no_store',
        title: 'لا يوجد متجر',
        message: 'لم تقم بإنشاء متجر بعد',
        color: '#EF4444'
      };
    }

    const approvedStores = storeStatus.stores.filter((store: any) => 
      store.verificationStatus === 'approved'
    );

    if (approvedStores.length > 0) {
      return {
        status: 'approved',
        title: 'المتجر معتمد',
        message: `لديك ${approvedStores.length} متجر معتمد`,
        color: '#10B981'
      };
    }

    const pendingStores = storeStatus.stores.filter((store: any) => 
      store.verificationStatus === 'pending'
    );

    if (pendingStores.length > 0) {
      return {
        status: 'pending',
        title: 'في انتظار الاعتماد',
        message: `لديك ${pendingStores.length} متجر في انتظار الاعتماد`,
        color: '#F59E0B'
      };
    }

    const rejectedStores = storeStatus.stores.filter((store: any) => 
      store.verificationStatus === 'rejected'
    );

    if (rejectedStores.length > 0) {
      return {
        status: 'rejected',
        title: 'مرفوض',
        message: `لديك ${rejectedStores.length} متجر مرفوض`,
        color: '#EF4444'
      };
    }

    return {
      status: 'unknown',
      title: 'حالة غير معروفة',
      message: 'يرجى التواصل مع الدعم',
      color: '#6B7280'
    };
  };

  if (!currentUser) return null;

  const statusInfo = getStoreStatusText();

  return (
    <View className="mx-4 mb-4 p-4 rounded-xl border-l-4" 
          style={{ backgroundColor: `${statusInfo.color}10`, borderLeftColor: statusInfo.color }}>
      <View className="flex-row items-center">
        <Ionicons 
          name={statusInfo.status === 'approved' ? 'checkmark-circle' : 
                statusInfo.status === 'pending' ? 'time' : 
                statusInfo.status === 'rejected' ? 'close-circle' : 
                'help-circle'} 
          size={20} 
          color={statusInfo.color} 
        />
        <View className="ml-3 flex-1">
          <Text className="font-semibold" style={{ color: statusInfo.color }}>
            {statusInfo.title}
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            {statusInfo.message}
          </Text>
        </View>
      </View>
      
      {statusInfo.status !== 'approved' && (
        <TouchableOpacity
          className="mt-3 px-4 py-2 rounded-lg"
          style={{ backgroundColor: statusInfo.color }}
          onPress={() => {
            // Navigate to store application
            console.log('Navigate to store application');
          }}
        >
          <Text className="text-white text-center font-medium">
            {statusInfo.status === 'no_store' ? 'إنشاء متجر' : 'مراجعة الطلب'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};