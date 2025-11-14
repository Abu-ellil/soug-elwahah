import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { getAvailableVillages } from '../utils/locationHelpers';
import { VILLAGES } from '../data/villages';

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
  const [currentVillage, setCurrentVillage] = useState(null); // القرية الأقرب للمستخدم - Nearest village to the user
  const [selectedVillage, setSelectedVillage] = useState(null); // القرية المختارة يدوياً - Manually selected village
  const [availableVillages, setAvailableVillages] = useState([]); // القرى المتاحة بناءً على الموقع - Available villages based on location
  const [loading, setLoading] = useState(false); // حالة التحميل - Loading state
  const [error, setError] = useState(null); // حالة الخطأ - Error state

  // طلب إذن الموقع عند تحميل المكون - Request location permission on component mount
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // مراقبة تغييرات القرى المتاحة - Monitor changes in available villages
  useEffect(() => {
    console.log('availableVillages changed:', availableVillages);
  }, [availableVillages]);

  // تحديث القرية الحالية عند تغيير موقع المستخدم - Update current village when user location changes
  useEffect(() => {
    if (userLocation) {
      findNearestVillage(userLocation);
    }
  }, [userLocation]);

  // دالة طلب إذن الوصول إلى الموقع - Function to request location permission
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('تم رفض إذن الموقع'); // Location permission denied
        return false;
      }
      return true;
    } catch (error) {
      setError('خطأ في طلب إذن الموقع'); // Error requesting location permission
      return false;
    }
  };

  // دالة البحث عن أقرب قرية - Function to find the nearest village
  const findNearestVillage = (location) => {
    let nearestVillage = null;
    let minDistance = Infinity;

    VILLAGES.forEach((village) => {
      const distance =
        Math.sqrt(
          Math.pow(location.lat - village.coordinates.lat, 2) +
            Math.pow(location.lng - village.coordinates.lng, 2)
        ) * 111; // تحويل تقريبي إلى كيلومتر - Rough conversion to km

      if (distance < minDistance) {
        minDistance = distance;
        nearestVillage = village;
      }
    });

    setCurrentVillage(nearestVillage);
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
        timeInterval: 5000,
        distanceInterval: 10,
      });

      const { latitude, longitude } = location.coords;
      const newLocation = { lat: latitude, lng: longitude };

      setUserLocation(newLocation);

      // تحميل القرى المتاحة لهذا الموقع - Load available villages for this location
      const villages = getAvailableVillages(newLocation, 50);
      setAvailableVillages(villages);

      return newLocation;
    } catch (error) {
      const errorMessage = error.message || 'فشل في الحصول على الموقع'; // Failed to get location
      setError(errorMessage);
      Alert.alert('خطأ في الموقع', errorMessage); // Location error
      return null;
    } finally {
      setLoading(false);
    }
  };

  // دالة اختيار قرية - Function to select a village
  const selectVillage = (village) => {
    setSelectedVillage(village);
  };

  // دالة تحديث معلومات التوصيل - Function to update delivery information
  const updateDeliveryInfo = (villageId) => {
    const village = availableVillages.find((v) => v.id === villageId);
    if (village) {
      setSelectedVillage(village);
    }
  };

  // دالة مسح معلومات الموقع - Function to clear location information
  const clearLocation = () => {
    setUserLocation(null);
    setSelectedVillage(null);
    setAvailableVillages([]);
    setError(null);
  };

  // دالة الحصول على سلسلة نصية للموقع - Function to get location string
  const getLocationString = () => {
    if (selectedVillage) {
      return selectedVillage.name;
    }
    if (userLocation) {
      return `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
    }
    return 'لم يتم تحديد الموقع'; // Location not determined
  };

  // دالة التحقق مما إذا كان الموقع متاحًا - Function to check if location is available
  const isLocationAvailable = () => {
    return userLocation !== null && availableVillages.length > 0;
  };

  // القيم التي يوفرها السياق - Values provided by the context
  const value = {
    // الحالة - State
    userLocation,
    currentVillage,
    selectedVillage,
    availableVillages,
    loading,
    error,

    // الإجراءات - Actions
    getCurrentLocation,
    selectVillage,
    updateDeliveryInfo,
    clearLocation,

    // الأدوات المساعدة - Utilities
    getLocationString,
    isLocationAvailable,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export default LocationProvider;
