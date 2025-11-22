import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import apiService from '@/services/api';

interface Coordinates {
  lat: number;
  lng: number;
}

interface Category {
  _id: string;
  name: string;
  nameEn: string;
  icon: string;
  color: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  __v: number;
}

interface StoreApplicationState {
  storeName: string;
  storeDescription: string;
  storeImage: string | undefined;
  coordinates: Coordinates | null;
  documents: string[];
  selectedCategory: Category | null;
  categories: Category[];
  isCategoriesLoading: boolean;
  isLoading: boolean;
  isLocationLoading: boolean;
}

// Async thunks
export const loadCategoriesAsync = createAsyncThunk(
  'storeApplication/loadCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.getCategories();
      if (response.success) {
        return response.data.categories;
      }
      return [];
    } catch (error) {
      console.error('Error loading categories:', error);
      return rejectWithValue(error);
    }
 }
);

export const submitApplicationAsync = createAsyncThunk(
  'storeApplication/submitApplication',
  async (applicationData: {
    storeName: string;
    storeDescription: string;
    coordinates: Coordinates;
    documents: string[];
    storeImage?: string;
    selectedCategory: Category;
  }, { rejectWithValue }) => {
    try {
      const result = await apiService.createStoreApplication({
        name: applicationData.storeName.trim(),
        description: applicationData.storeDescription.trim(),
        coordinates: applicationData.coordinates,
        documents: applicationData.documents,
        image: applicationData.storeImage,
        categoryId: applicationData.selectedCategory._id,
      });

      if (result.success) {
        Toast.show({
          type: 'success',
          text1: 'تم',
          text2: 'تم تقديم طلب إنشاء المتجر بنجاح، في انتظار موافقة الإدارة',
        });
        return result;
      } else {
        Alert.alert('خطأ', result.message || 'حدث خطأ أثناء تقديم الطلب');
        return rejectWithValue(result.message || 'حدث خطأ أثناء تقديم الطلب');
      }
    } catch (error: any) {
      Alert.alert('خطأ', 'حدث خطأ أثناء تقديم الطلب');
      return rejectWithValue(error.message || 'حدث خطأ أثناء تقديم الطلب');
    }
  }
);

const storeApplicationSlice = createSlice({
  name: 'storeApplication',
  initialState: {
    storeName: '',
    storeDescription: '',
    storeImage: undefined,
    coordinates: null,
    documents: [],
    selectedCategory: null,
    categories: [],
    isCategoriesLoading: false,
    isLoading: false,
    isLocationLoading: false,
  } as StoreApplicationState,
  reducers: {
    setStoreName: (state, action: PayloadAction<string>) => {
      state.storeName = action.payload;
    },
    setStoreDescription: (state, action: PayloadAction<string>) => {
      state.storeDescription = action.payload;
    },
    setStoreImage: (state, action: PayloadAction<string | undefined>) => {
      state.storeImage = action.payload;
    },
    setCoordinates: (state, action: PayloadAction<Coordinates | null>) => {
      state.coordinates = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setIsCategoriesLoading: (state, action: PayloadAction<boolean>) => {
      state.isCategoriesLoading = action.payload;
    },
    setDocuments: (state, action: PayloadAction<string[]>) => {
      state.documents = action.payload;
    },
    setIsLocationLoading: (state, action: PayloadAction<boolean>) => {
      state.isLocationLoading = action.payload;
    },
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetStoreApplication: (state) => {
      state.storeName = '';
      state.storeDescription = '';
      state.storeImage = undefined;
      state.coordinates = null;
      state.selectedCategory = null;
      state.categories = [];
      state.isCategoriesLoading = false;
      state.documents = [];
      state.isLoading = false;
    },
    pickImage: (state) => {
      // This will be handled in the component since it requires UI interaction
    },
    getCurrentLocation: (state) => {
      // This will be handled in the component since it requires UI interaction
    },
  },
  extraReducers: (builder) => {
    builder
      // Load Categories
      .addCase(loadCategoriesAsync.pending, (state) => {
        state.isCategoriesLoading = true;
      })
      .addCase(loadCategoriesAsync.fulfilled, (state, action) => {
        state.isCategoriesLoading = false;
        state.categories = action.payload;
      })
      .addCase(loadCategoriesAsync.rejected, (state) => {
        state.isCategoriesLoading = false;
      })
      // Submit Application
      .addCase(submitApplicationAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(submitApplicationAsync.fulfilled, (state) => {
        state.isLoading = false;
        // Reset the form after successful submission
        state.storeName = '';
        state.storeDescription = '';
        state.storeImage = undefined;
        state.coordinates = null;
        state.selectedCategory = null;
        state.documents = [];
      })
      .addCase(submitApplicationAsync.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const {
  setStoreName,
  setStoreDescription,
  setStoreImage,
  setCoordinates,
  setSelectedCategory,
 setCategories,
  setIsCategoriesLoading,
  setDocuments,
  setIsLocationLoading,
  setIsLoading,
 resetStoreApplication,
 pickImage,
  getCurrentLocation,
} = storeApplicationSlice.actions;

export default storeApplicationSlice.reducer;
