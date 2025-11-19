import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../stores/authStore";

const RegisterScreen = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { register, isLoading, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert("خطأ", "يرجى إدخال الاسم");
      return;
    }

    if (!phone.trim()) {
      Alert.alert("خطأ", "يرجى إدخال رقم الهاتف");
      return;
    }

    if (!password.trim()) {
      Alert.alert("خطأ", "يرجى إدخال كلمة المرور");
      return;
    }

    if (password.length < 6) {
      Alert.alert("خطأ", "كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("خطأ", "كلمة المرور غير متطابقة");
      return;
    }

    const result = await register({ name: name.trim(), phone: phone.trim(), password });
    if (result.success) {
      router.replace("/(tabs)/setup/store-application");
    } else {
      Alert.alert("خطأ", result.error || "حدث خطأ أثناء التسجيل");
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
              <Ionicons name="person-add-outline" size={40} color="white" />
            </View>
            <Text
              style={{ fontSize: 24, fontWeight: "bold", color: "#1F2937" }}
            >
              إنشاء حساب تاجر
            </Text>
            <Text style={{ marginTop: 8, fontSize: 16, color: "#6B7280" }}>
              انضم إلينا وابدأ رحلتك في التجارة الإلكترونية
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
                الاسم الكامل *
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
                  value={name}
                  onChangeText={setName}
                  placeholder="الاسم الكامل"
                  style={{ flex: 1, textAlign: "right", color: "black" }}
                />
                <Ionicons name="person-outline" size={20} color="#6B7280" />
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
                رقم الهاتف *
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
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="رقم الهاتف"
                  keyboardType="phone-pad"
                  style={{ flex: 1, textAlign: "right", color: "black" }}
                />
                <Ionicons name="call-outline" size={20} color="#6B7280" />
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
                كلمة المرور *
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
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={{ marginLeft: 8 }}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="كلمة المرور"
                  secureTextEntry={!showPassword}
                  style={{ flex: 1, textAlign: "right", color: "black" }}
                />
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              </View>
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
                تأكيد كلمة المرور *
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
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ marginLeft: 8 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="تأكيد كلمة المرور"
                  secureTextEntry={!showConfirmPassword}
                  style={{ flex: 1, textAlign: "right", color: "black" }}
                />
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            style={{
              alignItems: "center",
              borderRadius: 12,
              paddingVertical: 16,
              backgroundColor: "#3B82F6",
              marginBottom: 16,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold", color: "white" }}>
              {isLoading ? "جاري التسجيل..." : "إنشاء الحساب"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.replace("/(auth)/login")}
            style={{
              alignItems: "center",
              borderRadius: 12,
              paddingVertical: 16,
              backgroundColor: "transparent",
              borderWidth: 1,
              borderColor: "#3B82F6",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "500", color: "#3B82F6" }}>
              لديك حساب بالفعل؟ تسجيل الدخول
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;