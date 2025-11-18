import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OrdersContext } from '../../context/OrdersContext';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import OrderCard from '../../components/OrderCard';
import EarningsCard from '../../components/EarningsCard';

const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const { orderHistory, loading, getOrderHistory } = useContext(OrdersContext);
  
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('all'); // today, week, month, all

  useEffect(() => {
    loadHistory();
  }, [period]);

  const loadHistory = async () => {
    await getOrderHistory(period);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  };

  const calculateStats = () => {
    let totalOrders = 0;
    let totalEarnings = 0;
    let totalRating = 0;
    let ratingCount = 0;

    orderHistory.forEach(order => {
      totalOrders++;
      totalEarnings += order.deliveryFee || 0;
      if (order.driverRating) {
        totalRating += order.driverRating;
        ratingCount++;
      }
    });

    return {
      totalOrders,
      totalEarnings,
      averageRating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0,
    };
  };

  const stats = calculateStats();

  const renderOrder = ({ item }) => (
    <OrderCard
      order={item}
      isAvailable={false}
      onDetails={() => navigation.navigate('OrderDetails', { orderId: item.id })}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>سجل الطلبات</Text>
      
      {/* Period Selector */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[styles.periodButton, period === 'today' && styles.periodButtonActive]}
          onPress={() => setPeriod('today')}
        >
          <Text style={[styles.periodButtonText, period === 'today' && styles.periodButtonTextActive]}>اليوم</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, period === 'week' && styles.periodButtonActive]}
          onPress={() => setPeriod('week')}
        >
          <Text style={[styles.periodButtonText, period === 'week' && styles.periodButtonTextActive]}>الأسبوع</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, period === 'month' && styles.periodButtonActive]}
          onPress={() => setPeriod('month')}
        >
          <Text style={[styles.periodButtonText, period === 'month' && styles.periodButtonTextActive]}>الشهر</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.periodButton, period === 'all' && styles.periodButtonActive]}
          onPress={() => setPeriod('all')}
        >
          <Text style={[styles.periodButtonText, period === 'all' && styles.periodButtonTextActive]}>الكل</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <EarningsCard 
          title="عدد الطلبات" 
          amount={stats.totalOrders} 
          icon="cube" 
          color={COLORS.primary}
        />
        <EarningsCard 
          title="إجمالي الأرباح" 
          amount={`${stats.totalEarnings} جنيه`} 
          icon="cash" 
          color={COLORS.success}
        />
        <EarningsCard 
          title="متوسط التقييم" 
          amount={stats.averageRating} 
          icon="star" 
          color={COLORS.warning}
        />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}

      {loading && orderHistory.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : orderHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>لا توجد طلبات في السجل</Text>
        </View>
      ) : (
        <FlatList
          data={orderHistory}
          renderItem={renderOrder}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.card,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
 periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.background,
    marginHorizontal: 3,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 12,
    color: COLORS.text,
  },
  periodButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default OrderHistoryScreen;