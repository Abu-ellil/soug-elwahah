import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import {
  getStoresWithinRadius
} from '../utils/locationHelpers';
import { calculateDistance } from '../utils/distance';
import { STORES } from '../data/stores';

// إنشاء سياق الموقع - Create Location Context
const LocationContext = createContext();

// خطاف مخصص لاستخدام سياق الموقع - Custom hook for using Location Context
export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('يجب استخدام useLocation داخل LocationProvider'); // useLocation must be used within a LocationProvider
  }
  return context;
};

// مزود سياق الموقع - Location Context Provider Component
export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null); // موقع المستخدم الحالي - Current user's location
 const [deliveryRadius, setDeliveryRadius] = useState(5); // نصف قطر التوصيل الافتراضي - Default delivery radius (5km)
  const [availableStores, setAvailableStores] = useState([]); // المتاجر المتاحة ضمن النطاق - Available stores within radius
 const [loading, setLoading] = useState(true); // حالة التحميل - Loading state (start as true for initial GPS)
 const [error, setError] = useState(null); // حالة الخطأ - Error state
  const [gpsEnabled, setGpsEnabled] = useState(false); // حالة تفعيل GPS - GPS enabled state

  // طلب إذن الموقع عند تحميل المكون - Request location permission on component mount
  useEffect(() => {
    initializeLocation();
    
    // Set up location watching for continuous updates
    let locationTask = null;
    
    const startLocationWatching = async () => {
      const hasPermission = await requestLocationPermission();
      if (hasPermission && userLocation) {
        try {
          // Set up background location updates
          locationTask = await Location.watchPositionAsync({
            accuracy: Location.Accuracy.High,
            timeInterval: 10000, // Update every 10 seconds
            distanceInterval: 10, // Update every 10 meters
          }, (location) => {
            const newLocation = {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            };
            
            // Only update if location has changed significantly (more than 10 meters)
            if (userLocation) {
              // Update available stores for new location
              updateAvailableStores();
            } else {
              setUserLocation(newLocation);
            }
          });
        } catch (error) {
          console.log('Failed to start location watching:', error);
          // Fallback to manual location updates
          const interval = setInterval(async () => {
            await getCurrentLocation();
          }, 30000); // Update every 30 seconds
          
          return () => {
            clearInterval(interval);
          };
        }
      }
    };
    
    startLocationWatching();
    
    // Cleanup function
    return () => {
      if (locationTask) {
        locationTask.then(task => task && task.cancel && task.cancel()).catch(() => {});
      }
    };
  }, []);

  // تحديث المتاجر عند تغيير الموقع أو النطاق - Update stores when location or radius changes
 useEffect(() => {
    if (userLocation) {
      updateAvailableStores();
    }
  }, [userLocation, deliveryRadius]);

  // دالة طلب إذن الموقع - Function to request location permission
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('تم رفض إذن الوصول للموقع');
        setGpsEnabled(false);
        return false;
      }
      setGpsEnabled(true);
      return true;
    } catch (error) {
      setError('خطأ في طلب إذن الموقع');
      setGpsEnabled(false);
      return false;
    }
  };

  // دالة تهيئة الموقع عند بدء التطبيق - Initialize location on app start
 const initializeLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        // Add a timeout to ensure location is fetched even if it takes longer
        const location = await Promise.race([
          getCurrentLocation(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Timeout getting location')), 100)
          )
        ]);
        
        if (location) {
          // Location was successfully set, update available stores
          updateAvailableStores();
        } else {
          console.log('Failed to get current location, using fallback');
          updateAvailableStores();
        }
      } else {
        console.log('GPS permission denied, using fallback');
        updateAvailableStores();
      }
    } catch (error) {
      console.log('خطأ في تهيئة الموقع:', error);
      setError('فشل في تهيئة نظام الموقع');
      updateAvailableStores();
    } finally {
      setLoading(false);
    }
  };

  // دالة تحديث المتاجر المتاحة - Update available stores
 const updateAvailableStores = () => {
    if (userLocation) {
      const stores = getStoresWithinRadius(userLocation, deliveryRadius);
      setAvailableStores(stores);
    } else {
      // إذا لم يكن هناك موقع، اعرض جميع المتاجر المفتوحة - If no location, show all open stores
      const allStores = STORES.filter(store => store.isOpen);
      setAvailableStores(allStores);
    }
  };

  // دالة الحصول على الموقع الحالي للمستخدم - Function to get current user's location
  const getCurrentLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        throw new Error('لا يوجد إذن للوصول للموقع'); // No permission to access location
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };

      setUserLocation(newLocation);
      setGpsEnabled(true);

      return newLocation;
    } catch (error) {
      setError('خطأ في الحصول على الموقع');
      setGpsEnabled(false);
      Alert.alert('خطأ', 'فشل في الحصول على موقعك الحالي');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // دالة مسح معلومات الموقع - Function to clear location information
  const clearLocation = () => {
    setUserLocation(null);
    setAvailableStores([]);
    setGpsEnabled(false);
    setError(null);
  };

  // دالة تحديث نصف قطر التوصيل - Function to update delivery radius
  const updateDeliveryRadius = (newRadius) => {
    setDeliveryRadius(newRadius);
  };

  // دالة الحصول على سلسلة نصية للموقع - Function to get location string
  const getLocationString = () => {
    if (userLocation) {
      return `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
    }
    return 'لم يتم تحديد الموقع'; // Location not determined
  };

  // دالة التحقق مما إذا كان الموقع متاحًا - Function to check if location is available
  const isLocationAvailable = () => {
    return userLocation !== null;
 };

  // القيم التي يوفرها السياق - Values provided by the context
  const value = {
    // الحالة - State
    userLocation,
    deliveryRadius,
    availableStores,
    loading,
    error,
    gpsEnabled,

    // الإجراءات - Actions
    getCurrentLocation,
    updateDeliveryRadius,
    clearLocation,

    // الأدوات المساعدة - Utilities
    getLocationString,
    isLocationAvailable,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export default LocationProvider;
