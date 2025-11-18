import React, { useState } from 'react';
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
import { COLORS } from '../../constants/colors';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleType: '',
    vehicleNumber: '',
    nationalIdImage: null,
    drivingLicenseImage: null,
    agreeToTerms: false,
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation();

  const handleRegister = async () => {
    // Validation
    if (!formData.name || !formData.phone || !formData.password || !formData.confirmPassword) {
      Alert.alert('خطأ', 'الرجاء ملء جميع الحقول');
      return;
    }
    
    if (!/^(01)[0-9]{9}$/.test(formData.phone)) {
      Alert.alert('خطأ', 'الرجاء إدخال رقم موبايل مصري صحيح (01xxxxxxxxx)');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('خطأ', 'كلمتا المرور غير متطابقتين');
      return;
    }
    
    if (!formData.nationalIdImage || !formData.drivingLicenseImage) {
      Alert.alert('خطأ', 'الرجاء رفع صورة البطاقة الشخصية ورخصة القيادة');
      return;
    }
    
    if (!formData.agreeToTerms) {
      Alert.alert('خطأ', 'الرجاء الموافقة على الشروط والأحكام');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    
    // Show success message
    Alert.alert(
      'نجاح',
      'تم إرسال طلبك بنجاح! سيتم مراجعته خلال 24 ساعة',
      [
        {
          text: 'العودة لتسجيل الدخول',
          onPress: () => navigation.goBack(),
        }
      ]
    );
  };

  const handleImageUpload = (type) => {
    // In a real app, you would use expo-image-picker
    Alert.alert(
      'رفع صورة',
      `هل تريد التقاط ${type === 'nationalId' ? 'البطاقة الشخصية' : 'رخصة القيادة'} أم اختيار من المعرض؟`,
      [
        {
          text: 'التقاط',
          onPress: () => {
            // Simulate image capture
            setFormData({
              ...formData,
              [type + 'Image']: 'https://via.placeholder.com/200?text=' + (type === 'nationalId' ? 'NationalID' : 'License')
            });
          }
        },
        {
          text: 'اختيار من المعرض',
          onPress: () => {
            // Simulate image selection
            setFormData({
              ...formData,
              [type + 'Image']: 'https://via.placeholder.com/200?text=' + (type === 'nationalId' ? 'NationalID' : 'License')
            });
          }
        },
        { text: 'إلغاء', style: 'cancel' }
      ]
    );
  };

  const removeImage = (type) => {
    setFormData({
      ...formData,
      [type + 'Image']: null
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>تسجيل سائق جديد</Text>
      </View>

      <View style={styles.form}>
        {/* Personal Information Section */}
        <Text style={styles.sectionTitle}>معلومات شخصية</Text>
        
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="الاسم الكامل"
            placeholderTextColor={COLORS.textSecondary}
            value={formData.name}
            onChangeText={(value) => setFormData({...formData, name: value})}
            textAlign="right"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="call-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="رقم الموبايل"
            placeholderTextColor={COLORS.textSecondary}
            value={formData.phone}
            onChangeText={(value) => setFormData({...formData, phone: value})}
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
            value={formData.password}
            onChangeText={(value) => setFormData({...formData, password: value})}
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

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="تأكيد كلمة المرور"
            placeholderTextColor={COLORS.textSecondary}
            value={formData.confirmPassword}
            onChangeText={(value) => setFormData({...formData, confirmPassword: value})}
            secureTextEntry={!showConfirmPassword}
            textAlign="right"
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.passwordToggle}>
            <Ionicons 
              name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color={COLORS.textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Vehicle Information Section */}
        <Text style={styles.sectionTitle}>معلومات المركبة</Text>
        
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>نوع المركبة</Text>
          <View style={styles.pickerOptions}>
            {['motorcycle', 'car', 'tuktuk'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.pickerOption,
                  formData.vehicleType === type && styles.pickerOptionSelected
                ]}
                onPress={() => setFormData({...formData, vehicleType: type})}
              >
                <Text style={[
                  styles.pickerOptionText,
                  formData.vehicleType === type && styles.pickerOptionTextSelected
                ]}>
                  {type === 'motorcycle' ? 'موتوسيكل' : type === 'car' ? 'سيارة' : 'توك توك'}
                </Text>
                {type === 'motorcycle' && <MaterialCommunityIcons name="motorbike" size={20} color={formData.vehicleType === type ? 'white' : COLORS.primary} />}
                {type === 'car' && <MaterialCommunityIcons name="car" size={20} color={formData.vehicleType === type ? 'white' : COLORS.primary} />}
                {type === 'tuktuk' && <MaterialCommunityIcons name="cart" size={20} color={formData.vehicleType === type ? 'white' : COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="numeric" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="رقم اللوحة"
            placeholderTextColor={COLORS.textSecondary}
            value={formData.vehicleNumber}
            onChangeText={(value) => setFormData({...formData, vehicleNumber: value})}
            textAlign="right"
          />
        </View>

        {/* Documents Section */}
        <Text style={styles.sectionTitle}>المستندات المطلوبة</Text>
        
        {/* National ID */}
        <View style={styles.documentContainer}>
          <Text style={styles.documentTitle}>صورة البطاقة الشخصية</Text>
          {!formData.nationalIdImage ? (
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={() => handleImageUpload('nationalId')}
            >
              <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
              <Text style={styles.uploadButtonText}>التقط صورة أو اختر من المعرض</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: formData.nationalIdImage }} style={styles.imagePreview} />
              <View style={styles.imageActions}>
                <TouchableOpacity 
                  style={styles.changeButton}
                  onPress={() => handleImageUpload('nationalId')}
                >
                  <Text style={styles.changeButtonText}>تغيير</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeImage('nationalId')}
                >
                  <Text style={styles.removeButtonText}>حذف</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Driving License */}
        <View style={styles.documentContainer}>
          <Text style={styles.documentTitle}>صورة رخصة القيادة</Text>
          {!formData.drivingLicenseImage ? (
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={() => handleImageUpload('drivingLicense')}
            >
              <Ionicons name="camera-outline" size={24} color={COLORS.primary} />
              <Text style={styles.uploadButtonText}>التقط صورة أو اختر من المعرض</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.imagePreviewContainer}>
              <Image source={{ uri: formData.drivingLicenseImage }} style={styles.imagePreview} />
              <View style={styles.imageActions}>
                <TouchableOpacity 
                  style={styles.changeButton}
                  onPress={() => handleImageUpload('drivingLicense')}
                >
                  <Text style={styles.changeButtonText}>تغيير</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removeImage('drivingLicense')}
                >
                  <Text style={styles.removeButtonText}>حذف</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Terms Agreement */}
        <View style={styles.termsContainer}>
          <TouchableOpacity 
            style={[styles.checkbox, formData.agreeToTerms && styles.checkboxChecked]} 
            onPress={() => setFormData({...formData, agreeToTerms: !formData.agreeToTerms})}
          >
            {formData.agreeToTerms && <Ionicons name="checkmark" size={16} color="white" />}
          </TouchableOpacity>
          <Text style={styles.termsText}>أوافق على الشروط والأحكام</Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.registerButtonText}>إرسال الطلب</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>العودة لتسجيل الدخول</Text>
        </TouchableOpacity>
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
    marginVertical: 20,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 15,
    marginTop: 10,
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
  pickerContainer: {
    marginBottom: 15,
  },
  pickerLabel: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  pickerOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  pickerOptionSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pickerOptionText: {
    fontSize: 14,
    color: COLORS.text,
    marginRight: 5,
  },
  pickerOptionTextSelected: {
    color: 'white',
  },
  documentContainer: {
    marginBottom: 20,
  },
  documentTitle: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 15,
  },
  uploadButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 10,
  },
  imagePreviewContainer: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
  },
  imagePreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
  },
  imageActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  changeButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginRight: 5,
  },
  changeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  removeButton: {
    flex: 1,
    backgroundColor: COLORS.danger,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginLeft: 5,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  termsContainer: {
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
  termsText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  registerButton: {
    backgroundColor: COLORS.success,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;