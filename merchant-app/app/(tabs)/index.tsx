import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import apiService from "../../services/api";
import Toast from "react-native-toast-message";

const HomeScreen = () => {
  const { currentUser, isLoading: authLoading } = useAuthStore();
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

      // Set a shorter timeout for better UX
      const globalTimeout = setTimeout(() => {
        console.log("Dashboard data fetch timeout, continuing with defaults");
        setIsLoading(false);
        setRefreshing(false);
        Toast.show({
          type: 'info',
          text1: 'تحميل جزئي',
          text2: 'تم تحميل بعض البيانات فقط',
        });
      }, 4000); // 4 second global timeout

      // Try to fetch statistics with individual timeout
      try {
        const statsController = new AbortController();
        const statsTimeout = setTimeout(() => statsController.abort(), 2500); // 2.5 second timeout
        
        console.log("Fetching store statistics...");
        const statsResponse = await apiService.getStatistics();
        clearTimeout(statsTimeout);
        
        if (statsResponse && statsResponse.success && statsResponse.data) {
          setStats({
            totalProducts: statsResponse.data.totalProducts || 0,
            totalOrders: statsResponse.data.totalOrders || 0,
            pendingOrders: statsResponse.data.pendingOrders || 0,
            revenue: statsResponse.data.revenue || 0,
          });
        }
      } catch (statsError: any) {
        console.warn("Failed to fetch statistics:", statsError.message);
        // Continue with default stats
      }

      // Try to fetch orders with individual timeout
      try {
        const ordersController = new AbortController();
        const ordersTimeout = setTimeout(() => ordersController.abort(), 2500); // 2.5 second timeout
        
        console.log("Fetching recent orders...");
        const ordersResponse = await apiService.getOrders();
        clearTimeout(ordersTimeout);
        
        if (ordersResponse && ordersResponse.success && ordersResponse.data) {
          setRecentOrders(ordersResponse.data.orders?.slice(0, 5) || []);
        }
      } catch (ordersError: any) {
        console.warn("Failed to fetch orders:", ordersError.message);
        // Continue with empty orders
      }

      clearTimeout(globalTimeout);
    } catch (error: any) {
      console.error("Error in dashboard data fetch:", error);
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
        typeof store === "object"
          ? store.verificationStatus === "approved"
          : true
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
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        className="flex-1 justify-center items-center"
      >
        <Text className="text-lg text-white">جاري تحميل البيانات...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} className="flex-1">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <View className="mx-6 mt-12">
          {/* Header */}
          <View className="mb-8 items-center">
            <Text className="text-2xl font-bold text-white mb-2">
              مرحبًا، {currentUser?.name}
            </Text>
            <Text className="text-lg text-white/80">لوحة تحكم المتجر</Text>
          </View>

          {/* Stats Cards */}
          <View className="mb-8">
            <View className="flex-row flex-wrap gap-4">
              <TouchableOpacity
                className="flex-1 min-w-[45%] bg-white rounded-3xl p-6 shadow-2xl"
                onPress={() => router.push("/(tabs)/products")}
              >
                <View className="w-12 h-12 rounded-xl bg-blue-100 items-center justify-center mb-3">
                  <Ionicons name="cube" size={24} color="#3B82F6" />
                </View>
                <Text className="text-2xl font-bold text-gray-800 mb-1">
                  {stats.totalProducts}
                </Text>
                <Text className="text-sm text-gray-600">
                  {stats.totalProducts === 0 ? 'لا توجد منتجات' : 'المنتجات'}
                </Text>
                {stats.totalProducts === 0 && (
                  <Text className="text-xs text-blue-500 mt-1">انقر لإضافة منتج</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 min-w-[45%] bg-white rounded-3xl p-6 shadow-2xl">
                <View className="w-12 h-12 rounded-xl bg-green-100 items-center justify-center mb-3">
                  <Ionicons name="cart" size={24} color="#10B981" />
                </View>
                <Text className="text-2xl font-bold text-gray-800 mb-1">
                  {stats.totalOrders}
                </Text>
                <Text className="text-sm text-gray-600">الطلبات</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 min-w-[45%] bg-white rounded-3xl p-6 shadow-2xl">
                <View className="w-12 h-12 rounded-xl bg-yellow-100 items-center justify-center mb-3">
                  <Ionicons name="time" size={24} color="#F59E0B" />
                </View>
                <Text className="text-2xl font-bold text-gray-800 mb-1">
                  {stats.pendingOrders}
                </Text>
                <Text className="text-sm text-gray-600">الطلبات المعلقة</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-1 min-w-[45%] bg-white rounded-3xl p-6 shadow-2xl">
                <View className="w-12 h-12 rounded-xl bg-red-100 items-center justify-center mb-3">
                  <Ionicons name="cash" size={24} color="#EF4444" />
                </View>
                <Text className="text-2xl font-bold text-gray-800 mb-1">
                  {stats.revenue} ج.م
                </Text>
                <Text className="text-sm text-gray-600">الإيرادات</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <View className="bg-white rounded-3xl p-6 mb-6 shadow-2xl">
            <Text className="text-xl font-bold text-gray-800 mb-6 text-right">
              الإجراءات السريعة
            </Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="items-center flex-1"
                onPress={() => router.push("/(tabs)/products")}
              >
                <View className="w-14 h-14 rounded-2xl bg-blue-100 items-center justify-center mb-2">
                  <Ionicons name="add-circle" size={28} color="#3B82F6" />
                </View>
                <Text className="text-sm text-gray-700 font-medium">
                  إضافة منتج
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center flex-1"
                onPress={() => router.push("/(tabs)/profile")}
              >
                <View className="w-14 h-14 rounded-2xl bg-green-100 items-center justify-center mb-2">
                  <Ionicons name="storefront" size={28} color="#10B981" />
                </View>
                <Text className="text-sm text-gray-700 font-medium">
                  تعديل المتجر
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Orders */}
          <View className="bg-white rounded-3xl p-6 shadow-2xl">
            <Text className="text-xl font-bold text-gray-800 mb-6 text-right">
              الطلبات الحديثة
            </Text>
            <View className="gap-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <TouchableOpacity
                    key={order._id}
                    className="flex-row justify-between items-center bg-gray-50 rounded-xl p-4"
                  >
                    <View className="items-end">
                      <Text className="text-lg font-bold text-gray-800">
                        #{order.orderNumber || order._id.slice(-6)}
                      </Text>
                      <Text className="text-sm text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text
                        className={`text-sm font-bold mb-1 ${
                          order.status === "pending"
                            ? "text-yellow-600"
                            : order.status === "confirmed"
                              ? "text-blue-600"
                              : order.status === "completed"
                                ? "text-green-600"
                                : order.status === "cancelled"
                                  ? "text-red-600"
                                  : "text-gray-600"
                        }`}
                      >
                        {order.status === "pending"
                          ? "معلق"
                          : order.status === "confirmed"
                            ? "مؤكد"
                            : order.status === "completed"
                              ? "مكتمل"
                              : order.status === "cancelled"
                                ? "ملغي"
                                : order.status}
                      </Text>
                      <Text className="text-sm text-gray-700">
                        {order.totalAmount} ج.م
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <View className="items-center py-8">
                  <Text className="text-base text-gray-500">
                    لا توجد طلبات حديثة
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default HomeScreen;
