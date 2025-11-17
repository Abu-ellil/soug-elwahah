import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { API } from '../../services/api';
import { formatPrice } from '../../utils/helpers';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import COLORS from '../../constants/colors';
import SIZES from '../../constants/sizes';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const OrdersScreen = ({ navigation }) => {
  const { orders: cartOrders } = useCart();
  const { token, isAuthenticated } = useAuth();

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, current, completed
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getFilterCounts = () => {
    const currentOrders = orders.filter((order) =>
      ['pending', 'confirmed', 'delivering'].includes(order.status)
    );
    const completedOrders = orders.filter((order) =>
      ['delivered', 'cancelled'].includes(order.status)
    );

    return {
      all: orders.length,
      current: currentOrders.length,
      completed: completedOrders.length,
    };
  };

  const filterCounts = getFilterCounts();

  const filters = useMemo(
    () => [
      { id: 'all', name: 'الكل', count: filterCounts.all },
      { id: 'current', name: 'حالية', count: filterCounts.current },
      { id: 'completed', name: 'منتهية', count: filterCounts.completed },
    ],
    [filterCounts]
  );

  useEffect(() => {
    loadOrders();
  }, [cartOrders, isAuthenticated]);

  useEffect(() => {
    if (orders.length > 0) {
      filterOrders();
    } else {
      setFilteredOrders([]);
    }
  }, [orders]);

  useEffect(() => {
    if (orders.length > 0) {
      filterOrders();
    }
  }, [selectedFilter]);

  const loadOrders = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      // Fetch orders from API instead of using mock data
      const response = await API.ordersAPI.getMyOrders(token);
      if (response.success) {
        const apiOrders = response.data.orders;
        setOrders(apiOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const filterOrders = useCallback(() => {
    if (!orders || orders.length === 0) {
      setFilteredOrders([]);
      return;
    }

    let filtered = [];

    switch (selectedFilter) {
      case 'current':
        filtered = orders.filter((order) => {
          const isCurrent = ['pending', 'confirmed', 'delivering'].includes(order.status);
          console.log(`🔍 Order ${order.id} status: ${order.status}, isCurrent: ${isCurrent}`);
          return isCurrent;
        });
        break;
      case 'completed':
        filtered = orders.filter((order) => {
          const isCompleted = ['delivered', 'cancelled'].includes(order.status);
          console.log(`🔍 Order ${order.id} status: ${order.status}, isCompleted: ${isCompleted}`);
          return isCompleted;
        });
        break;
      case 'all':
      default:
        filtered = orders;
        break;
    }

    setFilteredOrders(filtered);
  }, [orders, selectedFilter]);

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { text: 'في الانتظار', color: COLORS.warning, icon: 'schedule' },
      confirmed: { text: 'مؤكد', color: COLORS.info, icon: 'check-circle' },
      delivering: { text: 'قيد التوصيل', color: COLORS.primary, icon: 'local-shipping' },
      delivered: { text: 'تم التوصيل', color: COLORS.success, icon: 'check-circle' },
      cancelled: { text: 'ملغي', color: COLORS.danger, icon: 'cancel' },
    };

    return statusMap[status] || statusMap.pending;
  };

  const getOrderProgress = (order) => {
    const totalSteps = 4; // pending, confirmed, delivering, delivered
    const completedSteps = order.timeline?.length || 1;
    return Math.min((completedSteps / totalSteps) * 100, 100);
  };

  const handleOrderPress = (order) => {
    if (!order) {
      console.error('Order is undefined or null');
      return;
    }
    navigation.navigate('OrderDetails', { order });
  };

  const renderOrderItem = ({ item }) => {
    const statusInfo = getStatusInfo(item.status);
    const progress = getOrderProgress(item);

    return (
      <TouchableOpacity style={styles.orderCard} onPress={() => handleOrderPress(item)}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>طلب #{item.id.slice(-4)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20' }]}>
            <MaterialIcons name={statusInfo.icon} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.text}</Text>
          </View>
        </View>

        {/* Store Info */}
        <View style={styles.storeInfo}>
          <MaterialIcons name="store" size={16} color={COLORS.primary} />
          <Text style={styles.storeName}>{item.storeName}</Text>
        </View>

        {/* Order Items */}
        <View style={styles.itemsInfo}>
          <MaterialIcons name="inventory" size={16} color={COLORS.textSecondary} />
          <Text style={styles.itemsText}>
            {item.items.length} منتج • {formatPrice(item.total)}
          </Text>
        </View>

        {/* Progress Bar */}
        {['pending', 'confirmed', 'delivering'].includes(item.status) && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${progress}%`,
                    backgroundColor: statusInfo.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}

        {/* Timeline Preview */}
        {item.timeline && item.timeline.length > 0 && (
          <View style={styles.timelinePreview}>
            <Text style={styles.timelineText}>
              آخر تحديث:{' '}
              {new Date(item.timeline[item.timeline.length - 1].time).toLocaleDateString('ar-EG')}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFilterButton = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.filterButton, selectedFilter === item.id && styles.activeFilter]}
      onPress={() => {
        console.log(`🎯 Filter button pressed: ${item.id} (${item.name})`);
        setSelectedFilter(item.id);
      }}>
      <Text style={[styles.filterText, selectedFilter === item.id && styles.activeFilterText]}>
        {item.name}
      </Text>
      {item.count > 0 && (
        <View style={styles.filterBadge}>
          <Text style={styles.filterBadgeText}>{item.count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return <LoadingSpinner fullScreen text="جاري تحميل الطلبات..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        title="طلباتي"
        showBack
        onLeftPress={() => navigation.goBack()}
        rightComponent={
          <TouchableOpacity
            onPress={() => {
              if (isAuthenticated) {
                navigation.getParent().navigate('Home');
              } else {
                navigation.navigate('Auth', { screen: 'Login' });
              }
            }}
            style={styles.shopButton}>
            <MaterialIcons name="shopping-cart" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={filters}
          renderItem={renderFilterButton}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {/* Orders List */}
      <View style={styles.content}>
        {filteredOrders.length > 0 ? (
          <FlatList
            data={filteredOrders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
              />
            }
            contentContainerStyle={styles.ordersList}
          />
        ) : (
          <EmptyState
            icon="document-outline"
            title={isAuthenticated ? 'لا توجد طلبات' : 'سجل دخولك لعرض طلباتك'}
            message={
              isAuthenticated
                ? selectedFilter === 'current'
                  ? 'لا توجد طلبات جارية حالياً'
                  : 'لم تقم بأي طلبات بعد'
                : 'سجل دخولك لعرض طلباتك السابقة'
            }
            actionText={isAuthenticated ? 'تسوق الآن' : 'تسجيل الدخول'}
            onActionPress={() => {
              if (isAuthenticated) {
                navigation.getParent().navigate('Home');
              } else {
                navigation.navigate('Auth', { screen: 'Login' });
              }
            }}
          />
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (isAuthenticated) {
              navigation.getParent().navigate('Home');
            } else {
              navigation.navigate('Auth', { screen: 'Login' });
            }
          }}>
          <MaterialIcons name="home" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>الرئيسية</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            if (isAuthenticated) {
              navigation.navigate('Cart');
            } else {
              navigation.navigate('Auth', { screen: 'Login' });
            }
          }}>
          <MaterialIcons name="shopping-cart" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>السلة</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  filtersContainer: {
    backgroundColor: COLORS.card,
    paddingVertical: SIZES.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  filtersList: {
    paddingHorizontal: SIZES.padding,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    marginRight: SIZES.base,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.lightGray,
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: SIZES.body2,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  activeFilterText: {
    color: COLORS.card,
  },
  filterBadge: {
    backgroundColor: COLORS.danger,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  filterBadgeText: {
    color: COLORS.card,
    fontSize: 10,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  shopButton: {
    padding: SIZES.base,
  },
  ordersList: {
    padding: SIZES.padding,
  },
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    marginBottom: SIZES.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  orderId: {
    fontSize: SIZES.h6,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.base / 2,
    paddingVertical: 4,
    borderRadius: SIZES.borderRadius / 2,
  },
  statusText: {
    fontSize: SIZES.caption,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base / 2,
  },
  storeName: {
    fontSize: SIZES.body2,
    color: COLORS.primary,
    marginRight: SIZES.base / 2,
    fontWeight: '600',
    textAlign: 'right',
  },
  itemsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base,
  },
  itemsText: {
    fontSize: SIZES.body3,
    color: COLORS.textSecondary,
    marginRight: SIZES.base / 2,
    textAlign: 'right',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.base / 2,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: COLORS.lightGray,
    borderRadius: 2,
    marginRight: SIZES.base,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  timelinePreview: {
    marginTop: SIZES.base / 2,
    paddingTop: SIZES.base / 2,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  timelineText: {
    fontSize: SIZES.caption,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  driverLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.base / 2,
    paddingHorizontal: SIZES.base,
    borderRadius: SIZES.borderRadius,
    marginTop: SIZES.base,
    alignSelf: 'flex-end',
  },
  driverLocationButtonText: {
    fontSize: SIZES.body3,
    color: COLORS.white,
    marginRight: SIZES.base / 2,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    padding: SIZES.padding,
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    gap: SIZES.base,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.base,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  actionText: {
    fontSize: SIZES.body2,
    color: COLORS.primary,
    fontWeight: '600',
    marginRight: 4,
  },
});

export default OrdersScreen;
