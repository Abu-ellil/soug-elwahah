import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
  const router = useRouter();
 const [name, setName] = useState('');
 const [phone, setPhone] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [vehicleType, setVehicleType] = useState('');
 const [vehicleNumber, setVehicleNumber] = useState('');
 const [loading, setLoading] = useState(false);
  
  const register = useAuthStore(state => state.register);
  const logout = useAuthStore(state => state.logout); // Using logout function to clear stored data

  const handleRegister = async () => {
    if (!name || !phone || !password || !confirmPassword || !vehicleType || !vehicleNumber) {
      Alert.alert('خطأ', 'الرجاء ملء جميع الحقول');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('خطأ', 'كلمة المرور غير متطابقة');
      return;
    }

    setLoading(true);
    try {
      const driverData = {
        name,
        phone,
        password,
        vehicleType,
        vehicleNumber,
      };
      
      const result = await register(driverData);
      if (result.success) {
        Alert.alert('نجاح', 'تم إنشاء الحساب بنجاح', [
          { text: 'موافق', onPress: () => router.push('/login') }
        ]);
      } else {
        Alert.alert('خطأ', result.error || 'حدث خطأ أثناء إنشاء الحساب');
      }
    } catch (error) {
      Alert.alert('خطأ', 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoading(false);
    }
  };

   const handleClearStoredData = async () => {
     Alert.alert(
       'مسح البيانات المخزنة',
       'هل أنت متأكد أنك تريد مسح البيانات المخزنة؟ سيتم تسجيل خروجك من أي جلسة مخزنة.',
       [
         { text: 'إلغاء', style: 'cancel' },
         {
           text: 'موافق',
           onPress: async () => {
             try {
               await logout(); // This will clear the stored tokens
               
               // Additional cleanup to ensure complete logout
               await AsyncStorage.clear(); // Clear all AsyncStorage as additional safety
               
               Alert.alert('تم', 'تم مسح البيانات المخزنة بنجاح.');
             } catch (error) {
               Alert.alert('خطأ', 'حدث خطأ أثناء مسح البيانات.');
             }
           }
         }
       ]
     );
   };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('../assets/images/icon.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>إنشاء حساب</Text>
        <Text style={styles.subtitle}>الرجاء ملء البيانات التالية</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>الاسم</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="أدخل اسمك"
            textContentType="name"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>رقم الهاتف</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="أدخل رقم هاتفك"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>كلمة المرور</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="أدخل كلمة المرور"
            secureTextEntry
            textContentType="password"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>تأكيد كلمة المرور</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="أعد إدخال كلمة المرور"
            secureTextEntry
            textContentType="password"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>نوع المركبة</Text>
          <View style={styles.pickerContainer}>
            {['motorcycle', 'car', 'tuktuk'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.pickerOption,
                  vehicleType === type && styles.pickerOptionSelected
                ]}
                onPress={() => setVehicleType(type)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  vehicleType === type && styles.pickerOptionTextSelected
                ]}>
                  {type === 'motorcycle' ? 'موتوسيكل' : type === 'car' ? 'سيارة' : 'توك توك'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>رقم اللوحة</Text>
          <TextInput
            style={styles.input}
            value={vehicleNumber}
            onChangeText={setVehicleNumber}
            placeholder="أدخل رقم لوحة المركبة"
            textContentType="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.clearButton, styles.button]}
          onPress={handleClearStoredData}
        >
          <Text style={styles.buttonText}>
            مسح البيانات المخزنة
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>لديك حساب؟</Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.linkText}>تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  clearButton: {
    backgroundColor: '#ff3b30', // Red color for clear button
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: '#666',
    marginRight: 5,
  },
  linkText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  pickerOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  pickerOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: 'white',
  },
});
