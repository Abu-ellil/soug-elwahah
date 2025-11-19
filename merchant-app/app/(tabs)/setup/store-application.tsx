import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useStoreApplicationStore } from "../../../stores/storeApplicationStore";
import CategorySelector from "../../../components/CategorySelector";

const { width, height } = Dimensions.get("window");

const StoreApplicationScreen = () => {
  const {
    storeName,
    storeDescription,
    storeImage,
    coordinates,
    selectedCategory,
    categories,
    isCategoriesLoading,
    isLoading,
    isLocationLoading,
    setStoreName,
    setStoreDescription,
    setSelectedCategory,
    setCategories,
    setIsCategoriesLoading,
    loadCategories,
    pickImage,
    getCurrentLocation,
    submitApplication,
  } = useStoreApplicationStore();
  const router = useRouter();

  // Load categories when component mounts
  useEffect(() => {
    loadCategories();
  }, []);

  const handleSubmitApplication = async () => {
    const result = await submitApplication();
    if (result.success) {
      router.replace("/(tabs)/setup/pending-approval");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <LinearGradient colors={["#667eea", "#764ba2"]} className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="mx-6">
            {/* Header Section */}
            <View className="mb-12 items-center">
              <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Ionicons name="storefront" size={48} color="white" />
              </View>
              <Text className="mb-2 text-center text-3xl font-bold text-white">
                طلب إنشاء متجر
              </Text>
              <Text className="text-center text-lg text-white/80">
                املأ البيانات المطلوبة لبدء رحلتك
              </Text>
            </View>

            {/* Application Form */}
            <View className="rounded-3xl bg-white p-8 shadow-2xl">
              {/* Store Name Input */}
              <View className="mb-6">
                <Text className="mb-3 text-sm font-semibold text-gray-700">
                  اسم المتجر *
                </Text>
                <View className="flex-row items-center rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-4">
                  <TextInput
                    value={storeName}
                    onChangeText={setStoreName}
                    placeholder="اسم المتجر"
                    className="flex-1 text-lg text-gray-900"
                    style={{ textAlign: "right" }}
                  />
                  <Ionicons
                    name="storefront-outline"
                    size={20}
                    color="#6B7280"
                  />
                </View>
              </View>

              {/* Store Description Input */}
              <View className="mb-6">
                <Text className="mb-3 text-sm font-semibold text-gray-700">
                  وصف المتجر
                </Text>
                <View className="rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-4">
                  <TextInput
                    value={storeDescription}
                    onChangeText={setStoreDescription}
                    placeholder="وصف المتجر (اختياري)"
                    className="text-lg text-gray-900 h-20"
                    style={{ textAlign: "right", height: 80 }}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>

              {/* Store Image */}
              <View className="mb-6">
                <Text className="mb-3 text-sm font-semibold text-gray-700">
                  صورة المتجر
                </Text>
                <TouchableOpacity
                  onPress={pickImage}
                  className="items-center justify-center rounded-xl border-2 border-gray-200 bg-gray-50 p-6"
                >
                  {storeImage ? (
                    <View className="items-center">
                      <Image
                        source={{ uri: storeImage }}
                        style={{
                          width: 120,
                          height: 120,
                          borderRadius: 8,
                          marginBottom: 8,
                        }}
                      />
                      <Text className="text-lg text-blue-500">
                        تغيير الصورة
                      </Text>
                    </View>
                  ) : (
                    <View className="items-center">
                      <Ionicons
                        name="camera-outline"
                        size={40}
                        color="#6B7280"
                      />
                      <Text className="mt-2 text-lg text-gray-600">
                        اضغط لاختيار صورة للمتجر
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Category Selector */}
              <CategorySelector
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
                isLoading={isCategoriesLoading}
                onRetry={loadCategories}
              />

              {/* Store Location */}
              <View className="mb-6">
                <Text className="mb-3 text-sm font-semibold text-gray-700">
                  موقع المتجر *
                </Text>
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-base text-gray-600">
                    {coordinates
                      ? `(${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)})`
                      : "لم يتم تحديد الموقع"}
                  </Text>
                  <TouchableOpacity
                    onPress={getCurrentLocation}
                    disabled={isLocationLoading}
                    className={`flex-row items-center px-4 py-2 rounded-lg ${
                      coordinates ? "bg-green-500" : "bg-blue-500"
                    }`}
                  >
                    {isLocationLoading ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Ionicons
                          name="location-outline"
                          size={16}
                          color="white"
                        />
                        <Text className="text-white mr-2 text-sm">
                          {coordinates ? "تحديث الموقع" : "تحديد الموقع"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                <Text className="text-xs text-gray-500 text-center">
                  يرجى تحديد موقع المتجر بدقة للسماح للعملاء بالعثور عليه بسهولة
                </Text>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmitApplication}
                disabled={isLoading}
                className="mb-6 overflow-hidden rounded-xl"
              >
                <LinearGradient
                  colors={
                    isLoading ? ["#9CA3AF", "#6B7280"] : ["#3B82F6", "#1D4ED8"]
                  }
                  className="items-center py-4"
                >
                  {isLoading ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator color="white" size="small" />
                      <Text className="ml-2 text-lg font-bold text-white">
                        جاري التقديم...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-lg font-bold text-white">
                      تقديم طلب المتجر
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default StoreApplicationScreen;
