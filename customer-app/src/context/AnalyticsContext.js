import React, { createContext, useContext, useEffect } from 'react';
import { useAnalyticsStore } from '../stores/analyticsStore';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const analyticsStore = useAnalyticsStore();

  useEffect(() => {
    // Load analytics data when the app starts
    analyticsStore.loadAnalyticsData();
  }, []);

  const value = {
    analyticsData: analyticsStore.analyticsData,
    isLoading: analyticsStore.isLoading,
    logStoreVisit: analyticsStore.logStoreVisit,
    logProductView: analyticsStore.logProductView,
    logProductPurchase: analyticsStore.logProductPurchase,
    getTopStores: analyticsStore.getTopStores,
    getTopProducts: analyticsStore.getTopProducts,
    clearAnalyticsData: analyticsStore.clearAnalyticsData,
    cleanOldData: analyticsStore.cleanOldData,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};