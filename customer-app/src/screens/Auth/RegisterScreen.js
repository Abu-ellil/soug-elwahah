import React, { useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { validatePhone, validatePassword } from '../../utils/helpers';
import COLORS from '../../constants/colors';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('خطأ', 'رقم الموبايل غير صحيح');
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('خطأ', 'كلمة المرور غير متطابقة');
      return;
    }

    setIsLoading(true);
    try {
      const result = await register({
        name: name.trim(),
        phone,
        password,
      });

      if (!result.success) {
        Alert.alert('خطأ', result.error);
      }
      // Navigation will be handled by the auth context
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء التسجيل');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 pt-20">
          {/* Logo/Icon */}
          <View className="mb-10 items-center">
            <View
              className="mb-4 h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: COLORS.primary }}>
              <Ionicons name="person-add" size={40} color="white" />
            </View>
            <Text className="text-2xl font-bold" style={{ color: COLORS.text }}>
              إنشاء حساب جديد
            </Text>
            <Text className="mt-2 text-base" style={{ color: COLORS.textSecondary }}>
              انضم إلينا الآن
            </Text>
          </View>

          {/* Form */}
          <View className="mb-8">
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium" style={{ color: COLORS.text }}>
                الاسم الكامل
              </Text>
              <View className="flex-row items-center rounded-xl border px-4 py-3">
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="أدخل اسمك الكامل"
                  className="flex-1 text-right"
                  style={{ color: COLORS.text }}
                />
                <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} />
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium" style={{ color: COLORS.text }}>
                رقم الموبايل
              </Text>
              <View className="flex-row items-center rounded-xl border px-4 py-3">
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

            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium" style={{ color: COLORS.text }}>
                كلمة المرور
              </Text>
              <View className="flex-row items-center rounded-xl border px-4 py-3">
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

            <View className="mb-6">
              <Text className="mb-2 text-sm font-medium" style={{ color: COLORS.text }}>
                تأكيد كلمة المرور
              </Text>
              <View className="flex-row items-center rounded-xl border px-4 py-3">
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="أعد إدخال كلمة المرور"
                  secureTextEntry={true}
                  className="flex-1 text-right"
                  style={{ color: COLORS.text }}
                />
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
              className="items-center rounded-xl py-4"
              style={{ backgroundColor: COLORS.primary }}>
              <Text className="text-lg font-bold text-white">
                {isLoading ? 'جاري التسجيل...' : 'تسجيل'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View className="flex-row items-center justify-center">
            <Text className="text-base" style={{ color: COLORS.textSecondary }}>
              لديك حساب بالفعل؟{' '}
            </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text className="text-base font-bold" style={{ color: COLORS.primary }}>
                سجل الدخول
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
