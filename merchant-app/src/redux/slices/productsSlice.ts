import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import Toast from 'react-native-toast-message';
import { Product } from '@/types/product';
import apiService from '@/services/api';

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  refreshing: boolean;
  hasApprovedStore: boolean;
}

// Async thunks
export const fetchProductsAsync = createAsyncThunk(
  'products/fetchProducts',
 async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching products...');
      const response = await apiService.getProducts();
      console.log('Products API response:', response);
      
      if (response.success && response.data) {
        console.log('Setting products:', response.data.products || []);
        return response.data.products || [];
      } else {
        console.error('Failed to fetch products:', response.message);
        return rejectWithValue(response.message || 'فشل في تحميل المنتجات');
      }
    } catch (error: any) {
      console.error('Fetch products error:', error);
      return rejectWithValue(error.message || 'فشل في تحميل المنتجات');
    }
  }
);

export const deleteProductAsync = createAsyncThunk(
  'products/deleteProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.deleteProduct(productId);
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'تم',
          text2: 'تم حذف المنتج بنجاح',
        });
        return productId;
      } else {
        Toast.show({
          type: 'error',
          text1: 'خطأ',
          text2: response.message || 'فشل في حذف المنتج',
        });
        return rejectWithValue(response.message || 'فشل في حذف المنتج');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: error.message || 'فشل في حذف المنتج',
      });
      return rejectWithValue(error.message || 'فشل في حذف المنتج');
    }
  }
);

export const toggleProductAvailabilityAsync = createAsyncThunk(
  'products/toggleAvailability',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.toggleProductAvailability(productId);
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'تم',
          text2: 'تم تحديث حالة المنتج',
        });
        return { productId, isAvailable: !response.data?.isAvailable };
      } else {
        Toast.show({
          type: 'error',
          text1: 'خطأ',
          text2: response.message || 'فشل في تحديث حالة المنتج',
        });
        return rejectWithValue(response.message || 'فشل في تحديث حالة المنتج');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: error.message || 'فشل في تحديث حالة المنتج',
      });
      return rejectWithValue(error.message || 'فشل في تحديث حالة المنتج');
    }
 }
);

export const addProductAsync = createAsyncThunk(
  'products/addProduct',
  async (productData: any, { dispatch, rejectWithValue }) => {
    try {
      console.log('Adding product with data:', productData);
      const response = await apiService.addProduct(productData);
      console.log('Add product response:', response);
      
      if (response.success) {
        console.log('Product added successfully, refreshing products list...');
        await dispatch(fetchProductsAsync());
        Toast.show({
          type: 'success',
          text1: 'تم',
          text2: 'تم إضافة المنتج بنجاح',
        });
        return response.data;
      } else {
        console.error('Add product failed:', response.message);
        Toast.show({
          type: 'error',
          text1: 'خطأ',
          text2: response.message || 'فشل في إضافة المنتج',
        });
        return rejectWithValue(response.message || 'فشل في إضافة المنتج');
      }
    } catch (error: any) {
      console.error('Add product error:', error);
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: error.message || 'فشل في إضافة المنتج',
      });
      return rejectWithValue(error.message || 'فشل في إضافة المنتج');
    }
 }
);

export const fetchProductByIdAsync = createAsyncThunk(
  'products/fetchProductById',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await apiService.getProductById(productId);
      if (response.success && response.data) {
        return response.data;
      } else {
        return rejectWithValue(response.message || 'فشل في تحميل المنتج');
      }
    } catch (error: any) {
      return rejectWithValue(error.message || 'فشل في تحميل المنتج');
    }
  }
);

export const updateProductAsync = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData }: { productId: string; productData: any }, { rejectWithValue }) => {
    try {
      const response = await apiService.updateProduct(productId, productData);
      if (response.success) {
        Toast.show({
          type: 'success',
          text1: 'تم',
          text2: 'تم تحديث المنتج بنجاح',
        });
        return { productId, productData };
      } else {
        Toast.show({
          type: 'error',
          text1: 'خطأ',
          text2: response.message || 'فشل في تحديث المنتج',
        });
        return rejectWithValue(response.message || 'فشل في تحديث المنتج');
      }
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'خطأ',
        text2: error.message || 'فشل في تحديث المنتج',
      });
      return rejectWithValue(error.message || 'failure in updating product');
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    isLoading: true,
    refreshing: false,
    hasApprovedStore: false,
  } as ProductsState,
  reducers: {
    setHasApprovedStore: (state, action: PayloadAction<boolean>) => {
      state.hasApprovedStore = action.payload;
    },
    initializeProducts: (state) => {
      // This can be called when the store is created to set initial state
      console.log('Initializing products slice');
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProductsAsync.pending, (state) => {
        if (!state.refreshing) {
          state.isLoading = true;
        }
      })
      .addCase(fetchProductsAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.refreshing = false;
        state.products = action.payload;
      })
      .addCase(fetchProductsAsync.rejected, (state) => {
        state.isLoading = false;
        state.refreshing = false;
      })
      // Delete Product
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p._id !== action.payload);
      })
      // Toggle Availability
      .addCase(toggleProductAvailabilityAsync.fulfilled, (state, action) => {
        const { productId, isAvailable } = action.payload;
        const productIndex = state.products.findIndex(p => p._id === productId);
        if (productIndex !== -1) {
          state.products[productIndex].isAvailable = isAvailable;
        }
      })
      // Add Product - handled by fetchProductsAsync which refreshes the list
      // Update Product
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        const { productId, productData } = action.payload;
        const productIndex = state.products.findIndex(p => p._id === productId);
        if (productIndex !== -1) {
          state.products[productIndex] = { ...state.products[productIndex], ...productData };
        }
      });
  },
});

export const { setHasApprovedStore, initializeProducts } = productsSlice.actions;

export default productsSlice.reducer;
