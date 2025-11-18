import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import { useNavigation } from '@react-navigation/native';
import { OrdersContext } from '../../context/OrdersContext';
import { LocationContext } from '../../context/LocationContext';
import { COLORS } from '../../constants/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Linking } from 'react-native';

const { width, height } = Dimensions.get('window');

const ActiveOrderScreen = () => {
  const navigation = useNavigation();
  const { activeOrder, updateOrderStatus, loading } = useContext(OrdersContext);
  const { currentLocation, startTracking } = useContext(LocationContext);
  
  const [currentTab, setCurrentTab] = useState(0);
  const [driverLocation, setDriverLocation] = useState({
    latitude: 31.1110,
    longitude: 30.9390,
  });

  useEffect(() => {
    // Start location tracking when order is active
    if (activeOrder) {
      startTracking();
    }
  }, [activeOrder]);

  const handleStatusUpdate = async (newStatus) => {
    if (!activeOrder) return;
    
    const result = await updateOrderStatus(activeOrder.id, newStatus);
    if (!result.success) {
      Alert.alert('خطأ', result.error || 'حدث خطأ أثناء تحديث الحالة');
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color={COLORS.textSecondary} />
      <Text style={styles.emptyText}>لا يوجد طلب نشط حالياً</Text>
      <TouchableOpacity 
        style={styles.findOrdersButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.findOrdersButtonText}>ابحث عن طلبات جديدة</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMap = () => {
    if (!activeOrder) return null;
    
    // Calculate region to fit all points
    const storeLocation = {
      latitude: activeOrder.storeLatitude || 31.120,
      longitude: activeOrder.storeLongitude || 30.9400,
    };
    
    const customerLocation = {
      latitude: activeOrder.customerLatitude || 31.100,
      longitude: activeOrder.customerLongitude || 30.9380,
    };
    
    const region = {
      latitude: (driverLocation.latitude + storeLocation.latitude + customerLocation.latitude) / 3,
      longitude: (driverLocation.longitude + storeLocation.longitude + customerLocation.longitude) / 3,
      latitudeDelta: Math.abs(Math.max(driverLocation.latitude, storeLocation.latitude, customerLocation.latitude) - 
                             Math.min(driverLocation.latitude, storeLocation.latitude, customerLocation.latitude)) * 1.5,
      longitudeDelta: Math.abs(Math.max(driverLocation.longitude, storeLocation.longitude, customerLocation.longitude) - 
                              Math.min(driverLocation.longitude, storeLocation.longitude, customerLocation.longitude)) * 1.5,
    };

    // Define route points based on status
    let routePoints = [];
    if (activeOrder.status === 'accepted' || activeOrder.status === 'picked_up') {
      // From driver to store
      routePoints = [driverLocation, storeLocation];
    } else if (activeOrder.status === 'on_way' || activeOrder.status === 'delivered') {
      // From store to customer
      routePoints = [storeLocation, customerLocation];
    }

    return (
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        showsUserLocation={true}
        showsMyLocationButton={false}
      >
        {/* Driver Marker */}
        <Marker
          coordinate={driverLocation}
          title="موقعك"
          pinColor={COLORS.driverMarker}
        >
          <View style={styles.driverMarker}>
            <MaterialCommunityIcons name="motorbike" size={24} color={COLORS.driverMarker} />
          </View>
        </Marker>

        {/* Store Marker */}
        <Marker
          coordinate={storeLocation}
          title={activeOrder.storeName}
          pinColor={COLORS.storeMarker}
        >
          <View style={styles.storeMarker}>
            <Ionicons name="storefront" size={20} color={COLORS.storeMarker} />
          </View>
        </Marker>

        {/* Customer Marker */}
        <Marker
          coordinate={customerLocation}
          title={activeOrder.customerName}
          pinColor={COLORS.customerMarker}
        >
          <View style={styles.customerMarker}>
            <Ionicons name="home" size={20} color={COLORS.customerMarker} />
          </View>
        </Marker>

        {/* Route Line */}
        {routePoints.length > 1 && (
          <Polyline
            coordinates={routePoints}
            strokeColor={activeOrder.status === 'accepted' || activeOrder.status === 'picked_up' 
              ? COLORS.warning 
              : COLORS.route}
            strokeWidth={4}
          />
        )}
      </MapView>
    );
  };

  const renderOrderInfo = () => {
    if (!activeOrder) return null;

    const tabs = [
      { title: 'معلومات الطلب', icon: 'cube' },
      { title: 'معلومات المحل', icon: 'storefront' },
      { title: 'معلومات العميل', icon: 'person' },
      { title: 'تفاصيل الطلب', icon: 'information-circle' },
    ];

    const renderTabContent = () => {
      switch (currentTab) {
        case 0: // Order Info
          return (
            <View style={styles.tabContent}>
              <View style={styles.orderIdContainer}>
                <Text style={styles.orderId}>#{activeOrder.id}</Text>
              </View>
              
              {/* Timeline */}
              <View style={styles.timelineContainer}>
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, activeOrder.status !== 'pending' && styles.timelineDotCompleted]} />
                  <Text style={styles.timelineText}>تم القبول</Text>
                  <Text style={styles.timelineStatus}>{activeOrder.status === 'accepted' ? '✓' : ''}</Text>
                </View>
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, (activeOrder.status === 'picked_up' || activeOrder.status === 'on_way' || activeOrder.status === 'delivered') && styles.timelineDotCompleted]} />
                  <Text style={styles.timelineText}>استلم من المحل</Text>
                  <Text style={styles.timelineStatus}>{activeOrder.status === 'picked_up' || activeOrder.status === 'on_way' || activeOrder.status === 'delivered' ? '✓' : ''}</Text>
                </View>
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, (activeOrder.status === 'on_way' || activeOrder.status === 'delivered') && styles.timelineDotCompleted]} />
                  <Text style={styles.timelineText}>في الطريق</Text>
                  <Text style={styles.timelineStatus}>{activeOrder.status === 'on_way' || activeOrder.status === 'delivered' ? '✓' : ''}</Text>
                </View>
                <View style={styles.timelineItem}>
                  <View style={[styles.timelineDot, activeOrder.status === 'delivered' && styles.timelineDotCompleted]} />
                  <Text style={styles.timelineText}>تم التسليم</Text>
                  <Text style={styles.timelineStatus}>{activeOrder.status === 'delivered' ? '✓' : ''}</Text>
                </View>
              </View>
            </View>
          );
        case 1: // Store Info
          return (
            <View style={styles.tabContent}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>{activeOrder.storeName}</Text>
                <Text style={styles.infoText}>{activeOrder.storeAddress}</Text>
                <View style={styles.contactRow}>
                  <Text style={styles.infoText}>{activeOrder.storePhone}</Text>
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={() => Linking.openURL(`tel:${activeOrder.storePhone}`)}
                  >
                    <Ionicons name="call" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={styles.mapButton}
                  onPress={() => Linking.openURL(`https://maps.google.com/?q=${activeOrder.storeLatitude || 31.1120},${activeOrder.storeLongitude || 30.9400}`)}
                >
                  <Ionicons name="map-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.mapButtonText}>فتح الموقع في الخريطة</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        case 2: // Customer Info
          return (
            <View style={styles.tabContent}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>{activeOrder.customerName}</Text>
                <Text style={styles.infoText}>{activeOrder.customerAddress}</Text>
                <View style={styles.contactRow}>
                  <Text style={styles.infoText}>{activeOrder.customerPhone}</Text>
                  <TouchableOpacity 
                    style={styles.contactButton}
                    onPress={() => Linking.openURL(`tel:${activeOrder.customerPhone}`)}
                  >
                    <Ionicons name="call" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
                {activeOrder.notes ? (
                  <View style={styles.notesContainer}>
                    <Text style={styles.notesLabel}>ملاحظات:</Text>
                    <Text style={styles.notesText}>{activeOrder.notes}</Text>
                  </View>
                ) : null}
                <TouchableOpacity 
                  style={styles.mapButton}
                  onPress={() => Linking.openURL(`https://maps.google.com/?q=${activeOrder.customerLatitude || 31.1100},${activeOrder.customerLongitude || 30.9380}`)}
                >
                  <Ionicons name="map-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.mapButtonText}>فتح الموقع في الخريطة</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        case 3: // Order Details
          return (
            <View style={styles.tabContent}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>قائمة المنتجات</Text>
                {activeOrder.items?.map((item, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={styles.itemText}>{item.name}</Text>
                    <Text style={styles.itemText}>{item.quantity} × {item.price} جنيه</Text>
                  </View>
                ))}
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>قيمة الطلب:</Text>
                  <Text style={styles.totalText}>{activeOrder.totalAmount} جنيه</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>طريقة الدفع:</Text>
                  <Text style={styles.totalText}>{activeOrder.paymentMethod === 'cash' ? 'نقداً' : 'أونلاين'}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={[styles.totalLabel, styles.earningsLabel]}>أرباحك:</Text>
                  <Text style={[styles.totalText, styles.earningsText]}>{activeOrder.deliveryFee} جنيه</Text>
                </View>
              </View>
            </View>
          );
        default:
          return null;
      }
    };

    return (
      <View style={styles.orderInfoContainer}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.tab, currentTab === index && styles.activeTab]}
              onPress={() => setCurrentTab(index)}
            >
              <Ionicons 
                name={tab.icon} 
                size={20} 
                color={currentTab === index ? COLORS.primary : COLORS.textSecondary} 
              />
              <Text style={[styles.tabText, currentTab === index && styles.activeTabText]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}
      </View>
    );
  };

  const renderActionButtons = () => {
    if (!activeOrder) return null;

    let buttonConfig = {};
    
    switch (activeOrder.status) {
      case 'accepted':
        buttonConfig = {
          text: 'وصلت للمحل',
          onPress: () => handleStatusUpdate('picked_up'),
          color: COLORS.success,
        };
        break;
      case 'picked_up':
        buttonConfig = {
          text: 'في الطريق للعميل',
          onPress: () => handleStatusUpdate('on_way'),
          color: COLORS.primary,
        };
        break;
      case 'on_way':
        buttonConfig = {
          text: 'تم التسليم',
          onPress: () => handleStatusUpdate('delivered'),
          color: COLORS.success,
        };
        break;
      default:
        return null;
    }

    return (
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: buttonConfig.color }]}
          onPress={buttonConfig.onPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.actionButtonText}>{buttonConfig.text}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (!activeOrder) {
    return renderEmptyState();
  }

  return (
    <View style={styles.container}>
      {/* Map View (50% of screen) */}
      <View style={styles.mapContainer}>
        {renderMap()}
        
        {/* Floating Buttons */}
        <View style={styles.floatingButtons}>
          <TouchableOpacity style={styles.floatingButton}>
            <Ionicons name="expand" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatingButton}>
            <Ionicons name="locate" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.floatingButton}
            onPress={() => Linking.openURL(`https://maps.google.com/?q=${driverLocation.latitude},${driverLocation.longitude}`)}
          >
            <Ionicons name="logo-google" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Order Info Card (50% of screen) */}
      <View style={styles.infoCardContainer}>
        {renderOrderInfo()}
      </View>

      {/* Action Buttons */}
      {renderActionButtons()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
 emptyText: {
    fontSize: 18,
    color: COLORS.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
  findOrdersButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  findOrdersButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapContainer: {
    height: height * 0.5,
  },
  map: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  mapPlaceholder: {
    textAlign: 'center',
    padding: 10,
    fontSize: 14,
    color: '#666',
  },
  floatingButtons: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  floatingButton: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoCardContainer: {
    flex: 1,
    backgroundColor: COLORS.card,
  },
  orderInfoContainer: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
 tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
 orderIdContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
 orderId: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  timelineContainer: {
    marginTop: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.textSecondary,
    marginRight: 10,
  },
  timelineDotCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  timelineText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  timelineStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 10,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactButton: {
    backgroundColor: COLORS.background,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  mapButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  notesContainer: {
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.text,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  itemText: {
    fontSize: 14,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  totalLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  earningsLabel: {
    color: COLORS.primary,
  },
  earningsText: {
    color: COLORS.primary,
    fontSize: 16,
  },
  actionButtonsContainer: {
    padding: 16,
    backgroundColor: COLORS.card,
  },
  actionButton: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ActiveOrderScreen;