import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { API } from '../services/api';
import { calculateDistance } from '../utils/distance';
import { useOfflineStore } from './offlineStore';

export const useLocationStore = create(
  persist(
    (set, get) => ({
      // الحالة - State
      userLocation: null, // موقع المستخدم الحالي
      deliveryRadius: 40, // نصف قطر التوصيل الافتراضي
      availableStores: [], // المتاجر المتاحة ضمن النطاق
      loading: true, // حالة التحميل
      error: null, // حالة الخطأ
      gpsEnabled: false, // حالة تفعيل GPS

      // الإجراءات - Actions
      requestLocationPermission: async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            set({ error: 'تم رفض إذن الوصول للموقع', gpsEnabled: false });
            return false;
          }
          set({ gpsEnabled: true });
          return true;
        } catch (error) {
          set({ error: 'خطأ في طلب إذن الموقع', gpsEnabled: false });
          return false;
        }
      },

      initializeLocation: async () => {
        set({ loading: true, error: null });

        try {
          const hasPermission = await get().requestLocationPermission();
          if (hasPermission) {
            try {
              const location = await Promise.race([
                get().getCurrentLocation(),
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error('Timeout getting location')), 10000)
                ),
              ]);

              if (location) {
                get().updateAvailableStores();
              } else {
                console.log('Failed to get current location, using fallback');
              }
            } catch (timeoutError) {
              console.log('Location timeout:', timeoutError);
            }
          } else {
            console.log('GPS permission denied, using fallback');
          }
        } catch (error) {
          console.log('خطأ في تهيئة الموقع:', error);
          set({ error: 'فشل في تهيئة نظام الموقع' });
        } finally {
          set({ loading: false });
        }
      },

      updateAvailableStores: async () => {
        const { userLocation } = get();
        if (!userLocation) {
          set({ availableStores: [] });
          console.log('No user location available, clearing stores');
          return;
        }

        // Check if offline and use cached data
        const offlineStore = useOfflineStore.getState();
        const isOnline = offlineStore.isOnline;

        if (!isOnline) {
          console.log('Device is offline, using cached stores');
          const cachedStores = offlineStore.getCachedStores();
          if (cachedStores.length > 0) {
            set({ availableStores: cachedStores });
            console.log('Loaded', cachedStores.length, 'stores from cache');
          }
          return;
        }

        try {
          console.log('Loading all available stores...');
          const response = await API.storesAPI.getAllStores();

          console.log('All stores API response:', response);
          if (response.success) {
            const stores = response.data.stores;
            set({ availableStores: stores });
            
            // Cache the stores for offline use
            offlineStore.cacheStores(stores);
            
            console.log('Set', stores.length, 'stores as available and cached');
          } else {
            console.error('Failed to get all stores:', response.message);
            
            // Try to use cached data on API failure
            const cachedStores = offlineStore.getCachedStores();
            if (cachedStores.length > 0) {
              set({ availableStores: cachedStores });
              console.log('Using cached stores due to API failure');
            } else {
              set({ availableStores: [] });
            }
          }
        } catch (error) {
          console.error('Error fetching stores:', error);
          
          // Use cached data on network error
          if (error.message && error.message.includes('offline')) {
            console.log('Device is offline, using cached stores');
            const cachedStores = offlineStore.getCachedStores();
            if (cachedStores.length > 0) {
              set({ availableStores: cachedStores });
              console.log('Loaded', cachedStores.length, 'stores from cache');
            }
          } else {
            // Only clear on non-network errors if no cache available
            const cachedStores = offlineStore.getCachedStores();
            if (cachedStores.length > 0) {
              set({ availableStores: cachedStores });
              console.log('Using cached stores due to error');
            } else {
              set({ availableStores: [] });
            }
          }
        }
      },

      getCurrentLocation: async () => {
        set({ loading: true, error: null });

        try {
          const hasPermission = await get().requestLocationPermission();
          if (!hasPermission) {
            throw new Error('لا يوجد إذن للوصول للموقع');
          }

          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          const newLocation = {
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          };

          set({
            userLocation: newLocation,
            gpsEnabled: true,
            loading: false,
          });

          return newLocation;
        } catch (error) {
          set({ error: 'خطأ في الحصول على الموقع', gpsEnabled: false, loading: false });
          Alert.alert('خطأ', 'فشل في الحصول على موقعك الحالي');
          return null;
        }
      },

      clearLocation: () => {
        set({
          userLocation: null,
          availableStores: [],
          gpsEnabled: false,
          error: null,
        });
      },

      updateDeliveryRadius: (newRadius) => {
        set({ deliveryRadius: newRadius });
      },

      setLocation: (location) => {
        set({
          userLocation: location,
          gpsEnabled: true,
        });
      },

      getLocationString: () => {
        const { userLocation } = get();
        if (userLocation) {
          return `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`;
        }
        return 'لم يتم تحديد الموقع';
      },

      getVillageNameFromCoordinates: async (location) => {
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
      },

      isLocationAvailable: () => {
        const { userLocation } = get();
        return userLocation !== null;
      },
    }),
    {
      name: 'location-storage',
      storage: createJSONStorage(() => AsyncStorage, {
        reviver: (key, value) => value,
        replacer: (key, value) => value,
      }),
      partialize: (state) => ({
        userLocation: state.userLocation,
        deliveryRadius: state.deliveryRadius,
        gpsEnabled: state.gpsEnabled,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.log('Error rehydrating location storage:', error);
        }
      },
    }
  )
);
