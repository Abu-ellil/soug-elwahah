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
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

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

    setIsLoading(true);
    try {
      const result = await login(phone, password);
      if (result.success) {
        if (result.verificationStatus === 'pending') {
          // Navigate to pending approval screen
          router.replace('/pending-approval');
        } else {
          // Navigate to the main dashboard
          router.replace('/');
        }
      } else {
        Alert.alert('خطأ', result.error || 'رقم الهاتف أو كلمة المرور غير صحيحة');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
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
