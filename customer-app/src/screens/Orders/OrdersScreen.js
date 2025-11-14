import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MOCK_ORDERS } from '../../data/orders';
import { STORES } from '../../data/stores';
import { PRODUCTS } from '../../data/products';
import { formatPrice } from '../../utils/helpers';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import COLORS from '../../constants/colors';
import SIZES from '../../constants/sizes';

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, current, completed
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const filters = [
    { id: 'all', name: 'الكل', count: 0 },
    { id: 'current', name: 'حالية', count: 0 },
    { id: 'completed', name: 'منتهية', count: 0 },
  ];

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    filterOrders();
  }, [filterOrders]);

  const loadOrders = useCallback(async () => {
    try {
      // In a real app, this would fetch from an API
      // For now, we'll use mock data
      setTimeout(() => {
        const enrichedOrders = MOCK_ORDERS.map((order) => {
          const store = STORES.find((s) => s.id === order.storeId);
          const enrichedItems = order.items.map((item) => {
            const product = PRODUCTS.find((p) => p.id === item.productId);
            return {
              ...item,
              name: product?.name || 'منتج غير معروف',
              image: product?.image || '',
            };
          });

          return {
            ...order,
            storeName: store?.name || 'متجر غير معروف',
            storeImage: store?.image || '',
            items: enrichedItems,
          };
        });

        setOrders(enrichedOrders);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading orders:', error);
      setLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const filterOrders = useCallback(() => {
    let filtered = orders;

    switch (selectedFilter) {
      case 'current':
        filtered = orders.filter((order) =>
          ['pending', 'confirmed', 'delivering'].includes(order.status)
        );
        break;
      case 'completed':
        filtered = orders.filter((order) => ['delivered', 'cancelled'].includes(order.status));
        break;
      default:
        filtered = orders;
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

  const renderFilterButton = (filter) => (
    <TouchableOpacity
      key={filter.id}
      style={[styles.filterButton, selectedFilter === filter.id && styles.activeFilter]}
      onPress={() => setSelectedFilter(filter.id)}>
      <Text style={[styles.filterText, selectedFilter === filter.id && styles.activeFilterText]}>
        {filter.name}
      </Text>
      {filter.count > 0 && (
        <View style={styles.filterBadge}>
          <Text style={styles.filterBadgeText}>{filter.count}</Text>
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
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.shopButton}>
            <MaterialIcons name="shopping-cart" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          data={filters}
          renderItem={({ item }) => renderFilterButton(item)}
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
            title="لا توجد طلبات"
            message={
              selectedFilter === 'current' ? 'لا توجد طلبات جارية حالياً' : 'لم تقم بأي طلبات بعد'
            }
            actionText="تسوق الآن"
            onActionPress={() => navigation.navigate('Home')}
          />
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Home')}>
          <MaterialIcons name="home" size={20} color={COLORS.primary} />
          <Text style={styles.actionText}>الرئيسية</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Cart')}>
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
