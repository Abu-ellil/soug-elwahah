import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { API } from '../services/api';
import { calculateDistance } from '../utils/distance';

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
  const [deliveryRadius, setDeliveryRadius] = useState(40); // نصف قطر التوصيل الافتراضي - Default delivery radius (40km)
  const [availableStores, setAvailableStores] = useState([]); // المتاجر المتاحة ضمن النطاق - Available stores within radius
  const [loading, setLoading] = useState(true); // حالة التحميل - Loading state (start as true for initial GPS)
  const [error, setError] = useState(null); // حالة الخطأ - Error state
  const [gpsEnabled, setGpsEnabled] = useState(false); // حالة تفعيل GPS - GPS enabled state

  // طلب إذن الموقع عند تحميل المكون - Request location permission on component mount
  useEffect(() => {
    initializeLocation();
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
        const location = await Promise.race([
          getCurrentLocation(),
          new Promise(
            (_, reject) => setTimeout(() => reject(new Error('Timeout getting location')), 10000)
          ),
        ]);

        if (location) {
          updateAvailableStores();
        } else {
          console.log('Failed to get current location, using fallback');
        }
      } else {
        console.log('GPS permission denied, using fallback');
      }
    } catch (error) {
      console.log('خطأ في تهيئة الموقع:', error);
      setError('فشل في تهيئة نظام الموقع');
    } finally {
      setLoading(false);
    }
  };

  // دالة تحديث المتاجر المتاحة - Update available stores
  const updateAvailableStores = async () => {
    if (!userLocation) {
      setAvailableStores([]);
      console.log('No user location available, clearing stores');
      return;
    }

    try {
      console.log('Loading all available stores...');
      const response = await API.storesAPI.getAllStores();

      console.log('All stores API response:', response);
      if (response.success) {
        setAvailableStores(response.data.stores);
        console.log('Set', response.data.stores.length, 'stores as available');
      } else {
        console.error('Failed to get all stores:', response.message);
        setAvailableStores([]);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      setAvailableStores([]);
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

  // دالة تعيين الموقع يدويًا - Function to manually set location for testing
  const setLocation = (location) => {
    setUserLocation(location);
    setGpsEnabled(true);
  };

  // دالة الحصول على سلسلة نصية للموقع - Function to get location string
  const getLocationString = () => {
    if (userLocation) {
      return `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
    }
    return 'لم يتم تحديد الموقع'; // Location not determined
  };

  // دالة للحصول على اسم القرية من الإحداثيات - Function to get village name from coordinates
  const getVillageNameFromCoordinates = async (location) => {
    if (!location) {
      return null;
    }

    try {
      const geocodeResult = await Location.reverseGeocodeAsync({
        latitude: location.lat,
        longitude: location.lng,
      });

      if (geocodeResult && geocodeResult.length > 0) {
        const address = geocodeResult[0];
        // Try different possible fields that might contain village/town name
        return address.city || address.subregion || address.district || address.region || null;
      }
      return null;
    } catch (error) {
      console.log('Reverse geocoding failed:', error);
      return null;
    }
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
    setLocation, // Add the manual location setting function

    // الأدوات المساعدة - Utilities
    getLocationString,
    getVillageNameFromCoordinates,
    isLocationAvailable,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export default LocationProvider;
