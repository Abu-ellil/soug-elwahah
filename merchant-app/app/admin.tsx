import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/api';

// Define store type with pending coordinates
interface StoreWithPendingCoordinates {
  _id: string;
 name: string;
 categoryId: {
    name: string;
 };
  ownerId: {
    name: string;
    phone: string;
  };
  pendingCoordinates: {
    lat: number;
    lng: number;
  };
  createdAt: string;
}

const AdminScreen = () => {
  const [stores, setStores] = useState<StoreWithPendingCoordinates[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadStoresWithPendingCoordinates();
  }, []);

  const loadStoresWithPendingCoordinates = async () => {
    try {
      setLoading(true);
      const response = await apiService.request('/admin/stores/pending-coordinates', {
        method: 'GET'
      });
      
      if (response.success) {
        setStores(response.data.stores);
      } else {
        Alert.alert('خطأ', response.message || 'حدث خطأ أثناء تحميل المتاجر');
      }
    } catch (error) {
      console.error('Error loading stores with pending coordinates:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل المتاجر');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (storeId: string) => {
    Alert.alert('قبول الإحداثيات', 'هل أنت متأكد أنك تريد قبول الإحداثيات الجديدة لهذا المتجر؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'قبول',
        style: 'default',
        onPress: async () => {
          try {
            const response = await apiService.request(`/admin/stores/${storeId}/approve-coordinates`, {
              method: 'PATCH'
            });
            
            if (response.success) {
              // Update local state
              setStores(stores.filter(store => store._id !== storeId));
              Alert.alert('تم', 'تم قبول الإحداثيات بنجاح');
            } else {
              Alert.alert('خطأ', response.message || 'حدث خطأ أثناء قبول الإحداثيات');
            }
          } catch (error) {
            console.error('Error approving coordinates:', error);
            Alert.alert('خطأ', 'حدث خطأ أثناء قبول الإحداثيات');
          }
        },
      },
    ]);
 };

  const handleReject = async (storeId: string) => {
    Alert.alert('رفض الإحداثيات', 'هل أنت متأكد أنك تريد رفض الإحداثيات الجديدة لهذا المتجر؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'رفض',
        style: 'destructive',
        onPress: async () => {
          try {
            const response = await apiService.request(`/admin/stores/${storeId}/reject-coordinates`, {
              method: 'PATCH'
            });
            
            if (response.success) {
              // Update local state
              setStores(stores.filter(store => store._id !== storeId));
              Alert.alert('تم', 'تم رفض الإحداثيات');
            } else {
              Alert.alert('خطأ', response.message || 'حدث خطأ أثناء رفض الإحداثيات');
            }
          } catch (error) {
            console.error('Error rejecting coordinates:', error);
            Alert.alert('خطأ', 'حدث خطأ أثناء رفض الإحداثيات');
          }
        },
      },
    ]);
 };

  const onRefresh = () => {
    setRefreshing(true);
    loadStoresWithPendingCoordinates();
  };

  const renderStore = ({ item }: { item: StoreWithPendingCoordinates }) => (
    <View style={styles.applicationCard}>
      <View style={styles.applicationInfo}>
        <View style={styles.storeImageContainer}>
          <Ionicons name="location-outline" size={40} color="#9CA3AF" />
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.storeName}>{item.name}</Text>
          <Text style={styles.ownerName}>{item.ownerId.name}</Text>
          <Text style={styles.phone}>{item.ownerId.phone}</Text>
          <Text style={styles.category}>{item.categoryId.name}</Text>
          <Text style={styles.coordinates}>
            الإحداثيات الجديدة: ({item.pendingCoordinates.lat.toFixed(6)}, {item.pendingCoordinates.lng.toFixed(6)})
          </Text>
          <Text style={styles.date}>
            تم التحديث: {new Date(item.createdAt).toLocaleDateString('ar-EG')}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.approveButton} onPress={() => handleApprove(item._id)}>
          <Ionicons name="checkmark" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectButton} onPress={() => handleReject(item._id)}>
          <Ionicons name="close" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>جاري التحميل...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>إدارة إحداثيات المتاجر</Text>
      </View>

      {/* Stores List */}
      <FlatList
        data={stores}
        renderItem={renderStore}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>لا توجد إحداثيات معلقة</Text>
            <Text style={styles.emptySubtext}>جميع طلبات تحديث الإحداثيات تمت معالجتها</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 16,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  applicationCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  applicationInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  storeImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  phone: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginLeft: 12,
  },
  approveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
  category: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  coordinates: {
    fontSize: 12,
    color: '#3B82F6',
    marginBottom: 4,
  },
});

export default AdminScreen;
