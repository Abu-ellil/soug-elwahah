import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const ProfileScreen = () => {
  const { currentUser, logout } = useAuth();
  const [storeName, setStoreName] = useState(currentUser?.storeName || "");
  const [storeDescription, setStoreDescription] = useState(
    currentUser?.storeDescription || ""
  );
  const [storeImage, setStoreImage] = useState(currentUser?.storeImage || "");

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

  const handleSaveChanges = () => {
    Alert.alert("تم", "تم حفظ تغييرات المتجر بنجاح");
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
            <Text style={styles.input}>{storeName}</Text>
            <Ionicons name="create-outline" size={20} color="#6B7280" />
          </View>
        </View>

        {/* Store Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>وصف المتجر</Text>
          <View style={[styles.inputWrapper, styles.textArea]}>
            <Text style={styles.input}>{storeDescription}</Text>
            <Ionicons name="create-outline" size={20} color="#6B7280" />
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
                currentUser?.approved
                  ? styles.approvedBadge
                  : styles.pendingBadge,
              ]}
            >
              <Text style={styles.statusText}>
                {currentUser?.approved ? "موافق عليه" : "قيد المراجعة"}
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
