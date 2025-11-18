import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import apiService from '../../services/api';
import Toast from 'react-native-toast-message';

const ProductFormScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEditing = !!id;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('grocery');
  const [image, setImage] = useState<string | null>(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditing);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const fetchProduct = async () => {
    if (!isEditing || !id) return;

    try {
      setIsLoadingProduct(true);
      // Note: API doesn't have get single product endpoint, so we'll skip for now
      // In a real implementation, you'd fetch the product data here
      console.log('Fetching product:', id);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: 'فشل في تحميل بيانات المنتج',
      });
    } finally {
      setIsLoadingProduct(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoadingCategories(true);
      const response = await apiService.request('/categories');
      if (response.success) {
        setCategories(response.data.categories);
        // Set default category to first one if available
        if (response.data.categories.length > 0 && !isEditing) {
          setCategoryId(response.data.categories[0]._id);
        }
      }
    } catch (error: any) {
      console.error('Error fetching categories:', error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

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
      setImage(result.assets[0].uri);
    }
  };

  useEffect(() => {
    fetchProduct();
    fetchCategories();
  }, [id]);

  const handleSaveProduct = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال اسم المنتج');
      return;
    }
    if (!categoryId) {
      Alert.alert('خطأ', 'يرجى اختيار الفئة');
      return;
    }
    if (!price.trim() || isNaN(parseFloat(price))) {
      Alert.alert('خطأ', 'يرجى إدخال سعر صحيح');
      return;
    }
    if (!stock.trim() || isNaN(parseInt(stock))) {
      Alert.alert('خطأ', 'يرجى إدخال كمية صحيحة');
      return;
    }
    if (!image) {
      Alert.alert('خطأ', 'يرجى اختيار صورة المنتج');
      return;
    }

    try {
      setIsLoading(true);

      const productData = {
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        stock: parseInt(stock),
        categoryId,
        ...(image && { image }),
      };

      let response;
      if (isEditing && id) {
        response = await apiService.updateProduct(id as string, productData);
      } else {
        response = await apiService.addProduct(productData);
      }

      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'تم',
          text2: isEditing ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح',
        });
        router.back();
      } else {
        Alert.alert('خطأ', response.message || 'فشل في حفظ المنتج');
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      Alert.alert('خطأ', error.message || 'فشل في حفظ المنتج');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? 'تعديل منتج' : 'إضافة منتج'}
        </Text>
        <View style={{ width: 24 }} /> {/* Spacer for alignment */}
      </View>

      {/* Form */}
      <View style={styles.formContainer}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image }} style={styles.selectedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="camera-outline" size={40} color="#9CA3AF" />
                <Text style={styles.imagePlaceholderText}>اختر صورة المنتج</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Product Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>اسم المنتج</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="أدخل اسم المنتج"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>الوصف</Text>
          <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="أدخل وصف المنتج"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Price and Stock */}
        <View style={styles.rowContainer}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>السعر (ج.م)</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>الكمية المتوفرة</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={stock}
                onChangeText={setStock}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSaveProduct}
          disabled={isLoading}>
          <Text style={styles.saveButtonText}>
            {isLoading ? 'جاري الحفظ...' : 'حفظ المنتج'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    padding: 16,
    paddingTop: 40,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'right',
  },
  inputWrapper: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: 'white',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    textAlign: 'right',
    color: '#1F2937',
  },
  textArea: {
    textAlignVertical: 'top',
    height: 100,
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  selectedImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
});

export default ProductFormScreen;
