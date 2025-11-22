import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import Toast from "react-native-toast-message";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from "../../../types/product";
import { useAppDispatch, useAuth, useProducts } from "../../../src/redux/hooks";
import { addProductAsync, updateProductAsync, fetchProductByIdAsync } from "../../../src/redux/slices/productsSlice";

const ProductFormScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { currentUser } = useAuth();
  const { id } = useLocalSearchParams(); // Get product ID from URL params if editing
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<Partial<Product>>({
    name: "",
    price: 0,
    description: "",
    stock: 0,
    image: undefined,
    isAvailable: true,
    category: "",
  });

  // Fetch product if editing (from Redux state)
  useEffect(() => {
    if (id && currentUser) {
      setIsEditing(true);
      fetchProductDetails();
    }
  }, [id, currentUser]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await dispatch(fetchProductByIdAsync(id as string)).unwrap();
      if (response) {
        setProduct({
          _id: response._id,
          name: response.name || "",
          price: response.price || 0,
          description: response.description || "",
          stock: response.stock || 0,
          image: response.image || undefined,
          isAvailable: response.isAvailable ?? true,
          category: response.category || "",
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

  // Image picker functions
  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Permission to access camera roll is required to select images.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setProduct({ ...product, image: imageUri || undefined });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: 'فشل في اختيار الصورة',
      });
    }
  };

  const takePhoto = async () => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Permission to access camera is required to take photos.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const imageUri = result.assets[0].uri;
        setProduct({ ...product, image: imageUri || undefined });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: 'فشل في التقاط الصورة',
      });
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'اختر صورة',
      'من أين تريد اختيار صورة المنتج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'معرض الصور', onPress: pickImage },
        { text: 'الكاميرا', onPress: takePhoto },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!product.name?.trim() || !product.price || product.price <= 0 || !product.stock || product.stock < 0) {
      Alert.alert("خطأ", "يرجى ملء جميع الحقول المطلوبة بشكل صحيح");
      return;
    }

    // For new products, require image. For editing existing products, image is optional
    if (!isEditing && !product.image) {
      Alert.alert("خطأ", "يرجى إضافة صورة للمنتج");
      return;
    }

    setLoading(true);
    try {
      let response;
      if (isEditing && product._id) {
        // Use Redux for updating product
        response = await dispatch(updateProductAsync({ 
          productId: product._id, 
          productData: product 
        }) as any).unwrap();
      } else {
        // Use Redux for adding product
        response = await dispatch(addProductAsync(product) as any).unwrap();
      }

      if (response) {
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
          text2: isEditing ? "فشل في تحديث المنتج" : "فشل في إضافة المنتج",
        });
      }
    } catch (error: any) {
      console.error("Error saving product:", error);
      Toast.show({
        type: "error",
        text1: "خطأ",
        text2: error.message || (isEditing ? "فشل في تحديث المنتج" : "فشل في إضافة المنتج"),
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
        <View className="bg-white rounded-2xl p-6 shadow-sm mb-20">
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
              value={product.price?.toString() || "0"}
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
              value={product.stock?.toString() || "0"}
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

          {/* Product Image */}
          <View className="mb-5">
            <Text className="text-sm font-medium text-gray-700 mb-2">
              صورة المنتج *
            </Text>
            <TouchableOpacity
              className="border-2 border-dashed border-gray-300 rounded-xl p-4 items-center justify-center min-h-[120px] bg-gray-50"
              onPress={showImageOptions}
            >
              {product.image ? (
                <View className="relative">
                  <Image
                    source={{ uri: product.image }}
                    className="w-24 h-24 rounded-xl"
                    resizeMode="cover"
                  />
                  <TouchableOpacity
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                    onPress={() => {
                      const newProduct = { ...product, image: undefined };
                      setProduct(newProduct);
                    }}
                  >
                    <Ionicons name="close" size={14} color="white" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="items-center">
                  <Ionicons name="camera-outline" size={40} color="#6B7280" />
                  <Text className="text-gray-500 text-center mt-2">
                    اضغط لإضافة صورة
                  </Text>
                </View>
              )}
            </TouchableOpacity>
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
              className={`flex-row items-center p-3 rounded-xl border ${
                product.isAvailable ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
              }`}
              onPress={() => handleChange("isAvailable", !product.isAvailable)}
            >
              <View
                className={`w-5 h-5 rounded border mr-3 ${
                  product.isAvailable ? "bg-green-500 border-green-500" : "border-gray-400"
                }`}
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

// Helper function to get auth token
const getAuthToken = async (): Promise<string> => {
  // In a real implementation, you would get this from your Redux auth state
  // or from AsyncStorage where it's stored
  try {
    const token = await AsyncStorage.getItem('token');
    return token || '';
  } catch (error) {
    console.error('Error getting auth token:', error);
    return '';
  }
};

export default ProductFormScreen;
