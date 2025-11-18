import React, { createContext, useReducer } from 'react';
import * as Location from 'expo-location';

// Initial state
const initialState = {
  currentLocation: null,
  isTracking: false,
  locationPermission: null,
  lastUpdate: null,
};

// Location Context
export const LocationContext = createContext();

// Location Reducer
const locationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOCATION':
      return { ...state, currentLocation: action.location, lastUpdate: action.timestamp };
    case 'SET_TRACKING':
      return { ...state, isTracking: action.isTracking };
    case 'SET_PERMISSION':
      return { ...state, locationPermission: action.permission };
    default:
      return state;
  }
};

// Location Provider
export const LocationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(locationReducer, initialState);

 // Request location permission
  const requestPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        dispatch({ type: 'SET_PERMISSION', permission: 'denied' });
        return { success: false, error: 'Permission denied' };
      }
      
      dispatch({ type: 'SET_PERMISSION', permission: 'granted' });
      return { success: true };
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return { success: false, error: error.message };
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      await requestPermission();
      
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      
      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
      };
      
      dispatch({ 
        type: 'SET_LOCATION', 
        location: locationData, 
        timestamp: new Date().toISOString() 
      });
      
      return { success: true, location: locationData };
    } catch (error) {
      console.error('Error getting current location:', error);
      return { success: false, error: error.message };
    }
  };

 // Start location tracking
  const startTracking = async () => {
    try {
      dispatch({ type: 'SET_TRACKING', isTracking: true });
      
      // Request permissions
      const permissionResult = await requestPermission();
      if (!permissionResult.success) {
        return permissionResult;
      }
      
      // Watch position
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
          
          dispatch({ 
            type: 'SET_LOCATION', 
            location: locationData, 
            timestamp: new Date().toISOString() 
          });
        }
      );
      
      return { success: true, watchId };
    } catch (error) {
      console.error('Error starting location tracking:', error);
      dispatch({ type: 'SET_TRACKING', isTracking: false });
      return { success: false, error: error.message };
    }
  };

  // Stop location tracking
 const stopTracking = () => {
    dispatch({ type: 'SET_TRACKING', isTracking: false });
    // In a real implementation, you would clear the watchId
    return { success: true };
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
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
  };

  return (
    <LocationContext.Provider
      value={{
        ...state,
        requestPermission,
        getCurrentLocation,
        startTracking,
        stopTracking,
        calculateDistance,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};