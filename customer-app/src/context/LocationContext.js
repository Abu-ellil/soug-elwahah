import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { VILLAGES, STORES } from '../data';
import { calculateDistance, sortStoresByDistance } from '../utils/distance';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentVillage, setCurrentVillage] = useState(null);
  const [nearbyStores, setNearbyStores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // طلب إذن الوصول للموقع
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('تم رفض إذن الوصول للموقع');
        setIsLoading(false);
        return;
      }

      // الحصول على الموقع الحالي
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const coords = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      setCurrentLocation(coords);
      updateVillageAndStores(coords);

    } catch (error) {
      console.error('Error getting location:', error);
      setError('حدث خطأ في الحصول على الموقع');
    } finally {
      setIsLoading(false);
    }
  };

  const updateLocation = (coordinates) => {
    setCurrentLocation(coordinates);
    updateVillageAndStores(coordinates);
  };

  const updateVillageAndStores = (coords) => {
    // العثور على القرية الأقرب
    let nearestVillage = null;
    let minDistance = Infinity;

    VILLAGES.forEach(village => {
      const distance = calculateDistance(
        coords.lat,
        coords.lng,
        village.coordinates.lat,
        village.coordinates.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestVillage = village;
      }
    });

    setCurrentVillage(nearestVillage);

    // الحصول على المحلات القريبة
    const storesInVillage = STORES.filter(store => 
      store.villageId === nearestVillage?.id
    );

    const sortedStores = sortStoresByDistance(storesInVillage, coords);
    setNearbyStores(sortedStores);
  };

  const getStoresInVillage = (villageId) => {
    return STORES.filter(store => store.villageId === villageId);
  };

  const searchStores = (query, villageId = null) => {
    let stores = villageId ? getStoresInVillage(villageId) : STORES;
    
    if (query) {
      stores = stores.filter(store =>
        store.name.toLowerCase().includes(query.toLowerCase())
      );
    }

    return currentLocation 
      ? sortStoresByDistance(stores, currentLocation)
      : stores;
  };

  const value = {
    currentLocation,
    currentVillage,
    nearbyStores,
    isLoading,
    error,
    getCurrentLocation,
    updateLocation,
    getStoresInVillage,
    searchStores,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};