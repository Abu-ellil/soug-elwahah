import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import apiService from "../../../services/api";
import Toast from "react-native-toast-message";

interface Product {
  _id?: string;
  name: string;
  price: number;
  description: string;
  stock: number;
  image?: string;
  isAvailable: boolean;
  category?: string;
}

const ProductFormScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Get product ID from URL params if editing
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Product>({
    name: "",
    price: 0,
    description: "",
    stock: 0,
    isAvailable: true,
    category: "",
  });

  // Fetch product if editing
  useEffect(() => {
    if (id) {
      setIsEditing(true);
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProductById(id as string);
      if (response.success && response.data) {
        setProduct({
          _id: response.data._id,
          name: response.data.name || "",
          price: response.data.price || 0,
          description: response.data.description || "",
          stock: response.data.stock || 0,
          isAvailable: response.data.isAvailable ?? true,
          category: response.data.category || "",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "خطأ",
          text2: response.message || "فشل في تحميل المنتج",
        });
      }
    } catch (error: any) {
      console.error("Error fetching product:", error);
      Toast.show({
        type: "error",
        text1: "خطأ",
        text2: error.message || "فشل في تحميل المنتج",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (name: string, value: any) => {
    setProduct({ ...product, [name]: value });
  };

  const handleSubmit = async () => {
    if (!product.name.trim() || product.price <= 0 || product.stock < 0) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة بشكل صحيح");
      return;
    }

    setLoading(true);
    try {
      let response;
      if (isEditing && product._id) {
        response = await apiService.updateProduct(product._id, product);
      } else {
        response = await apiService.addProduct(product);
      }

      if (response.success) {
        Toast.show({
          type: "success",
          text1: "نجاح",
          text2: isEditing ? "تم تحديث المنتج بنجاح" : "تم إضافة المنتج بنجاح",
        });
        router.back();
      } else {
        Toast.show({
          type: "error",
          text1: "خطأ",
          text2:
            response.message ||
            (isEditing ? "فشل في تحديث المنتج" : "فشل في إضافة المنتج"),
        });
      }
    } catch (error: any) {
      console.error("Error saving product:", error);
      Toast.show({
        type: "error",
        text1: "خطأ",
        text2:
          error.message ||
          (isEditing ? "فشل في تحديث المنتج" : "فشل في إضافة المنتج"),
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
    return (
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        className="flex-1 items-center justify-center"
      >
        <ActivityIndicator size="large" color="white" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} className="flex-1">
      <ScrollView className="flex-1 p-4 pt-16">
        <View className="bg-white rounded-2xl p-6 shadow-sm">
          <Text className="text-xl font-bold text-gray-800 mb-6">
            {isEditing ? "تعديل المنتج" : "إضافة منتج جديد"}
          </Text>

          {/* Product Name */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              اسم المنتج *
            </Text>
            <TextInput
              value={product.name}
              onChangeText={(text) => handleChange("name", text)}
              placeholder="أدخل اسم المنتج"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            />
          </View>

          {/* Price */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              السعر *
            </Text>
            <TextInput
              value={product.price.toString()}
              onChangeText={(text) =>
                handleChange("price", parseFloat(text) || 0)
              }
              placeholder="0.00"
              keyboardType="numeric"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            />
          </View>

          {/* Stock */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              الكمية في المخزون *
            </Text>
            <TextInput
              value={product.stock.toString()}
              onChangeText={(text) =>
                handleChange("stock", parseInt(text) || 0)
              }
              placeholder="0"
              keyboardType="numeric"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            />
          </View>

          {/* Category */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              التصنيف
            </Text>
            <TextInput
              value={product.category}
              onChangeText={(text) => handleChange("category", text)}
              placeholder="التصنيف"
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            />
          </View>

          {/* Description */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              الوصف
            </Text>
            <TextInput
              value={product.description}
              onChangeText={(text) => handleChange("description", text)}
              placeholder="وصف المنتج"
              multiline
              numberOfLines={4}
              className="border border-gray-300 rounded-xl px-4 py-3 text-base h-32"
            />
          </View>

          {/* Availability Toggle */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              التوفر
            </Text>
            <TouchableOpacity
              className={`flex-row items-center p-3 rounded-xl border ${product.isAvailable ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}`}
              onPress={() => handleChange("isAvailable", !product.isAvailable)}
            >
              <View
                className={`w-5 h-5 rounded border mr-3 ${product.isAvailable ? "bg-green-500 border-green-500" : "border-gray-400"}`}
              >
                {product.isAvailable && (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color="white"
                    className="self-center"
                  />
                )}
              </View>
              <Text className="text-base">
                {product.isAvailable ? "متوفر" : "غير متوفر"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View className="flex-row justify-between mt-8">
            <TouchableOpacity
              className="flex-1 bg-gray-200 py-3 rounded-xl mr-2"
              onPress={() => router.back()}
            >
              <Text className="text-center text-gray-700 font-medium">
                إلغاء
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-blue-500 py-3 rounded-xl ml-2"
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-center text-white font-medium">
                  {isEditing ? "تحديث" : "إضافة"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <Toast />
    </LinearGradient>
  );
};

export default ProductFormScreen;
