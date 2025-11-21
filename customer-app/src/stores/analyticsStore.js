import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAnalyticsStore = create(
  persist(
    (set, get) => ({
      // الحالة - State
      analyticsData: {
        storeVisits: [],
        productViews: [],
        productPurchases: [],
      },
      isLoading: false,

      // الإجراءات - Actions
      loadAnalyticsData: async () => {
        set({ isLoading: true });
        try {
          const storedData = await AsyncStorage.getItem('analyticsData');
          if (storedData) {
            set({ analyticsData: JSON.parse(storedData) });
          }
        } catch (error) {
          console.error('Error loading analytics data:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      saveAnalyticsData: async (data) => {
        try {
          await AsyncStorage.setItem('analyticsData', JSON.stringify(data));
        } catch (error) {
          console.error('Error saving analytics data:', error);
        }
      },

      logStoreVisit: (storeId) => {
        if (!storeId) return;

        set((prevState) => {
          const event = {
            storeId,
            timestamp: new Date().toISOString(),
            type: 'store_visit',
          };

          const newVisits = [...prevState.analyticsData.storeVisits, event];
          if (newVisits.length > 1000) {
            newVisits.shift(); // Remove oldest
          }

          const newData = {
            ...prevState.analyticsData,
            storeVisits: newVisits,
          };

          get().saveAnalyticsData(newData);
          return { analyticsData: newData };
        });
      },

      logProductView: (productId, storeId) => {
        if (!productId || !storeId) return;

        set((prevState) => {
          const event = {
            productId,
            storeId,
            timestamp: new Date().toISOString(),
            type: 'product_view',
          };

          const newViews = [...prevState.analyticsData.productViews, event];
          if (newViews.length > 1000) {
            newViews.shift();
          }

          const newData = {
            ...prevState.analyticsData,
            productViews: newViews,
          };

          get().saveAnalyticsData(newData);
          return { analyticsData: newData };
        });
      },

      logProductPurchase: (productId, storeId, quantity) => {
        if (!productId || !storeId || !quantity) return;

        set((prevState) => {
          const event = {
            productId,
            storeId,
            quantity,
            timestamp: new Date().toISOString(),
            type: 'product_purchase',
          };

          const newPurchases = [...prevState.analyticsData.productPurchases, event];
          if (newPurchases.length > 1000) {
            newPurchases.shift();
          }

          const newData = {
            ...prevState.analyticsData,
            productPurchases: newPurchases,
          };

          get().saveAnalyticsData(newData);
          return { analyticsData: newData };
        });
      },

      getTopStores: (limit = 10) => {
        const { analyticsData } = get();
        const now = new Date();
        const storeScores = analyticsData.storeVisits.reduce((acc, visit) => {
          const visitDate = new Date(visit.timestamp);
          const daysSince = (now - visitDate) / (1000 * 60 * 60 * 24);
          const weight = 1 / (1 + daysSince * 0.1); // Decay factor
          acc[visit.storeId] = (acc[visit.storeId] || 0) + weight;
          return acc;
        }, {});

        return Object.entries(storeScores)
          .sort(([, a], [, b]) => b - a)
          .slice(0, limit)
          .map(([storeId, score]) => ({ storeId, score: Math.round(score * 100) / 100 }));
      },

      getTopProducts: (limit = 10) => {
        const { analyticsData } = get();
        const now = new Date();
        const productScores = {};

        // Count views with decay
        analyticsData.productViews.forEach((view) => {
          const viewDate = new Date(view.timestamp);
          const daysSince = (now - viewDate) / (1000 * 60 * 60 * 24);
          const weight = 1 / (1 + daysSince * 0.1);
          if (!productScores[view.productId]) {
            productScores[view.productId] = { views: 0, purchases: 0, storeId: view.storeId };
          }
          productScores[view.productId].views += weight;
        });

        // Count purchases with decay
        analyticsData.productPurchases.forEach((purchase) => {
          const purchaseDate = new Date(purchase.timestamp);
          const daysSince = (now - purchaseDate) / (1000 * 60 * 60 * 24);
          const weight = 1 / (1 + daysSince * 0.1);
          if (!productScores[purchase.productId]) {
            productScores[purchase.productId] = {
              views: 0,
              purchases: 0,
              storeId: purchase.storeId,
            };
          }
          productScores[purchase.productId].purchases += purchase.quantity * weight;
        });

        return Object.entries(productScores)
          .map(([productId, scores]) => ({
            productId,
            storeId: scores.storeId,
            views: Math.round(scores.views * 100) / 100,
            purchases: Math.round(scores.purchases * 100) / 100,
            score: Math.round((scores.views * 0.5 + scores.purchases * 2) * 100) / 100,
          }))
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
      },

      clearAnalyticsData: async () => {
        const emptyData = {
          storeVisits: [],
          productViews: [],
          productPurchases: [],
        };

        set({ analyticsData: emptyData });
        await get().saveAnalyticsData(emptyData);
      },

      cleanOldData: () => {
        set((prevState) => {
          const newData = {
            storeVisits: prevState.analyticsData.storeVisits.slice(-1000),
            productViews: prevState.analyticsData.productViews.slice(-1000),
            productPurchases: prevState.analyticsData.productPurchases.slice(-1000),
          };

          get().saveAnalyticsData(newData);
          return { analyticsData: newData };
        });
      },
    }),
    {
      name: 'analytics-storage',
      storage: createJSONStorage(() => AsyncStorage, {
        reviver: (key, value) => value,
        replacer: (key, value) => value,
      }),
      partialize: (state) => ({
        analyticsData: state.analyticsData,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.log('Error rehydrating analytics storage:', error);
        }
      },
    }
  )
);
