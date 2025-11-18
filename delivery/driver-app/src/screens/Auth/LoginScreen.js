import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation();
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!phone || !password) {
      Alert.alert('خطأ', 'الرجاء ملء جميع الحقول');
      return;
    }

    setLoading(true);
    const result = await login(phone, password);
    setLoading(false);

    if (result.success) {
      // Check verification status
      if (result.driver.verificationStatus === 'pending') {
        Alert.alert('انتظار', 'طلبك قيد المراجعة، سيتم مراجعته خلال 24 ساعة');
      } else if (result.driver.verificationStatus === 'rejected') {
        Alert.alert('مرفوض', `تم رفض طلبك: ${result.driver.rejectionReason || 'تم رفض الحساب'}`);
      } else if (!result.driver.isActive) {
        Alert.alert('غير مفعل', 'حسابك غير مفعّل');
      } else {
        // Login successful
        console.log('Login successful');
      }
    } else {
      Alert.alert('خطأ', result.error || 'حدث خطأ أثناء تسجيل الدخول');
    }
 };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/100x100?text=Logo' }} 
          style={styles.logo} 
        />
        <Text style={styles.title}>تسجيل دخول السائق</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="رقم الموبايل"
            placeholderTextColor={COLORS.textSecondary}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            textAlign="right"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="كلمة المرور"
            placeholderTextColor={COLORS.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            textAlign="right"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color={COLORS.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.rememberMeContainer}>
          <TouchableOpacity 
            style={[styles.checkbox, rememberMe && styles.checkboxChecked]} 
            onPress={() => setRememberMe(!rememberMe)}
          >
            {rememberMe && <Ionicons name="checkmark" size={16} color="white" />}
          </TouchableOpacity>
          <Text style={styles.rememberMeText}>تذكرني</Text>
        </View>

        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>تسجيل الدخول</Text>
          )}
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>مندوب جديد؟ </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>سجل الآن</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  form: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  inputIcon: {
    marginLeft: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'right',
  },
  passwordToggle: {
    padding: 4,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  rememberMeText: {
    fontSize: 14,
    color: COLORS.text,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default LoginScreen;