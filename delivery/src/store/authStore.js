import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import api from '../config/api';
import webSocketService from '../services/websocket';

export const useAuthStore = create((set, get) => ({
  // Initial state
  isLoggedIn: false,
  token: null,
  driver: null,
 loading: true, // Set to true initially to indicate that auth state is being restored
  
  // Actions
  login: async (phone, password) => {
    set({ loading: true });
    
    try {
      // Make real API call to login with role parameter
      const response = await api.post('/auth/login', {
        phone,
        password,
        role: 'driver'
      });

      if (response.data.success) {
        const { token, user: driver } = response.data.data;

        // Save token and driver data to AsyncStorage
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('driverData', JSON.stringify(driver));

        set({
          isLoggedIn: true,
          token: token,
          driver: driver,
          loading: false,
        });

        return { success: true, data: response.data.data };
      } else {
        set({ loading: false });
        return { success: false, error: response.data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Login failed'
      };
    }
  },

  logout: async () => {
    try {
      // Remove all authentication-related data
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('driverData');
      
      // Clear any other potential cached data that might be related to the session
      await AsyncStorage.removeItem('persist:root'); // Redux persist if used
      await AsyncStorage.getAllKeys()
        .then((keys) => {
          const authRelatedKeys = keys.filter(key =>
            key.includes('token') ||
            key.includes('auth') ||
            key.includes('session') ||
            key.includes('driver')
          );
          return Promise.all(authRelatedKeys.map(key => AsyncStorage.removeItem(key)));
        })
        .catch(error => console.warn('Error clearing auth-related keys:', error));
        
      // Disconnect WebSocket to ensure no persistent connection remains
      webSocketService.disconnect();
    } catch (e) {
      console.error('Error during logout:', e);
    }
    
    set({
      isLoggedIn: false,
      token: null,
      driver: null,
      loading: false,
    });
  },

  register: async (driverData) => {
    try {
      // Make real API call to register - using the correct endpoint
      const response = await api.post('/auth/driver/register', driverData);

      if (response.data.success) {
        // Note: Driver registration doesn't return a token since drivers need to be approved first
        // The success response indicates the registration was submitted successfully
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Registration failed' 
      };
    }
  },

  // Restore authentication state from storage
  restoreAuthState: async () => {
    set({ loading: true });
    
    try {
      const token = await AsyncStorage.getItem('userToken');
      const driverData = await AsyncStorage.getItem('driverData');
      
      let driver = null;
      if (driverData) {
        driver = JSON.parse(driverData);
      }

      // Only set as logged in if we have a valid token
      const hasValidToken = !!token;
      
      set({
        token,
        driver,
        isLoggedIn: hasValidToken,
        loading: false,
      });
      
      // If there's no valid token, ensure WebSocket is disconnected
      if (!hasValidToken) {
        webSocketService.disconnect();
      }
    } catch (error) {
      console.error('Error restoring auth state:', error);
      set({
        token: null,
        driver: null,
        isLoggedIn: false,
        loading: false,
      });
      webSocketService.disconnect();
    }
  },

  // Get driver profile
  getDriverProfile: async () => {
    try {
      const response = await api.get('/driver/profile');
      
      if (response.data.success) {
        const driver = response.data.data;
        
        // Update driver data in AsyncStorage
        await AsyncStorage.setItem('driverData', JSON.stringify(driver));
        
        set({
          driver: driver,
        });
        
        return { success: true, data: driver };
      } else {
        return { success: false, error: response.data.message || 'Failed to get profile' };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Failed to get profile' 
      };
    }
  },
}));
