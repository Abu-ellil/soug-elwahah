import React from 'react';
import { View, Text } from 'react-native';
import { useAuthStore } from '../stores/authStore';

export const StoreDebugInfo: React.FC = () => {
  const { currentUser } = useAuthStore();

  if (!currentUser) return null;

  return (
    <View style={{ 
      backgroundColor: '#F3F4F6', 
      padding: 16, 
      margin: 16, 
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E5E7EB'
    }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8, color: '#374151' }}>
        🔍 معلومات المتجر للتشخيص
      </Text>
      
      <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
        اسم المستخدم: {currentUser.name}
      </Text>
      
      <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 4 }}>
        عدد المتاجر: {currentUser.stores?.length || 0}
      </Text>
      
      {currentUser.stores && currentUser.stores.length > 0 ? (
        currentUser.stores.map((store: any, index: number) => (
          <View key={store._id || index} style={{ 
            marginTop: 8, 
            padding: 8, 
            backgroundColor: 'white', 
            borderRadius: 4,
            borderLeftWidth: 4,
            borderLeftColor: store.verificationStatus === 'approved' ? '#10B981' : 
                           store.verificationStatus === 'pending' ? '#F59E0B' : '#EF4444'
          }}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#374151' }}>
              المتجر {index + 1}: {store.name || 'غير محدد'}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              الحالة: {store.verificationStatus || 'غير محدد'}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              نشط: {store.isActive ? 'نعم' : 'لا'}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280' }}>
              معرف المتجر: {store._id || 'غير محدد'}
            </Text>
          </View>
        ))
      ) : (
        <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: 'bold' }}>
          ❌ لا توجد متاجر!
        </Text>
      )}
      
      {/* Check if any store is approved */}
      {(() => {
        const hasApprovedStore = currentUser.stores?.some(
          (store: any) => store.verificationStatus === 'approved'
        ) || false;
        
        return (
          <Text style={{ 
            fontSize: 14, 
            fontWeight: 'bold', 
            marginTop: 8,
            color: hasApprovedStore ? '#10B981' : '#EF4444'
          }}>
            {hasApprovedStore ? '✅ لديك متجر معتمد' : '❌ لا يوجد متجر معتمد'}
          </Text>
        );
      })()}
    </View>
  );
};