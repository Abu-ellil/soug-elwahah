import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { STORES } from '../../data/stores';
import { PRODUCTS } from '../../data/products';
import { formatPrice } from '../../utils/helpers';
import Header from '../../components/Header';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import COLORS from '../../constants/colors';
import SIZES from '../../constants/sizes';
import { useCart } from '../../context/CartContext';

const OrdersScreen = ({ navigation }) => {
  const { orders: cartOrders } = useCart();

  // Debug: Log orders data from context
  console.log('🛒 OrdersScreen - cartOrders received:', cartOrders);
  console.log('📊 OrdersScreen - cartOrders count:', cartOrders?.length || 0);
  console.log('🎯 OrdersScreen - first order sample:', cartOrders?.[0]);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, current, completed
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Debug: Log initial state
  useEffect(() => {
    console.log('🎯 OrdersScreen - Initial render');
    console.log('📋 OrdersScreen - Initial cartOrders:', cartOrders);
    console.log('🎯 OrdersScreen - Initial selectedFilter:', selectedFilter);
    console.log('📊 OrdersScreen - Initial orders state:', orders);
    console.log('📋 OrdersScreen - Initial filteredOrders:', filteredOrders);
  }, []);

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
  }, [cartOrders]);

  useEffect(() => {
    console.log('🔄 OrdersScreen - Orders changed, triggering filter');
    console.log('📋 OrdersScreen - New orders count:', orders.length);
    
    if (orders.length > 0) {
      console.log('✅ OrdersScreen - Calling filterOrders with new orders');
      filterOrders();
    } else {
      console.log('⚠️ OrdersScreen - No orders to filter');
      setFilteredOrders([]);
    }
  }, [orders]);

  useEffect(() => {
    console.log('🔄 OrdersScreen - Filter changed, re-filtering');
    console.log('🎯 OrdersScreen - New selectedFilter:', selectedFilter);
    console.log('📋 OrdersScreen - Current orders count:', orders.length);
    
    if (orders.length > 0) {
      console.log('✅ OrdersScreen - Calling filterOrders with new filter');
      filterOrders();
    }
  }, [selectedFilter]);

  // Debug: Log filteredOrders changes
  useEffect(() => {
    console.log('📋 OrdersScreen - filteredOrders updated:', filteredOrders.length);
    console.log('🎯 OrdersScreen - Current selectedFilter:', selectedFilter);
    console.log('📊 OrdersScreen - Total orders:', orders.length);
  }, [filteredOrders]);

  const loadOrders = useCallback(async () => {
    try {
      console.log('🔄 OrdersScreen - Starting to load orders...');
      console.log('📋 OrdersScreen - cartOrders data:', cartOrders);
      
      // Use orders from CartContext instead of mock data
      setTimeout(() => {
        console.log('⚡ OrdersScreen - Processing orders in setTimeout');
        
        if (!cartOrders || !Array.isArray(cartOrders)) {
          console.log('⚠️ OrdersScreen - cartOrders is not an array or is undefined');
          setOrders([]);
          setLoading(false);
          return;
        }
        
        const enrichedOrders = cartOrders.map((order, index) => {
          console.log(`📝 Processing order ${index}:`, order);
          
          if (!order || typeof order !== 'object') {
            console.log(`⚠️ Order ${index} is invalid:`, order);
            return null;
          }
          
          const store = STORES.find((s) => s.id === order.storeId);
          const enrichedItems = order.items?.map((item) => {
            const product = PRODUCTS.find((p) => p.id === item.productId);
            return {
              ...item,
              name: product?.name || 'منتج غير معروف',
              image: product?.image || '',
            };
          }) || [];

          return {
            ...order,
            storeName: store?.name || 'متجر غير معروف',
            storeImage: store?.image || '',
            items: enrichedItems,
          };
        }).filter(Boolean); // Remove null entries

        console.log('✅ OrdersScreen - Enriched orders:', enrichedOrders);
        console.log('📊 OrdersScreen - Final orders count:', enrichedOrders.length);
        
        setOrders(enrichedOrders);
        setLoading(false);
        
        // Debug: Check if filterOrders will be triggered after setting orders
        console.log('🔄 OrdersScreen - Orders set, should trigger filterOrders useEffect');
        console.log('📊 OrdersScreen - Enriched orders count after set:', enrichedOrders.length);
      }, 1000);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      setLoading(false);
    }
  }, [cartOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const filterOrders = useCallback(() => {
    console.log('🔍 OrdersScreen - Filtering orders...');
    console.log('📋 OrdersScreen - All orders count:', orders.length);
    console.log('🎯 OrdersScreen - Selected filter:', selectedFilter);
    
    if (!orders || orders.length === 0) {
      console.log('⚠️ OrdersScreen - No orders to filter');
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
        console.log('📋 OrdersScreen - Showing all orders');
        break;
    }

    console.log('✅ OrdersScreen - Filtered orders count:', filtered.length);
    console.log('📊 OrdersScreen - First 3 filtered orders:', filtered.slice(0, 3));
    
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

  const handleShowDriverLocation = (order) => {
    // Navigate directly to order details with focus on driver location
    navigation.navigate('OrderDetails', { order, focusOnDriverLocation: true });
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

        {/* Driver Location Button - Only show for delivering orders */}
        {item.status === 'delivering' && item.driverLocation && (
          <TouchableOpacity 
            style={styles.driverLocationButton}
            onPress={() => handleShowDriverLocation(item)}
          >
            <MaterialIcons name="location-on" size={16} color={COLORS.white} />
            <Text style={styles.driverLocationButtonText}>عرض موقع السائق</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (filter) => (
    <TouchableOpacity
      key={filter.id}
      style={[styles.filterButton, selectedFilter === filter.id && styles.activeFilter]}
      onPress={() => {
        console.log(`🎯 Filter button pressed: ${filter.id} (${filter.name})`);
        setSelectedFilter(filter.id);
      }}>
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
