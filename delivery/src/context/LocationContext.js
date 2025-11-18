import { useLocationStore } from '../store/locationStore';

// Custom hook that directly uses the Zustand store
export const useLocation = () => {
  const locationStore = useLocationStore();
  
  // Return the location state and actions in the same format as the context used to provide
 return {
    currentLocation: locationStore.currentLocation,
    isTracking: locationStore.isTracking,
    locationPermission: locationStore.locationPermission,
    lastUpdate: locationStore.lastUpdate,
    requestPermission: locationStore.requestPermission,
    getCurrentLocation: locationStore.getCurrentLocation,
    startTracking: locationStore.startTracking,
    stopTracking: locationStore.stopTracking,
    calculateDistance: locationStore.calculateDistance,
    setCurrentLocation: locationStore.setCurrentLocation,
    setTracking: locationStore.setTracking,
    setPermission: locationStore.setPermission,
    ...locationStore, // Include all other store functions and state
  };
};