import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '../stores/locationStore';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const locationStore = useLocationStore();

  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      const locationResult = await Location.getCurrentPositionAsync({});
      setLocation(locationResult);

      // Set location in store
      locationStore.setLocation({
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      });

      // Get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: locationResult.coords.latitude,
        longitude: locationResult.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const addressData = reverseGeocode[0];
        setAddress(addressData);
      }
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    location,
    address,
    loading,
    setLocation: locationStore.setLocation,
    setAddress: locationStore.setAddress,
    getCurrentLocation,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};
