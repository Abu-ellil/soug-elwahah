import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import apiService from "../../services/api";
import Toast from "react-native-toast-message";

const HomeScreen = () => {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch statistics
      const statsResponse = await apiService.getStatistics();
      if (statsResponse.success && statsResponse.data) {
        setStats({
          totalProducts: statsResponse.data.totalProducts || 0,
          totalOrders: statsResponse.data.totalOrders || 0,
          pendingOrders: statsResponse.data.pendingOrders || 0,
          revenue: statsResponse.data.revenue || 0,
        });
      }

      // Fetch recent orders (last 5)
      const ordersResponse = await apiService.getOrders();
      if (ordersResponse.success && ordersResponse.data) {
        setRecentOrders(ordersResponse.data.orders?.slice(0, 5) || []);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: error.message || 'فشل في تحميل بيانات لوحة التحكم',
      });
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  useEffect(() => {
    if (currentUser) {
      // Check if user has approved stores before fetching dashboard data
      const hasApprovedStores = currentUser.stores?.some((store: any) =>
        typeof store === 'object' ? store.verificationStatus === 'approved' : true
      );

      if (hasApprovedStores) {
        fetchDashboardData();
      } else {
        // User doesn't have approved stores, they should be redirected by layout
        // but if they somehow get here, show empty state
        setStats({
          totalProducts: 0,
          totalOrders: 0,
          pendingOrders: 0,
          revenue: 0,
        });
        setRecentOrders([]);
        setIsLoading(false);
      }
    }
  }, [currentUser]);

  if (authLoading || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>جاري تحميل البيانات...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>مرحبًا، {currentUser?.name}</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => router.push("/(tabs)/products")}
        >
          <View style={styles.statIconContainer}>
            <Ionicons name="cube" size={24} color="#3B82F6" />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{stats.totalProducts}</Text>
            <Text style={styles.statLabel}>المنتجات</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="cart" size={24} color="#10B981" />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>الطلبات</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="time" size={24} color="#F59E0B" />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{stats.pendingOrders}</Text>
            <Text style={styles.statLabel}>الطلبات المعلقة</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="cash" size={24} color="#EF4444" />
          </View>
          <View style={styles.statTextContainer}>
            <Text style={styles.statValue}>{stats.revenue} ج.م</Text>
            <Text style={styles.statLabel}>الإيرادات</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الإجراءات السريعة</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(tabs)/products")}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="add-circle" size={24} color="#3B82F6" />
            </View>
            <Text style={styles.actionText}>إضافة منتج</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="storefront" size={24} color="#10B981" />
            </View>
            <Text style={styles.actionText}>تعديل المتجر</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Orders */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الطلبات الحديثة</Text>
        <View style={styles.ordersContainer}>
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <TouchableOpacity key={order._id} style={styles.orderCard}>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderId}>#{order.orderNumber || order._id.slice(-6)}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                  </Text>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={[
                    styles.orderStatus,
                    order.status === 'pending' && styles.pendingStatus,
                    order.status === 'confirmed' && styles.confirmedStatus,
                    order.status === 'completed' && styles.completedStatus,
                    order.status === 'cancelled' && styles.cancelledStatus,
                  ]}>
                    {order.status === 'pending' ? 'معلق' :
                     order.status === 'confirmed' ? 'مؤكد' :
                     order.status === 'completed' ? 'مكتمل' :
                     order.status === 'cancelled' ? 'ملغي' : order.status}
                  </Text>
                  <Text style={styles.orderTotal}>{order.totalAmount} ج.م</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyOrdersContainer}>
              <Text style={styles.emptyOrdersText}>لا توجد طلبات حديثة</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    backgroundColor: "#3B82F6",
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "right",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "right",
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statTextContainer: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1F2937",
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
    textAlign: "center",
  },
  section: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "right",
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    padding: 16,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    color: "#1F2937",
    textAlign: "center",
  },
  ordersContainer: {
    gap: 12,
  },
  orderCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 8,
  },
  orderInfo: {
    alignItems: "flex-end",
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  orderDate: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  orderDetails: {
    alignItems: "flex-end",
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#F59E0B",
  },
  orderTotal: {
    fontSize: 14,
    color: "#1F2937",
    marginTop: 4,
  },
  pendingStatus: {
    color: "#F59E0B",
  },
  confirmedStatus: {
    color: "#3B82F6",
  },
  completedStatus: {
    color: "#10B981",
  },
  cancelledStatus: {
    color: "#EF4444",
  },
  emptyOrdersContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyOrdersText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});

export default HomeScreen;
