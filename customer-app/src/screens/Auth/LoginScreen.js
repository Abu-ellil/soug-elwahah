import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { validatePhone } from '../../utils/helpers';
import COLORS from '../../constants/colors';

const LoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال رقم الموبايل وكلمة المرور');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('خطأ', 'رقم الموبايل غير صحيح');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(phone, password);
      if (!result.success) {
        Alert.alert('خطأ', result.error);
      }
      // Navigation will be handled by the auth context
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 pt-20">
          {/* Logo/Icon */}
          <View className="items-center mb-10">
            <View
              className="w-20 h-20 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Ionicons name="storefront" size={40} color="white" />
            </View>
            <Text
              className="text-2xl font-bold"
              style={{ color: COLORS.text }}
            >
              مرحباً بك
            </Text>
            <Text
              className="text-base mt-2"
              style={{ color: COLORS.textSecondary }}
            >
              سجل الدخول للمتابعة
            </Text>
          </View>

          {/* Form */}
          <View className="mb-8">
            <View className="mb-4">
              <Text
                className="text-sm font-medium mb-2"
                style={{ color: COLORS.text }}
              >
                رقم الموبايل
              </Text>
              <View className="flex-row items-center border rounded-xl px-4 py-3">
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="01xxxxxxxxx"
                  keyboardType="phone-pad"
                  className="flex-1 text-right"
                  style={{ color: COLORS.text }}
                  maxLength={11}
                />
                <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} />
              </View>
            </View>

            <View className="mb-6">
              <Text
                className="text-sm font-medium mb-2"
                style={{ color: COLORS.text }}
              >
                كلمة المرور
              </Text>
              <View className="flex-row items-center border rounded-xl px-4 py-3">
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="كلمة المرور"
                  secureTextEntry={true}
                  className="flex-1 text-right"
                  style={{ color: COLORS.text }}
                />
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className="rounded-xl py-4 items-center"
              style={{ backgroundColor: COLORS.primary }}
            >
              <Text className="text-white font-bold text-lg">
                {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View className="flex-row items-center justify-center">
            <Text
              className="text-base"
              style={{ color: COLORS.textSecondary }}
            >
              مستخدم جديد؟{' '}
            </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text
                className="text-base font-bold"
                style={{ color: COLORS.primary }}
              >
                سجل الآن
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
