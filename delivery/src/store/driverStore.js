import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { useAuthStore } from './authStore';
import api from '../config/api';
import webSocketService from '../services/websocket';

export const useDriverStore = create((set, get) => ({
  // Initial state
  currentDriver: null,
  isAvailable: false,
  currentLocation: null,
  stats: {
    todayOrders: 0,
    todayEarnings: 0,
    todayHours: 0,
    totalCompleted: 0,
    averageRating: 0,
    weeklyEarnings: 0,
  },
  loading: false,

  // Initialize driver data when auth state is restored
  initializeDriver: async () => {
    try {
      const driverData = await AsyncStorage.getItem('driverData');
      if (driverData) {
        const driver = JSON.parse(driverData);
        set({ currentDriver: driver });
      }
    } catch (error) {
      console.error('Error initializing driver:', error);
    }
  },

  // Toggle driver availability
  toggleAvailability: async () => {
    set({ loading: true });
    try {
      // Make real API call to toggle availability
      const response = await api.patch('/driver/toggle-availability');
      
      if (response.data.success) {
        const newAvailability = response.data.data.isAvailable;
        
        // Update driver in store
        const currentDriver = get().currentDriver;
        if (currentDriver) {
          const updatedDriver = { ...currentDriver, isAvailable: newAvailability };
          set({ currentDriver: updatedDriver });
          
          // Save to AsyncStorage
          await AsyncStorage.setItem('driverData', JSON.stringify(updatedDriver));
        }
        
        // Update WebSocket with new availability status
        webSocketService.sendDriverStatusUpdate(newAvailability);
        
        set({ isAvailable: newAvailability, loading: false });
        
        return { success: true, data: response.data.data };
      } else {
        set({ loading: false });
        return { success: false, error: response.data.message || 'Toggle availability failed' };
      }
    } catch (error) {
      console.error('Toggle availability error:', error);
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Toggle availability failed'
      };
    }
  },

  // Update driver location
  updateLocation: async (coordinates) => {
    try {
      set({ currentLocation: coordinates });
      
      // Make real API call to update location
      const response = await api.patch('/driver/tracking/location', {
        lat: coordinates.latitude,
        lng: coordinates.longitude
      });
      
      if (response.data.success) {
        // Send location update via WebSocket as well for real-time tracking
        webSocketService.sendLocationUpdate({
          lat: coordinates.latitude,
          lng: coordinates.longitude
        });
        
        return { success: true, data: response.data.data };
      } else {
        return { success: false, error: response.data.message || 'Update location failed' };
      }
    } catch (error) {
      console.error('Update location error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Update location failed'
      };
    }
  },

  // Update driver profile
  updateProfile: async (profileData) => {
    set({ loading: true });
    try {
      // Make real API call to update profile
      const response = await api.put('/driver/profile', profileData);
      
      if (response.data.success) {
        const updatedDriver = { ...get().currentDriver, ...profileData };
        set({ currentDriver: updatedDriver });
        
        // Save to AsyncStorage
        await AsyncStorage.setItem('driverData', JSON.stringify(updatedDriver));
        
        set({ loading: false });
        
        return { success: true, data: response.data.data };
      } else {
        set({ loading: false });
        return { success: false, error: response.data.message || 'Update profile failed' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Update profile failed'
      };
    }
  },

  // Get driver stats
  getDriverStats: async () => {
    set({ loading: true });
    try {
      // Make real API call to get stats
      const response = await api.get('/driver/statistics?period=today');
      
      if (response.data.success) {
        const stats = response.data.data;
        
        set({ stats: stats, loading: false });
        
        return { success: true, stats: stats };
      } else {
        set({ loading: false });
        return { success: false, error: response.data.message || 'Get stats failed' };
      }
    } catch (error) {
      console.error('Get stats error:', error);
      set({ loading: false });
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Get stats failed'
      };
    }
  },

  // Update driver profile data
  updateDriverProfile: async () => {
    try {
      const response = await api.get('/driver/profile');
      
      if (response.data.success) {
        const driver = response.data.data;
        
        // Update driver data in AsyncStorage
        await AsyncStorage.setItem('driverData', JSON.stringify(driver));
        
        set({ currentDriver: driver });
        
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

  // Set availability directly (for initialization)
  setAvailability: (isAvailable) => {
    set({ isAvailable });
  },

  // Set current driver
  setCurrentDriver: (driver) => {
    set({ currentDriver: driver });
  },

  // Set current location
  setCurrentLocation: (location) => {
    set({ currentLocation: location });
  },

  // Set stats
 setStats: (stats) => {
    set({ stats });
  },

  // Set loading state
  setLoading: (loading) => {
    set({ loading });
  },
}));