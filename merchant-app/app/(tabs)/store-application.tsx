import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useStoreApplicationStore } from "../../stores/storeApplicationStore";

const StoreApplicationScreen = () => {
  const {
    storeName,
    storeDescription,
    storeImage,
    coordinates,
    isLoading,
    setStoreName,
    setStoreDescription,
    pickImage,
    getCurrentLocation,
    submitApplication,
  } = useStoreApplicationStore();
  const router = useRouter();

  const handleSubmitApplication = async () => {
    const result = await submitApplication();
    if (result.success) {
      router.replace('/pending-approval');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "white" }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 80 }}>
          <View style={{ marginBottom: 40, alignItems: "center" }}>
            <View
              style={{
                marginBottom: 16,
                height: 80,
                width: 80,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 40,
                backgroundColor: "#3B82F6",
              }}
            >
              <Ionicons name="storefront-outline" size={40} color="white" />
            </View>
            <Text
              style={{ fontSize: 24, fontWeight: "bold", color: "#1F2937" }}
            >
              طلب إنشاء متجر
            </Text>
            <Text style={{ marginTop: 8, fontSize: 16, color: "#6B7280" }}>
              املأ البيانات المطلوبة لبدء رحلتك
            </Text>
          </View>

          <View style={{ marginBottom: 32 }}>
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#1F2937",
                }}
              >
                اسم المتجر *
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <TextInput
                  value={storeName}
                  onChangeText={setStoreName}
                  placeholder="اسم المتجر"
                  style={{ flex: 1, textAlign: "right", color: "black" }}
                />
                <Ionicons name="storefront-outline" size={20} color="#6B7280" />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#1F2937",
                }}
              >
                وصف المتجر
              </Text>
              <View
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#D1D5DB",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <TextInput
                  value={storeDescription}
                  onChangeText={setStoreDescription}
                  placeholder="وصف المتجر (اختياري)"
                  style={{ textAlign: "right", color: "black", height: 80 }}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#1F2937",
                }}
              >
                صورة المتجر
              </Text>
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 12,
                  borderWidth: 2,
                  borderStyle: "dashed",
                  borderColor: "#D1D5DB",
                  padding: 24,
                }}
              >
                {storeImage ? (
                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 16,
                        color: "#3B82F6",
                        marginBottom: 8,
                      }}
                    >
                      تم اختيار صورة
                    </Text>
                  </View>
                ) : (
                  <View style={{ alignItems: "center" }}>
                    <Ionicons name="camera-outline" size={40} color="#6B7280" />
                    <Text
                      style={{ marginTop: 8, fontSize: 16, color: "#6B7280" }}
                    >
                      اضغط لاختيار صورة للمتجر
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  marginBottom: 8,
                  fontSize: 14,
                  fontWeight: "500",
                  color: "#1F2937",
                }}
              >
                موقع المتجر *
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <Text style={{ fontSize: 14, color: "#6B7280" }}>
                  {coordinates
                    ? `(${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)})`
                    : "لم يتم تحديد الموقع"}
                </Text>
                <TouchableOpacity
                  onPress={getCurrentLocation}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: coordinates ? "#10B981" : "#3B82F6",
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                  }}
                >
                  <Ionicons name="location-outline" size={16} color="white" />
                  <Text
                    style={{ color: "white", marginRight: 6, fontSize: 12 }}
                  >
                    {coordinates ? "تحديث الموقع" : "تحديد الموقع"}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 12, color: "#9CA3AF" }}>
                يرجى تحديد موقع المتجر بدقة للسماح للعملاء بالعثور عليه بسهولة
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmitApplication}
            disabled={isLoading}
            style={{
              alignItems: "center",
              borderRadius: 12,
              paddingVertical: 16,
              backgroundColor: "#3B82F6",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>
              {isLoading ? "جاري التقديم..." : "تقديم طلب المتجر"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default StoreApplicationScreen;