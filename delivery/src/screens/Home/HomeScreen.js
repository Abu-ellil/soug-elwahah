import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/authStore';
import { useDriverStore } from '../../store/driverStore';
import { useOrdersStore } from '../../store/ordersStore';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import EarningsCard from '../../components/EarningsCard';
import StatusBadge from '../../components/StatusBadge';
import OrderCard from '../../components/OrderCard';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { driver: authDriver } = useAuthStore();
  const {
    isAvailable,
    stats,
    loading: driverLoading,
    toggleAvailability,
    updateDriverProfile
  } = useDriverStore();
  const {
    activeOrder,
    loading: ordersLoading,
    getAvailableOrders
  } = useOrdersStore();

  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [driver, setDriver] = useState(null);

  useEffect(() => {
    if (authDriver) {
      setDriver(authDriver);
      setVerificationStatus(authDriver.verificationStatus || 'pending');
    }
  }, [authDriver]);

  const handleToggleAvailability = async () => {
    if (verificationStatus !== 'approved') {
      Alert.alert('حالة الحساب', 'لا يمكن تغيير الحالة، الحساب غير مفعل');
      return;
    }
    
    const result = await toggleAvailability();
    if (!result.success) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تغيير الحالة');
    }
   };

  const handleFindOrders = () => {
    navigation.navigate('Orders');
  };

 const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'rejected':
        return 'close-circle';
      default:
        return 'help-circle';
    }
   };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'rejected':
        return COLORS.danger;
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header with Driver Info */}
      <View style={styles.header}>
        <View style={styles.driverInfo}>
          <Image source={{ uri: driver?.avatar || 'https://via.placeholder.com/100' }} style={styles.avatar} />
          <View style={styles.driverDetails}>
            <Text style={styles.driverName}>{driver?.name || 'السائق'}</Text>
            <Text style={styles.driverPhone}>{driver?.phone || ''}</Text>
            <View style={styles.verificationContainer}>
              <Ionicons
                name={getStatusIcon(verificationStatus)}
                size={16}
                color={getStatusColor(verificationStatus)}
              />
              <Text style={[styles.verificationText, { color: getStatusColor(verificationStatus) }]}>
                {verificationStatus === 'approved' ? 'مفعل' :
                 verificationStatus === 'pending' ? 'قيد المراجعة' : 'مرفوض'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={32} color={COLORS.warning} />
          <Text style={styles.ratingText}>{driver?.rating || '0.0'}</Text>
        </View>
      </View>

      {/* Availability Toggle */}
      <View style={styles.availabilityContainer}>
        {verificationStatus === 'approved' ? (
          <View style={styles.availabilityToggleContainer}>
            <Text style={styles.availabilityLabel}>
              {isAvailable ? 'متاح للتوصيل' : 'غير متاح'}
            </Text>
            <TouchableOpacity
              style={[styles.toggleButton, isAvailable ? styles.toggleOn : styles.toggleOff]}
              onPress={handleToggleAvailability}
              disabled={driverLoading}
            >
              {driverLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <View style={[styles.toggleThumb, isAvailable && styles.toggleThumbOn]} />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.verificationMessageContainer}>
            <Text style={styles.verificationMessage}>
              {verificationStatus === 'pending'
                ? 'طلبك قيد المراجعة، برجاء الانتظار'
                : verificationStatus === 'rejected'
                  ? `تم رفض طلبك: ${driver?.rejectionReason || 'تم رفض الحساب'}`
                  : 'حسابك غير مفعّل'}
            </Text>
            {verificationStatus === 'rejected' && (
              <TouchableOpacity
                style={styles.contactSupportButton}
                onPress={() => Alert.alert('الدعم', 'للتواصل مع الدعم: support@delivery.com')}
              >
                <Text style={styles.contactSupportText}>التواصل مع الدعم</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Today Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>إحصائيات اليوم</Text>
        <View style={styles.todayStatsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.todayOrders || 0}</Text>
            <Text style={styles.statLabel}>عدد الطلبات</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>{stats.todayEarnings || 0} جنيه</Text>
            <Text style={styles.statLabel}>الأرباح</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.todayHours || 0} س</Text>
            <Text style={styles.statLabel}>ساعات العمل</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats Grid */}
      <View style={styles.quickStatsContainer}>
        <EarningsCard
          title="إجمالي الطلبات"
          amount={driver?.totalOrders || 0}
          icon="cube"
          color={COLORS.primary}
        />
        <EarningsCard
          title="متوسط التقييم"
          amount={driver?.rating || 0}
          icon="star"
          color={COLORS.warning}
        />
        <EarningsCard
          title="أرباح الأسبوع"
          amount={`${stats.weeklyEarnings || 0} جنيه`}
          icon="cash"
          color={COLORS.success}
        />
      </View>

      {/* Active Order Card */}
      {activeOrder && (
        <View style={styles.activeOrderContainer}>
          <Text style={styles.sectionTitle}>الطلب الحالي</Text>
          <OrderCard
            order={activeOrder}
            isAvailable={false}
            onDetails={() => navigation.navigate('Orders')}
          />
        </View>
      )}

      {/* Find Orders Button */}
      {isAvailable && !activeOrder && verificationStatus === 'approved' && (
        <TouchableOpacity
          style={styles.findOrdersButton}
          onPress={handleFindOrders}
        >
          <Ionicons name="search" size={20} color="white" style={styles.findOrdersIcon} />
          <Text style={styles.findOrdersButtonText}>ابحث عن طلبات</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
 header: {
    backgroundColor: COLORS.card,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
 driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
 driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  driverPhone: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  verificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 5,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.warning,
  },
  availabilityContainer: {
    backgroundColor: COLORS.card,
    padding: 20,
    margin: 15,
    borderRadius: 12,
  },
  availabilityToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  toggleButton: {
    width: 60,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toggleOn: {
    backgroundColor: COLORS.success,
  },
  toggleOff: {
    backgroundColor: COLORS.textSecondary,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 1,
    backgroundColor: 'white',
  },
  toggleThumbOn: {
    alignSelf: 'flex-end',
  },
  verificationMessageContainer: {
    alignItems: 'center',
  },
  verificationMessage: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  contactSupportButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  contactSupportText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsContainer: {
    margin: 15,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  todayStatsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 5,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    marginHorizontal: 15,
    marginBottom: 15,
  },
  activeOrderContainer: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  findOrdersButton: {
    backgroundColor: COLORS.success,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    margin: 15,
    borderRadius: 12,
  },
  findOrdersIcon: {
    marginRight: 10,
  },
  findOrdersButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;