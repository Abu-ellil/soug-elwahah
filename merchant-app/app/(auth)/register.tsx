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
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';

const RegisterScreen = () => {
 const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeImage, setStoreImage] = useState<string | undefined>(undefined);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const pickImage = async () => {
    // Request permission to access media library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('خطأ', 'نحتاج إلى إذن للوصول إلى مكتبة الصور');
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
    } else {
      setStoreImage(undefined);
    }
  };

  const getCurrentLocation = async () => {
    try {
      // Request permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('خطأ', 'نحتاج إلى إذن للوصول إلى موقعك');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Update coordinates state
      const newCoordinates = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      setCoordinates(newCoordinates);

      Alert.alert('تم', 'تم الحصول على موقعك بنجاح');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('خطأ', 'حدث خطأ أثناء الحصول على موقعك');
    }
 };

  const handleRegister = async () => {
    if (
      !name.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !storeName.trim()
    ) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    // Validate phone number (Egyptian format)
    if (!/^(01)[0-9]{9}$/.test(phone.trim())) {
      Alert.alert('خطأ', 'رقم الموبايل غير صحيح');
      return;
    }

    if (password.length < 6) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('خطأ', 'كلمة المرور غير متطابقة');
      return;
    }

    setIsLoading(true);
    try {
      // Validate that coordinates are provided
      if (!coordinates) {
        Alert.alert('خطأ', 'يرجى تحديد موقع المتجر');
        setIsLoading(false);
        return;
      }

      const result = await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        storeName: storeName.trim(),
        storeDescription: storeDescription.trim(),
        storeImage,
        coordinates,
      });

      if (result.success) {
        Alert.alert('تم', 'تم تقديم طلبك بنجاح، انتظر موافقة الإدارة', [
          { text: 'موافق', onPress: () => router.push('/(auth)/login') },
        ]);
      } else {
        Alert.alert('خطأ', result.error || 'حدث خطأ أثناء التسجيل');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء التسجيل');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: 'white' }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 80 }}>
          {/* Logo/Icon */}
          <View style={{ marginBottom: 40, alignItems: 'center' }}>
            <View
              style={{
                marginBottom: 16,
                height: 80,
                width: 80,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 40,
                backgroundColor: '#3B82F6',
              }}>
              <Ionicons name="storefront-outline" size={40} color="white" />
            </View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}>
              تسجيل تاجر جديد
            </Text>
            <Text style={{ marginTop: 8, fontSize: 16, color: '#6B7280' }}>
              ابدأ بيع منتجاتك معنا
            </Text>
          </View>

          {/* User Information */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ marginBottom: 16, fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>
              معلومات المستخدم
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: '500', color: '#1F2937' }}>
                الاسم الكامل
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="أدخل اسمك الكامل"
                  style={{ flex: 1, textAlign: 'right', color: 'black' }}
                />
                <Ionicons name="person-outline" size={20} color="#6B7280" />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: '500', color: '#1F2937' }}>
                رقم الموبايل
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}>
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="01xxxxxxxxx"
                  keyboardType="phone-pad"
                  style={{ flex: 1, textAlign: 'right', color: 'black' }}
                  maxLength={11}
                />
                <Ionicons name="call-outline" size={20} color="#6B7280" />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: '500', color: '#1F2937' }}>
                كلمة المرور
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="كلمة المرور"
                  secureTextEntry={true}
                  style={{ flex: 1, textAlign: 'right', color: 'black' }}
                />
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: '500', color: '#1F2937' }}>
                تأكيد كلمة المرور
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="أعد إدخال كلمة المرور"
                  secureTextEntry={true}
                  style={{ flex: 1, textAlign: 'right', color: 'black' }}
                />
                <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
              </View>
            </View>
          </View>

          {/* Store Information */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ marginBottom: 16, fontSize: 18, fontWeight: 'bold', color: '#1F2937' }}>
              معلومات المتجر
            </Text>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: '500', color: '#1F2937' }}>
                اسم المتجر
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}>
                <TextInput
                  value={storeName}
                  onChangeText={setStoreName}
                  placeholder="اسم المتجر"
                  style={{ flex: 1, textAlign: 'right', color: 'black' }}
                />
                <Ionicons name="storefront-outline" size={20} color="#6B7280" />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: '500', color: '#1F2937' }}>
                وصف المتجر
              </Text>
              <View
                style={{
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#D1D5DB',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}>
                <TextInput
                  value={storeDescription}
                  onChangeText={setStoreDescription}
                  placeholder="وصف المتجر (اختياري)"
                  style={{ textAlign: 'right', color: 'black', height: 80 }}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: '500', color: '#1F2937' }}>
                صورة المتجر
              </Text>
              <TouchableOpacity
                onPress={pickImage}
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  borderWidth: 2,
                  borderStyle: 'dashed',
                  borderColor: '#D1D5DB',
                  padding: 24,
                }}>
                {storeImage ? (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, color: '#3B82F6', marginBottom: 8 }}>
                      تم اختيار صورة
                    </Text>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <Ionicons name="camera-outline" size={40} color="#6B7280" />
                    <Text style={{ marginTop: 8, fontSize: 16, color: '#6B7280' }}>
                      اضغط لاختيار صورة للمتجر
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            
            {/* Location Information */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ marginBottom: 8, fontSize: 14, fontWeight: '500', color: '#1F2937' }}>
                موقع المتجر
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ fontSize: 14, color: '#6B7280' }}>
                  {coordinates ? `(${coordinates.lat.toFixed(6)}, ${coordinates.lng.toFixed(6)})` : 'لم يتم تحديد الموقع'}
                </Text>
                <TouchableOpacity
                  onPress={getCurrentLocation}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: coordinates ? '#10B981' : '#3B82F6',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 8,
                  }}>
                  <Ionicons name="location-outline" size={16} color="white" />
                  <Text style={{ color: 'white', marginRight: 6, fontSize: 12 }}>
                    {coordinates ? 'تحديث الموقع' : 'تحديد الموقع'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                يرجى تحديد موقع المتجر بدقة للسماح للعملاء بالعثور عليه بسهولة
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            style={{
              alignItems: 'center',
              borderRadius: 12,
              paddingVertical: 16,
              backgroundColor: '#3B82F6',
            }}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
              {isLoading ? 'جاري التسجيل...' : 'تقديم طلب التسجيل'}
            </Text>
          </TouchableOpacity>

          {/* Login Link */}
          <View
            style={{
              marginTop: 24,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ fontSize: 16, color: '#6B7280' }}>لديك حساب بالفعل؟ </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#3B82F6' }}>سجل الدخول</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;
