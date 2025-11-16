import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Header from '../../components/Header';
import RTLText from '../../components/RTLText';
import COLORS from '../../constants/colors';
import SIZES from '../../constants/sizes';
import { VILLAGES } from '../../data/villages';
import { useLocation } from '../../context/LocationProvider';

const AddAddressScreen = ({ navigation }) => {
  const { getCurrentLocation, availableVillages, loading: locationLoading } = useLocation();
  const [label, setLabel] = useState('');
  const [street, setStreet] = useState('');
  const [village, setVillage] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGetCurrentLocation = async () => {
    try {
      const location = await getCurrentLocation();
      if (location && availableVillages.length > 0) {
        // Auto-select the nearest village
        setVillage(availableVillages[0].name);

        // Try to reverse geocode for street address
        try {
          const geocodeResult = await Location.reverseGeocodeAsync({
            latitude: location.lat,
            longitude: location.lng,
          });

          if (geocodeResult && geocodeResult.length > 0) {
            const address = geocodeResult[0];
            const streetAddress = [
              address.street,
              address.streetNumber,
              address.district,
              address.subregion
            ].filter(Boolean).join(', ');

            if (streetAddress && !street.trim()) {
              setStreet(streetAddress);
            }
          }
        } catch (geocodeError) {
          console.log('Reverse geocoding failed:', geocodeError);
        }

        Alert.alert('تم بنجاح', `تم تحديد موقعك في قرية ${availableVillages[0].name}`);
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل في الحصول على موقعك الحالي');
    }
  };

  const handleSave = async () => {
    if (!label.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم العنوان (مثل: المنزل، العمل)');
      return;
    }

    if (!village) {
      Alert.alert('خطأ', 'يرجى اختيار القرية');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Here you would save to backend/storage
      const newAddress = {
        id: `addr${Date.now()}`,
        userId: 'user1', // Get from auth context
        label: label.trim(),
        street: street.trim(),
        village,
        isDefault,
      };

      // Navigate back with the new address
      navigation.navigate('Addresses', { newAddress });
    } catch (error) {
      Alert.alert('خطأ', 'فشل في إضافة العنوان');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="إضافة عنوان جديد" showBackButton={true} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* Label Input */}
          <View style={styles.inputGroup}>
            <RTLText style={styles.label}>اسم العنوان *</RTLText>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={label}
                onChangeText={setLabel}
                placeholder="مثال: المنزل، العمل، المكتب"
                placeholderTextColor={COLORS.gray}
                textAlign="right"
              />
            </View>
          </View>

          {/* GPS Location Button */}
          <View style={styles.inputGroup}>
            <TouchableOpacity
              style={[styles.gpsButton, locationLoading && styles.gpsButtonDisabled]}
              onPress={handleGetCurrentLocation}
              disabled={locationLoading}>
              <Feather name="map-pin" size={20} color={COLORS.white} />
              <RTLText style={styles.gpsButtonText}>
                {locationLoading ? 'جاري تحديد الموقع...' : 'تحديد الموقع الحالي'}
              </RTLText>
            </TouchableOpacity>
          </View>

          {/* Street Input */}
          <View style={styles.inputGroup}>
            <RTLText style={styles.label}>عنوان الشارع (اختياري)</RTLText>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={street}
                onChangeText={setStreet}
                placeholder="مثال: 15 شارع المدرسة"
                placeholderTextColor={COLORS.gray}
                textAlign="right"
              />
            </View>
          </View>

          {/* Village Input */}
          <View style={styles.inputGroup}>
            <RTLText style={styles.label}>القرية *</RTLText>
            <View style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                value={village}
                onChangeText={setVillage}
                placeholder="مثال: كفر الشيخ"
                placeholderTextColor={COLORS.gray}
                textAlign="right"
              />
            </View>
          </View>

          {/* Default Address Toggle */}
          <View style={styles.inputGroup}>
            <RTLText style={styles.label}>تعيين كعنوان افتراضي</RTLText>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsDefault(!isDefault)}>
              <View style={[styles.checkbox, isDefault && styles.checkboxChecked]}>
                {isDefault && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <RTLText style={styles.checkboxLabel}>
                نعم، اجعل هذا العنوان الافتراضي
              </RTLText>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}>
            <RTLText style={styles.saveButtonText}>
              {loading ? 'جاري الحفظ...' : 'حفظ العنوان'}
            </RTLText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS?.background || '#F8F9FA',
  },
  content: {
    flex: 1,
    padding: SIZES?.padding || 16,
  },
  form: {
    backgroundColor: COLORS?.white || '#FFFFFF',
    borderRadius: SIZES?.radius || 8,
    padding: SIZES?.padding || 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: SIZES?.padding || 16,
  },
  label: {
    fontSize: SIZES?.body2 || 14,
    fontWeight: 'bold',
    color: COLORS?.dark || '#2D3436',
    marginBottom: SIZES?.base || 8,
    textAlign: 'right',
  },
  textInputContainer: {
    borderWidth: 1,
    borderColor: COLORS?.lightGray || '#DFE6E9',
    borderRadius: SIZES?.radius || 8,
    overflow: 'hidden',
  },
  textInput: {
    padding: SIZES?.base || 12,
    fontSize: SIZES?.body2 || 14,
    color: COLORS?.dark || '#2D3436',
    textAlign: 'right',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: COLORS?.lightGray || '#DFE6E9',
    borderRadius: SIZES?.radius || 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: COLORS?.dark || '#2D3436',
  },
  pickerItem: {
    textAlign: 'right',
    fontSize: SIZES?.body2 || 14,
  },
  checkboxContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: SIZES?.base || 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS?.primary || '#FF6B35',
    borderRadius: 4,
    marginLeft: SIZES?.base || 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS?.primary || '#FF6B35',
  },
  checkmark: {
    color: COLORS?.white || '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: SIZES?.body2 || 14,
    color: COLORS?.dark || '#2D3436',
    flex: 1,
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: COLORS?.primary || '#FF6B35',
    borderRadius: SIZES?.radius || 8,
    padding: SIZES?.padding || 16,
    alignItems: 'center',
    marginTop: SIZES?.base || 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: COLORS?.white || '#FFFFFF',
    fontSize: SIZES?.h4 || 18,
    fontWeight: 'bold',
  },
  gpsButton: {
    backgroundColor: COLORS?.primary || '#FF6B35',
    borderRadius: SIZES?.radius || 8,
    padding: SIZES?.padding || 16,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES?.base || 8,
  },
  gpsButtonDisabled: {
    opacity: 0.6,
  },
  gpsButtonText: {
    color: COLORS?.white || '#FFFFFF',
    fontSize: SIZES?.body2 || 14,
    fontWeight: 'bold',
    marginRight: SIZES?.base || 8,
  },
});

export default AddAddressScreen;