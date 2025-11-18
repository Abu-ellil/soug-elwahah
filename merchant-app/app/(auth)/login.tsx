import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { useRouter } from 'expo-router';
import apiService from '../../services/api';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }

    // Validate phone format (Egyptian phone number format)
    // Accept both 10-digit (01X-XXXXXXX) and 11-digit (01X-XXXXXXXX) Egyptian phone numbers
    if (!/^01[0-2,5]{1}[0-9]{7,8}$/.test(phone)) {
      Alert.alert('خطأ', 'رقم الهاتف غير صحيح');
      return;
    }

    const result = await login(phone, password);
    if (result.success) {
      // Check user's stores to determine navigation
      const user = await apiService.getProfile();
      if (user && user.data && user.data.user) {
        const userData = user.data.user;
        const stores = userData.stores || [];

        // Check if user has approved stores
        const approvedStores = stores.filter((store: any) => store.verificationStatus === 'approved');

        if (approvedStores.length > 0) {
          // Has approved stores - go to main app
          router.replace('/');
        } else if (stores.length > 0) {
          // Has stores but none approved - go to pending approval
          router.replace('/pending-approval');
        } else {
          // No stores - go to store application
          router.replace('/(tabs)/store-application');
        }
      } else {
        // Fallback - go to store application
        router.replace('/(tabs)/store-application');
      }
    } else {
      Alert.alert('خطأ', result.error || 'رقم الهاتف أو كلمة المرور غير صحيحة');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 pt-20">
          {/* Logo/Icon */}
          <View className="mb-10 items-center">
            <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-blue-500">
              <Ionicons name="storefront-outline" size={40} color="white" />
            </View>
            <Text className="text-2xl font-bold text-gray-800">تسجيل دخول التاجر</Text>
            <Text className="mt-2 text-base text-gray-600">مرحبًا بك في تطبيق التاجر</Text>
          </View>

          {/* Form */}
          <View className="mb-8">
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-800">رقم الهاتف</Text>
              <View className="flex-row items-center rounded-xl border border-gray-300 px-4 py-3">
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="010000000"
                  keyboardType="phone-pad"
                  className="flex-1 text-right"
                  style={{ color: 'black' }}
                />
                <Ionicons name="call-outline" size={20} color="#6B7280" />
              </View>
            </View>

            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium text-gray-800">كلمة المرور</Text>
              <View className="flex-row items-center rounded-xl border border-gray-300 px-4 py-3">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="كلمة المرور"
                  secureTextEntry={true}
                  className="flex-1 text-right"
                  style={{ color: 'black' }}
                />
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className="items-center rounded-xl py-4"
              style={{ backgroundColor: '#3B82F6' }}>
              <Text className="text-lg font-bold text-white">
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View className="flex-row items-center justify-center">
            <Text className="text-base text-gray-600">ليس لديك حساب؟ </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-base font-bold text-blue-500">سجل الآن</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
