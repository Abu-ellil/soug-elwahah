import { useDriverStore } from '../store/driverStore';
import { useAuthStore } from '../store/authStore';

// Custom hook that directly uses the Zustand store
export const useDriver = () => {
  const driverStore = useDriverStore();
  const authStore = useAuthStore();
  
  // Return the driver state and actions in the same format as the context used to provide
 return {
    currentDriver: driverStore.currentDriver,
    isAvailable: driverStore.isAvailable,
    currentLocation: driverStore.currentLocation,
    stats: driverStore.stats,
    loading: driverStore.loading,
    toggleAvailability: driverStore.toggleAvailability,
    updateLocation: driverStore.updateLocation,
    updateProfile: driverStore.updateProfile,
    getDriverStats: driverStore.getDriverStats,
    initializeDriver: driverStore.initializeDriver,
    setAvailability: driverStore.setAvailability,
    setCurrentDriver: driverStore.setCurrentDriver,
    setCurrentLocation: driverStore.setCurrentLocation,
    setStats: driverStore.setStats,
    setLoading: driverStore.setLoading,
    updateDriverProfile: driverStore.updateDriverProfile,
    ...driverStore, // Include all other store functions and state
  };
};