import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

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
      // In a real app, you would call your API here
      // For mock data, we'll simulate the login
      const mockDriver = {
        id: 'driver1',
        name: 'محمد السائق',
        phone: '01011122',
        avatar: 'https://via.placeholder.com/200?text=Driver1',
        rating: 4.8,
        totalOrders: 145,
        totalEarnings: 4350.00,
        vehicleType: 'motorcycle',
        vehicleNumber: 'أ ب ج 1234',
        isAvailable: true,
        isActive: true,
        coordinates: { lat: 31.1110, lng: 30.9390 },
        documents: {
          nationalId: 'url_here',
          drivingLicense: 'url_here',
          isVerified: true
        },
        verificationStatus: 'approved',
        createdAt: '2024-12-01T10:00:00',
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Save token and driver data to AsyncStorage
      await AsyncStorage.setItem('userToken', 'mock_token_123');
      await AsyncStorage.setItem('driverData', JSON.stringify(mockDriver));

      set({
        isLoggedIn: true,
        token: 'mock_token_123',
        driver: mockDriver,
        loading: false,
      });

      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('driverData');
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
      // In a real app, you would call your API here
      // For mock data, we'll just return success
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
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

      set({
        token,
        driver,
        isLoggedIn: !!token,
        loading: false,
      });
    } catch (error) {
      console.error('Error restoring auth state:', error);
      set({
        token: null,
        driver: null,
        isLoggedIn: false,
        loading: false,
      });
    }
  },
}));
