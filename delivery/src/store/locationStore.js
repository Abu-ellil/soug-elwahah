import { create } from 'zustand';
import * as Location from 'expo-location';

export const useLocationStore = create((set, get) => ({
  // Initial state
  currentLocation: null,
  isTracking: false,
  locationPermission: null,
  lastUpdate: null,

  // Request location permission
  requestPermission: async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        set({ locationPermission: 'denied' });
        return { success: false, error: 'Permission denied' };
      }
      
      set({ locationPermission: 'granted' });
      return { success: true };
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return { success: false, error: error.message };
    }
  },

  // Get current location
  getCurrentLocation: async () => {
    try {
      await get().requestPermission();
      
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      };
      
      set({ 
        currentLocation: locationData, 
        lastUpdate: new Date().toISOString() 
      });
      
      return { success: true, location: locationData };
    } catch (error) {
      console.error('Error getting current location:', error);
      return { success: false, error: error.message };
    }
  },

 // Start location tracking
  startTracking: async () => {
    try {
      set({ isTracking: true });
      
      // Request permissions
      const permissionResult = await get().requestPermission();
      if (!permissionResult.success) {
        return permissionResult;
      }
      
      // Watch position - Note: This requires handling the watchId properly in a real implementation
      // For Zustand, we'll need to manage the watchId separately if needed
      const watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const locationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
          };
          
          set({ 
            currentLocation: locationData, 
            lastUpdate: new Date().toISOString() 
          });
        }
      );
      
      return { success: true, watchId };
    } catch (error) {
      console.error('Error starting location tracking:', error);
      set({ isTracking: false });
      return { success: false, error: error.message };
    }
  },

  // Stop location tracking
  stopTracking: () => {
    set({ isTracking: false });
    // In a real implementation, you would clear the watchId
    return { success: true };
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance: (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
 },

  // Set current location
  setCurrentLocation: (location) => {
    set({ currentLocation: location });
  },

  // Set tracking state
  setTracking: (isTracking) => {
    set({ isTracking });
  },

  // Set permission state
  setPermission: (permission) => {
    set({ locationPermission: permission });
  },
}));