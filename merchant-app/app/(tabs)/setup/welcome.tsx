import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../../stores/authStore";

const { width } = Dimensions.get("window");

const WelcomeScreen = () => {
  const { currentUser, logout } = useAuthStore();
  const router = useRouter();

  const handleCreateStore = () => {
    router.push("/(tabs)/setup/store-application");
  };

  const handleContactSupport = () => {
    // TODO: Implement contact support functionality
    // For now, just show a message
    alert("يمكنك الاتصال بالدعم على: support@example.com");
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 60 }}>
        {/* Welcome Header */}
        <View style={{ alignItems: "center", marginBottom: 40 }}>
          <View
            style={{
              marginBottom: 24,
              height: 120,
              width: 120,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 60,
              backgroundColor: "#3B82F6",
            }}
          >
            <Ionicons name="storefront-outline" size={60} color="white" />
          </View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#1F2937",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            مرحبًا، {currentUser?.name}
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: "#6B7280",
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            أهلاً بك في منصة التجار! للبدء في رحلتك، تحتاج إلى إنشاء متجرك الخاص
          </Text>
        </View>

        {/* Information Cards */}
        <View style={{ marginBottom: 32 }}>
          {/* What you need to know */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <View
                style={{
                  marginLeft: 12,
                  height: 40,
                  width: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 20,
                  backgroundColor: "#DBEAFE",
                }}
              >
                <Ionicons name="information-circle" size={24} color="#3B82F6" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1F2937" }}>
                ما تحتاجه للبدء
              </Text>
            </View>

            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginLeft: 8, marginTop: 2 }} />
                <Text style={{ fontSize: 16, color: "#374151", flex: 1 }}>
                  اسم متجر مميز وجذاب لعملائك
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginLeft: 8, marginTop: 2 }} />
                <Text style={{ fontSize: 16, color: "#374151", flex: 1 }}>
                  وصف واضح لطبيعة متجرك ومنتجاتك
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginLeft: 8, marginTop: 2 }} />
                <Text style={{ fontSize: 16, color: "#374151", flex: 1 }}>
                  موقع دقيق لمتجرك على الخريطة
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" style={{ marginLeft: 8, marginTop: 2 }} />
                <Text style={{ fontSize: 16, color: "#374151", flex: 1 }}>
                  صورة احترافية لمتجرك
                </Text>
              </View>
            </View>
          </View>

          {/* Benefits */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 20,
              marginBottom: 16,
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <View
                style={{
                  marginLeft: 12,
                  height: 40,
                  width: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 20,
                  backgroundColor: "#D1FAE5",
                }}
              >
                <Ionicons name="star" size={24} color="#10B981" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1F2937" }}>
                فوائد إنشاء المتجر
              </Text>
            </View>

            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                <Ionicons name="storefront" size={20} color="#3B82F6" style={{ marginLeft: 8, marginTop: 2 }} />
                <Text style={{ fontSize: 16, color: "#374151", flex: 1 }}>
                  واجهة متجر إلكترونية احترافية
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                <Ionicons name="people" size={20} color="#3B82F6" style={{ marginLeft: 8, marginTop: 2 }} />
                <Text style={{ fontSize: 16, color: "#374151", flex: 1 }}>
                  الوصول إلى آلاف العملاء المحتملين
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                <Ionicons name="analytics" size={20} color="#3B82F6" style={{ marginLeft: 8, marginTop: 2 }} />
                <Text style={{ fontSize: 16, color: "#374151", flex: 1 }}>
                  تتبع المبيعات والإحصائيات
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Ionicons name="notifications" size={20} color="#3B82F6" style={{ marginLeft: 8, marginTop: 2 }} />
                <Text style={{ fontSize: 16, color: "#374151", flex: 1 }}>
                  إشعارات فورية لطلبات العملاء
                </Text>
              </View>
            </View>
          </View>

          {/* Next Steps */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 16,
              padding: 20,
              elevation: 2,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              shadowRadius: 2,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
              <View
                style={{
                  marginLeft: 12,
                  height: 40,
                  width: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 20,
                  backgroundColor: "#FEF3C7",
                }}
              >
                <Ionicons name="time-outline" size={24} color="#F59E0B" />
              </View>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: "#1F2937" }}>
                الخطوات التالية
              </Text>
            </View>

            <View style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#F59E0B", marginLeft: 8 }}>1.</Text>
                <Text style={{ fontSize: 16, color: "#374151", flex: 1 }}>
                  املأ نموذج طلب إنشاء المتجر
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#F59E0B", marginLeft: 8 }}>2.</Text>
                <Text style={{ fontSize: 16, color: "#374151", flex: 1 }}>
                  سيتم مراجعة طلبك من قبل فريق الإدارة
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: "#F59E0B", marginLeft: 8 }}>3.</Text>
                <Text style={{ fontSize: 16, color: "#374151", flex: 1 }}>
                  ستتلقى إشعارًا فور الموافقة لبدء إضافة منتجاتك
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ marginBottom: 32 }}>
          <TouchableOpacity
            onPress={handleCreateStore}
            style={{
              alignItems: "center",
              borderRadius: 12,
              paddingVertical: 16,
              backgroundColor: "#3B82F6",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>
              إنشاء متجر جديد
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleContactSupport}
            style={{
              alignItems: "center",
              borderRadius: 12,
              paddingVertical: 16,
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: "#D1D5DB",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "#6B7280" }}>
              التواصل مع الدعم
            </Text>
          </TouchableOpacity>
        </View>

        {/* Logout Option */}
        <TouchableOpacity
          onPress={async () => {
            await logout();
          }}
          style={{
            alignItems: "center",
            borderRadius: 12,
            paddingVertical: 12,
            marginBottom: 40,
          }}
        >
          <Text style={{ fontSize: 16, color: "#EF4444" }}>
            تسجيل خروج
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default WelcomeScreen;