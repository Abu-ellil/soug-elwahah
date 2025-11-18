import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { OrdersContext } from '../../context/OrdersContext';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import OrderCard from '../../components/OrderCard';

const AvailableOrdersScreen = () => {
  const navigation = useNavigation();
  const { 
    availableOrders, 
    loading, 
    getAvailableOrders, 
    acceptOrder 
  } = useContext(OrdersContext);
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('nearest');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    await getAvailableOrders();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleAcceptOrder = async (orderId) => {
    const result = await acceptOrder(orderId);
    if (result.success) {
      Alert.alert('نجاح', 'تم قبول الطلب بنجاح', [
        { text: 'تم', onPress: () => navigation.navigate('Orders') }
      ]);
    } else {
      Alert.alert('خطأ', result.error || 'حدث خطأ أثناء قبول الطلب');
    }
  };

  const renderOrder = ({ item }) => (
    <OrderCard
      order={item}
      isAvailable={true}
      onAccept={() => handleAcceptOrder(item.id)}
      onDetails={() => navigation.navigate('OrderDetails', { orderId: item.id })}
    />
 );

  const renderFilterTabs = () => (
    <View style={styles.filterContainer}>
      {['nearest', 'highest', 'latest'].map((filter) => (
        <TouchableOpacity
          key={filter}
          style={[
            styles.filterTab,
            activeFilter === filter && styles.activeFilterTab
          ]}
          onPress={() => setActiveFilter(filter)}
        >
          <Text style={[
            styles.filterText,
            activeFilter === filter && styles.activeFilterText
          ]}>
            {filter === 'nearest' ? 'الأقرب إليك' : 
             filter === 'highest' ? 'الأعلى قيمة' : 'الأحدث'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>الطلبات المتاحة</Text>
        <View style={styles.headerActions}>
          <Text style={styles.ordersCount}>{availableOrders.length} طلب</Text>
          <TouchableOpacity onPress={onRefresh} disabled={loading}>
            <Ionicons name="refresh" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      {renderFilterTabs()}

      {loading && availableOrders.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : availableOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cube-outline" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>لا توجد طلبات متاحة حالياً</Text>
        </View>
      ) : (
        <FlatList
          data={availableOrders}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ordersCount: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginRight: 15,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    padding: 10,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeFilterTab: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    color: COLORS.text,
  },
  activeFilterText: {
    color: 'white',
    fontWeight: 'bold',
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

export default AvailableOrdersScreen;