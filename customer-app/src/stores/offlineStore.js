import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { networkManager } from '../utils/network';

export const useOfflineStore = create(
  persist(
    (set, get) => ({
      // State
      isOnline: true,
      cachedStores: [],
      cachedCategories: [],
      cachedProducts: {},
      lastSync: null,
      pendingRequests: [],

      // Actions
      initialize: async () => {
        try {
          // Initialize network monitoring
          await networkManager.initialize();
          const isOnline = networkManager.isInternetReachable();
          set({ isOnline });

          // Listen for network changes
          networkManager.addListener((connected) => {
            console.log('Network status changed:', connected ? 'Online' : 'Offline');
            set({ isOnline: connected });

            // If back online, sync pending requests
            if (connected) {
              get().syncPendingRequests();
            }
          });
        } catch (error) {
          console.error('Error initializing offline store:', error);
          // Set a default state if initialization fails
          set({ isOnline: true });
        }
      },

      setOnlineStatus: (status) => {
        set({ isOnline: status });
      },

      // Cache stores data
      cacheStores: (stores) => {
        set({
          cachedStores: stores,
          lastSync: new Date().toISOString(),
        });
      },

      // Get cached stores
      getCachedStores: () => {
        return get().cachedStores;
      },

      // Cache categories data
      cacheCategories: (categories) => {
        set({
          cachedCategories: categories,
          lastSync: new Date().toISOString(),
        });
      },

      // Get cached categories
      getCachedCategories: () => {
        return get().cachedCategories;
      },

      // Cache products for a store
      cacheStoreProducts: (storeId, products) => {
        set((state) => ({
          cachedProducts: {
            ...state.cachedProducts,
            [storeId]: {
              products,
              timestamp: new Date().toISOString(),
            },
          },
          lastSync: new Date().toISOString(),
        }));
      },

      // Get cached products for a store
      getCachedStoreProducts: (storeId) => {
        const cached = get().cachedProducts[storeId];
        if (!cached) return null;

        // Check if cache is still valid (less than 1 hour old)
        const cacheAge = Date.now() - new Date(cached.timestamp).getTime();
        const oneHour = 60 * 60 * 1000;

        if (cacheAge > oneHour) {
          console.log('Cache expired for store:', storeId);
          return null;
        }

        return cached.products;
      },

      // Add pending request (for offline mode)
      addPendingRequest: (request) => {
        set((state) => ({
          pendingRequests: [...state.pendingRequests, request],
        }));
      },

      // Remove pending request
      removePendingRequest: (requestId) => {
        set((state) => ({
          pendingRequests: state.pendingRequests.filter((req) => req.id !== requestId),
        }));
      },

      // Sync pending requests when back online
      syncPendingRequests: async () => {
        const { pendingRequests, isOnline } = get();

        if (!isOnline || pendingRequests.length === 0) {
          return;
        }

        console.log('Syncing', pendingRequests.length, 'pending requests...');

        for (const request of pendingRequests) {
          try {
            // Execute the pending request
            await request.execute();
            get().removePendingRequest(request.id);
            console.log('Synced request:', request.id);
          } catch (error) {
            console.error('Failed to sync request:', request.id, error);
          }
        }
      },

      // Clear all cached data
      clearCache: () => {
        set({
          cachedStores: [],
          cachedCategories: [],
          cachedProducts: {},
          lastSync: null,
          pendingRequests: [],
        });
      },

      // Check if cache is fresh (less than 5 minutes old)
      isCacheFresh: () => {
        const { lastSync } = get();
        if (!lastSync) return false;

        const cacheAge = Date.now() - new Date(lastSync).getTime();
        const fiveMinutes = 5 * 60 * 1000;

        return cacheAge < fiveMinutes;
      },

      // Get cache age in minutes
      getCacheAge: () => {
        const { lastSync } = get();
        if (!lastSync) return null;

        const cacheAge = Date.now() - new Date(lastSync).getTime();
        return Math.floor(cacheAge / (60 * 1000));
      },
    }),
    {
      name: 'offline-storage',
      storage: createJSONStorage(() => AsyncStorage, {
        reviver: (key, value) => value,
        replacer: (key, value) => value,
      }),
      partialize: (state) => ({
        cachedStores: state.cachedStores,
        cachedCategories: state.cachedCategories,
        cachedProducts: state.cachedProducts,
        lastSync: state.lastSync,
        pendingRequests: state.pendingRequests,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.log('Error rehydrating offline storage:', error);
        } else if (state) {
          console.log('Offline cache rehydrated:', {
            stores: state.cachedStores.length,
            categories: state.cachedCategories.length,
            products: Object.keys(state.cachedProducts).length,
            lastSync: state.lastSync,
          });
        }
      },
    }
  )
);
