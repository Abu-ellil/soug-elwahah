import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import apiService from "../../services/api";
import Toast from "react-native-toast-message";

const ProfileScreen = () => {
  const { currentUser, logout } = useAuth();
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [storeImage, setStoreImage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [store, setStore] = useState<any>(null);

  const fetchStore = async () => {
    try {
      setIsLoading(true);
      // Get user's stores
      const storesResponse = await apiService.request('/store/my-store/all');
      if (storesResponse.success && storesResponse.data?.stores?.length > 0) {
        const approvedStore = storesResponse.data.stores.find((s: any) => s.verificationStatus === 'approved');
        if (approvedStore) {
          setStore(approvedStore);
          setStoreName(approvedStore.name || '');
          setStoreDescription(approvedStore.description || '');
          setStoreImage(approvedStore.image || '');
        }
      }
    } catch (error: any) {
      console.error('Error fetching store:', error);
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: 'فشل في تحميل بيانات المتجر',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("خطأ", "نحتاج إلى إذن للوصول إلى مكتبة الصور");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setStoreImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchStore();
    }
  }, [currentUser]);

  const handleSaveChanges = async () => {
    if (!store) {
      Alert.alert("خطأ", "لا يوجد متجر لتحديثه");
      return;
    }

    try {
      setIsLoading(true);
      const updateData: any = {};

      if (storeName !== store.name) updateData.name = storeName;
      if (storeDescription !== store.description) updateData.description = storeDescription;
      if (storeImage !== store.image) updateData.image = storeImage;

      if (Object.keys(updateData).length === 0) {
        Alert.alert("تنبيه", "لا توجد تغييرات لحفظها");
        return;
      }

      const response = await apiService.request(`/store/my-store`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'تم',
          text2: 'تم حفظ تغييرات المتجر بنجاح',
        });
        setIsEditing(false);
        fetchStore(); // Refresh store data
      } else {
        Alert.alert("خطأ", response.message || "فشل في حفظ التغييرات");
      }
    } catch (error: any) {
      console.error('Error updating store:', error);
      Alert.alert("خطأ", error.message || "فشل في حفظ التغييرات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("تسجيل الخروج", "هل أنت متأكد أنك تريد تسجيل الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تسجيل خروج",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الملف الشخصي</Text>
      </View>

      {/* Store Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>معلومات المتجر</Text>

        {/* Store Image */}
        <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
          {storeImage ? (
            <View style={styles.imageWrapper}>
              <Ionicons name="image" size={40} color="#9CA3AF" />
            </View>
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
              <Text style={styles.imagePlaceholderText}>اختر صورة المتجر</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Store Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>اسم المتجر</Text>
          <View style={styles.inputWrapper}>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={storeName}
                onChangeText={setStoreName}
                placeholder="أدخل اسم المتجر"
                placeholderTextColor="#9CA3AF"
              />
            ) : (
              <Text style={styles.input}>{storeName || 'لا يوجد متجر'}</Text>
            )}
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Ionicons name="create-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Store Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>وصف المتجر</Text>
          <View style={[styles.inputWrapper, styles.textArea]}>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textAreaInput]}
                value={storeDescription}
                onChangeText={setStoreDescription}
                placeholder="أدخل وصف المتجر"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.input}>{storeDescription || 'لا يوجد وصف'}</Text>
            )}
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Ionicons name="create-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* User Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>معلومات المستخدم</Text>

        {/* User Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>الاسم</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.input}>{currentUser?.name}</Text>
          </View>
        </View>

        {/* Phone Number */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>رقم الهاتف</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.input}>{currentUser?.phone}</Text>
          </View>
        </View>

        {/* Account Status */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>حالة الحساب</Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                store ? styles.approvedBadge : styles.pendingBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {store ? "موافق عليه" : "قيد المراجعة"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveChanges}>
        <Text style={styles.saveButtonText}>حفظ التغييرات</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutButtonText}>تسجيل الخروج</Text>
      </TouchableOpacity>
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
    padding: 16,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 16,
    textAlign: "right",
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
    textAlign: "right",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
  },
  textArea: {
    minHeight: 80,
    alignItems: "flex-start",
  },
  textAreaInput: {
    textAlignVertical: 'top',
  },
  input: {
    flex: 1,
    textAlign: "right",
    color: "#1F2937",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  approvedBadge: {
    backgroundColor: "#D1FAE5",
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1F2937",
  },
  saveButton: {
    backgroundColor: "#10B981",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EF4444",
    borderRadius: 12,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#EF4444",
    marginRight: 8,
  },
});

export default ProfileScreen;
