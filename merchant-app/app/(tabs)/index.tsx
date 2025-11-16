import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = () => {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    revenue: 0,
  });

  useEffect(() => {
    // In a real app, this would fetch from an API
    setStats({
      totalProducts: 12,
      totalOrders: 5,
      pendingOrders: 2,
      revenue: 2500,
    });
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>مرحبًا، {currentUser?.name}</Text>
        <Text style={styles.headerSubtitle}>{currentUser?.storeName}</Text>
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
          <TouchableOpacity style={styles.orderCard}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>#ORD-01</Text>
              <Text style={styles.orderDate}>اليوم</Text>
            </View>
            <View style={styles.orderDetails}>
              <Text style={styles.orderStatus}>معلق</Text>
              <Text style={styles.orderTotal}>150 ج.م</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.orderCard}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>#ORD-002</Text>
              <Text style={styles.orderDate}>أمس</Text>
            </View>
            <View style={styles.orderDetails}>
              <Text style={styles.orderStatus}>مكتمل</Text>
              <Text style={styles.orderTotal}>200 ج.م</Text>
            </View>
          </TouchableOpacity>
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
});

export default HomeScreen;
