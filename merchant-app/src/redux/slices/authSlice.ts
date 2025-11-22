import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import apiService from '@/services/api';

interface Store {
  _id: string;
 name: string;
 verificationStatus: string; // 'pending' | 'approved' | 'rejected'
  isActive: boolean;
}

interface User {
 _id: string;
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  stores?: Store[]; // Array of store objects
 isActive: boolean;
  verificationStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Async thunks
export const loadUserAsync = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = await apiService.getToken();
      if (token) {
        // First validate the session
        const isSessionValid = await apiService.validateAndRefreshIfNeeded();
        
        if (!isSessionValid) {
          console.log('Session validation failed during loadUser');
          throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
        }

        const profile = await apiService.getProfile();
        if (profile && profile.success && profile.data && profile.data.user) {
          console.log('Setting user from profile data:', profile.data.user);
          // Debug: Check stores data
          if (profile.data.user.stores) {
            console.log('User stores:', profile.data.user.stores);
            profile.data.user.stores.forEach((store: any, index: number) => {
              console.log(`Store ${index + 1}: ${store.name} - Status: ${store.verificationStatus} - Active: ${store.isActive}`);
            });
          }
          await AsyncStorage.setItem('user', JSON.stringify(profile.data.user));
          return profile.data.user;
        } else if (profile && profile.data) {
          console.log('Setting user from direct data:', profile.data);
          // Handle case where response.data is the user directly
          await AsyncStorage.setItem('user', JSON.stringify(profile.data));
          return profile.data;
        }
      }
      return null;
    } catch (error: any) {
      // Handle session expiration specifically
      if (error.message?.includes('انتهت صلاحية الجلسة') || 
          error.message?.includes('Session expired') ||
          error.message?.includes('Please login again')) {
        console.log('Session expired during loadUser, clearing auth state');
        await apiService.clearToken();
        throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
      } else {
        console.error('Error getting user profile:', error);
        await apiService.clearToken();
      }
      return rejectWithValue(error.message);
    }
  }
);

export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: { phone: string; password: string }, { rejectWithValue }) => {
    try {
      console.log('Attempting login for:', credentials.phone);
      const response = await apiService.login({ 
        phone: credentials.phone, 
        password: credentials.password, 
        role: 'store' 
      });
      
      console.log('Login response:', response);

      if (response && response.success && response.data && response.data.token && response.data.user) {
        // Store the token in the API service
        await apiService.setToken(response.data.token);

        // Set user data directly from login response
        const userData = response.data.user;
        console.log('Setting user from login:', userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        return userData;
      } else if (response && !response.success) {
        // Handle API error responses
        const errorMessage = response.error || response.message || 'خطأ في تسجيل الدخول';
        return rejectWithValue({ error: errorMessage });
      } else {
        return rejectWithValue({ error: 'رقم الهاتف أو كلمة المرور غير صحيحة' });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
      if (error.message) {
        errorMessage = error.message;
      }
      return rejectWithValue({ error: errorMessage });
    }
  }
);

export const registerAsync = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; phone: string; password: string }, { dispatch, rejectWithValue }) => {
    try {
      console.log('Attempting registration for:', userData.phone);
      const response = await apiService.register({
        name: userData.name,
        phone: userData.phone,
        password: userData.password
      });

      console.log('Registration response:', response);

      if (response && response.success) {
        // Auto-login after successful registration
        const loginResult = await dispatch(loginAsync({ 
          phone: userData.phone, 
          password: userData.password 
        })).unwrap();
        
        Toast.show({
          type: 'success',
          text1: 'تم',
          text2: 'تم إنشاء حسابك بنجاح',
        });
        return loginResult;
      } else {
        const errorMessage = response?.error || response?.message || 'حدث خطأ أثناء التسجيل';
        return rejectWithValue({ error: errorMessage });
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      let errorMessage = 'حدث خطأ أثناء التسجيل';
      if (error.message) {
        errorMessage = error.message;
      }
      return rejectWithValue({ error: errorMessage });
    }
  }
);

export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async (_, { dispatch }) => {
    try {
      await apiService.logout();
      await AsyncStorage.removeItem('user');
      await apiService.clearToken();
      // Navigation is handled in the component using the store
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    currentUser: null,
    isLoading: true,
    isAuthenticated: false,
  } as AuthState,
  reducers: {
    clearAuthError: (state) => {
      // Add any error clearing logic if needed
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load User
      .addCase(loadUserAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadUserAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(loadUserAsync.rejected, (state) => {
        state.isLoading = false;
        state.currentUser = null;
        state.isAuthenticated = false;
      })
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginAsync.rejected, (state) => {
        state.isLoading = false;
        state.currentUser = null;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerAsync.rejected, (state) => {
        state.isLoading = false;
        state.currentUser = null;
        state.isAuthenticated = false;
      })
      // Logout
      .addCase(logoutAsync.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearAuthError, setAuthLoading } = authSlice.actions;

export default authSlice.reducer;
