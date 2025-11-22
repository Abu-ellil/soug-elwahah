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
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppDispatch } from '../../src/redux/hooks';
import { loginAsync } from '../../src/redux/slices/authSlice';
import { useAuth } from '../../src/redux/hooks';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const LoginScreen = () => {
  const [phone, setPhone] = useState(''); // Pre-filled for testing
  const [password, setPassword] = useState(''); // Pre-filled for testing
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, currentUser, isAuthenticated } = useAuth();

  const validateInputs = () => {
    if (!phone.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال رقم الهاتف');
      return false;
    }

    if (!password.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال كلمة المرور');
      return false;
    }

    // Enhanced phone validation for Egyptian numbers
    const phoneRegex = /^(\+20|0)?1[0-2,5]\d{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      Alert.alert('خطأ', 'رقم الهاتف غير صحيح. يجب أن يبدأ بـ 010, 011, 012, أو 015');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    console.log('🔐 Starting login process...');
    console.log('📱 Phone:', phone.replace(/\s/g, ''));
    console.log('🔑 Password:', password);
    console.log('🔑 Password length:', password.length);

    if (!validateInputs()) {
      console.log('❌ Input validation failed');
      return;
    }

    console.log('✅ Input validation passed');
    setIsValidating(true);

    try {
      console.log('🚀 Calling login API...');
      const normalizedPhone = phone.trim().replace(/\s/g, '').replace(/^(\+20|0)/, '');
      console.log('📱 Normalized phone:', normalizedPhone);
      const result = await dispatch(loginAsync({ phone: normalizedPhone, password: password.trim() })).unwrap();
      console.log('📡 Login API response:', result);

      if (result) {
        console.log('✅ Login successful');

        // Check stores from currentUser
        const stores = currentUser?.stores || [];
        console.log('🏪 User stores:', stores);

        const approvedStores = stores.filter((store: any) =>
          store.verificationStatus === 'approved'
        );
        console.log('✅ Approved stores:', approvedStores.length);

        if (approvedStores.length > 0) {
          console.log('🏠 Navigating to main app (approved stores)');
          router.replace('/');
        } else if (stores.length > 0) {
          console.log('⏳ Navigating to pending approval (has stores but not approved)');
          router.replace('/(tabs)/setup/pending-approval');
        } else {
          console.log('📝 Navigating to store application (no stores)');
          router.replace('/(tabs)/setup/store-application');
        }
      } else {
        console.log('❌ Login failed:', result);

        let errorMessage = 'فشل في تسجيل الدخول';

        console.log('🚨 Showing error alert:', errorMessage);
        Alert.alert('خطأ في تسجيل الدخول', errorMessage);
      }
    } catch (error: any) {
      console.error('💥 Login error:', error);
      console.log('🚨 Showing generic error alert');
      Alert.alert(
        'خطأ',
        error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'
      );
    } finally {
      console.log('🔄 Setting validating to false');
      setIsValidating(false);
    }
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-numeric characters
    const cleaned = text.replace(/\D/g, '');

    // Format as Egyptian phone number
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    setPhone(formatted);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
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
                مرحباً بك
              </Text>
              <Text className="text-center text-lg text-white/80">
                تسجيل الدخول إلى حساب التاجر
              </Text>
            </View>

            {/* Login Form */}
            <View className="rounded-3xl bg-white p-8 shadow-2xl">
              {/* Phone Input */}
              <View className="mb-6">
                <Text className="mb-3 text-sm font-semibold text-gray-70">
                  رقم الهاتف
                </Text>
                <View className="flex-row items-center rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-4">
                  <View className="mr-3 flex-row items-center">
                    <Text className="mr-1 text-sm text-gray-500">🇪🇬</Text>
                    <Text className="text-sm font-medium text-gray-700">+20</Text>
                  </View>
                  <TextInput
                    value={phone}
                    onChangeText={handlePhoneChange}
                    placeholder="100 000 0000"
                    keyboardType="numeric"
                    maxLength={13}
                    className="flex-1 text-lg text-gray-900"
                    style={{ textAlign: 'left', minWidth: 100, minHeight: 24 }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={true}
                    selectTextOnFocus={true}
                    returnKeyType="next"
                  />
                  <Ionicons name="call-outline" size={20} color="#6B7280" />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-8">
                <Text className="mb-3 text-sm font-semibold text-gray-700">
                  كلمة المرور
                </Text>
                <View className="flex-row items-center rounded-xl border-2 border-gray-200 bg-gray-50 px-4 py-4">
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="mr-3"
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
                    placeholder="أدخل كلمة المرور"
                    secureTextEntry={!showPassword}
                    className="flex-1 text-lg text-gray-900"
                    style={{ textAlign: 'right' }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading || isValidating}
                className="mb-6 overflow-hidden rounded-xl"
              >
                <LinearGradient
                  colors={
                    isLoading || isValidating
                      ? ['#9CA3AF', '#6B7280']
                      : ['#3B82F6', '#1D4ED8']
                  }
                  className="items-center py-4"
                >
                  {isLoading || isValidating ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator color="white" size="small" />
                      <Text className="ml-2 text-lg font-bold text-white">
                        جاري تسجيل الدخول...
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-lg font-bold text-white">
                      تسجيل الدخول
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Register Link */}
              <View className="flex-row items-center justify-center">
                <Text className="text-base text-gray-600">ليس لديك حساب؟ </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/register')}
                  className="rounded-lg px-2 py-1"
                >
                  <Text className="text-base font-bold text-blue-600">
                    إنشاء حساب جديد
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View className="mt-8 items-center">
              <Text className="text-center text-sm text-white/60">
                منصة التوصيل - إدارة متاجرك بسهولة
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
