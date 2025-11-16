import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define merchant application type
interface MerchantApplication {
  id: string;
  name: string;
  phone: string;
  storeName: string;
  storeDescription: string;
  storeImage?: string;
  approved: boolean;
  createdAt: string;
}

const AdminScreen = () => {
  const [applications, setApplications] = useState<MerchantApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const merchantsData = await AsyncStorage.getItem('merchants');
      if (merchantsData) {
        const merchants: MerchantApplication[] = JSON.parse(merchantsData);
        // Filter to show only pending applications
        const pendingApps = merchants.filter((merchant) => merchant.approved === false);
        setApplications(pendingApps);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء تحميل طلبات التسجيل');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const merchantsData = await AsyncStorage.getItem('merchants');
      if (merchantsData) {
        const merchants: MerchantApplication[] = JSON.parse(merchantsData);
        const updatedMerchants = merchants.map((merchant) =>
          merchant.id === id ? { ...merchant, approved: true } : merchant
        );
        await AsyncStorage.setItem('merchants', JSON.stringify(updatedMerchants));

        // Update local state
        setApplications(applications.filter((app) => app.id !== id));

        Alert.alert('تم', 'تم قبول طلب التسجيل بنجاح');
      }
    } catch (error) {
      console.error('Error approving application:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء قبول طلب التسجيل');
    }
  };

  const handleReject = async (id: string) => {
    Alert.alert('رفض الطلب', 'هل أنت متأكد أنك تريد رفض هذا الطلب؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'رفض',
        style: 'destructive',
        onPress: async () => {
          try {
            const merchantsData = await AsyncStorage.getItem('merchants');
            if (merchantsData) {
              const merchants: MerchantApplication[] = JSON.parse(merchantsData);
              const updatedMerchants = merchants.filter((merchant) => merchant.id !== id);
              await AsyncStorage.setItem('merchants', JSON.stringify(updatedMerchants));

              // Update local state
              setApplications(applications.filter((app) => app.id !== id));

              Alert.alert('تم', 'تم رفض طلب التسجيل');
            }
          } catch (error) {
            console.error('Error rejecting application:', error);
            Alert.alert('خطأ', 'حدث خطأ أثناء رفض طلب التسجيل');
          }
        },
      },
    ]);
  };

  const renderApplication = ({ item }: { item: MerchantApplication }) => (
    <View style={styles.applicationCard}>
      <View style={styles.applicationInfo}>
        <View style={styles.storeImageContainer}>
          {item.storeImage ? (
            <Ionicons name="image" size={40} color="#9CA3AF" />
          ) : (
            <Ionicons name="image-outline" size={40} color="#D1D5DB" />
          )}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.storeName}>{item.storeName}</Text>
          <Text style={styles.ownerName}>{item.name}</Text>
          <Text style={styles.phone}>{item.phone}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.storeDescription}
          </Text>
          <Text style={styles.date}>
            تم التسجيل: {new Date(item.createdAt).toLocaleDateString('ar-EG')}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.approveButton} onPress={() => handleApprove(item.id)}>
          <Ionicons name="checkmark" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.rejectButton} onPress={() => handleReject(item.id)}>
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
        <Text style={styles.headerTitle}>إدارة طلبات التسجيل</Text>
      </View>

      {/* Applications List */}
      <FlatList
        data={applications}
        renderItem={renderApplication}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={60} color="#D1D5DB" />
            <Text style={styles.emptyText}>لا توجد طلبات معلقة</Text>
            <Text style={styles.emptySubtext}>جميع طلبات التسجيل تمت معالجتها</Text>
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
});

export default AdminScreen;
