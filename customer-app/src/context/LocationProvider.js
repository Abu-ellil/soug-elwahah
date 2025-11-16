import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import {
  getAvailableVillages,
  getStoresWithinRadius,
  getNearestVillage,
  isWithinAnyVillageRadius
} from '../utils/locationHelpers';
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
  const [deliveryRadius, setDeliveryRadius] = useState(5); // نصف قطر التوصيل الافتراضي - Default delivery radius (5km)
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
        await getCurrentLocation();
      } else {
        // GPS غير متاح، استخدم القيم الافتراضية - GPS not available, use defaults
        setAvailableVillages(VILLAGES.filter(v => v.isActive));
        updateAvailableStores();
      }
    } catch (error) {
      console.log('خطأ في تهيئة الموقع:', error);
      setError('فشل في تهيئة نظام الموقع');
      // استخدم القيم الافتراضية في حالة الخطأ - Use defaults on error
      setAvailableVillages(VILLAGES.filter(v => v.isActive));
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
      setAvailableStores([]);
    }
  };

  // مراقبة تغييرات القرى المتاحة - Monitor changes in available villages
  useEffect(() => {
    console.log('availableVillages changed:', availableVillages);
  }, [availableVillages]);

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

      // تحديد القرية الأقرب - Find nearest village
      const nearestVillage = getNearestVillage(newLocation);
      setCurrentVillage(nearestVillage);

      // تحميل القرى المتاحة لهذا الموقع - Load available villages for this location
      const villages = getAvailableVillages(newLocation, 50);
      setAvailableVillages(villages);

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
    setCurrentVillage(null);
    setSelectedVillage(null);
    setAvailableVillages([]);
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
    deliveryRadius,
    availableStores,
    loading,
    error,
    gpsEnabled,

    // الإجراءات - Actions
    getCurrentLocation,
    selectVillage,
    updateDeliveryInfo,
    updateDeliveryRadius,
    clearLocation,

    // الأدوات المساعدة - Utilities
    getLocationString,
    isLocationAvailable,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export default LocationProvider;
