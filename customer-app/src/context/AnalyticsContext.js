import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create Analytics Context
const AnalyticsContext = createContext();

// Custom hook for using Analytics Context
export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

// Analytics Context Provider Component
export const AnalyticsProvider = ({ children }) => {
  const [analyticsData, setAnalyticsData] = useState({
    storeVisits: [],
    productViews: [],
    productPurchases: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load analytics data on component mount
  useEffect(() => {
    loadAnalyticsData();
  }, []);

  // Function to load analytics data from local storage
  const loadAnalyticsData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('analyticsData');
      if (storedData) {
        setAnalyticsData(JSON.parse(storedData));
      }
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to save analytics data to local storage
  const saveAnalyticsData = async (data) => {
    try {
      await AsyncStorage.setItem('analyticsData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving analytics data:', error);
    }
  };

  // Function to log store visit
  const logStoreVisit = (storeId) => {
    try {
      if (!storeId) return;
      const event = {
        storeId,
        timestamp: new Date().toISOString(),
        type: 'store_visit',
      };

      setAnalyticsData((prevData) => {
        const newVisits = [...prevData.storeVisits, event];
        if (newVisits.length > 1000) {
          newVisits.shift(); // Remove oldest
        }
        const newData = {
          ...prevData,
          storeVisits: newVisits,
        };
        saveAnalyticsData(newData);
        return newData;
      });
    } catch (error) {
      console.error('Error logging store visit:', error);
    }
  };

  // Function to log product view
  const logProductView = (productId, storeId) => {
    try {
      if (!productId || !storeId) return;
      const event = {
        productId,
        storeId,
        timestamp: new Date().toISOString(),
        type: 'product_view',
      };

      setAnalyticsData((prevData) => {
        const newViews = [...prevData.productViews, event];
        if (newViews.length > 1000) {
          newViews.shift();
        }
        const newData = {
          ...prevData,
          productViews: newViews,
        };
        saveAnalyticsData(newData);
        return newData;
      });
    } catch (error) {
      console.error('Error logging product view:', error);
    }
  };

  // Function to log product purchase
  const logProductPurchase = (productId, storeId, quantity) => {
    try {
      if (!productId || !storeId || !quantity) return;
      const event = {
        productId,
        storeId,
        quantity,
        timestamp: new Date().toISOString(),
        type: 'product_purchase',
      };

      setAnalyticsData((prevData) => {
        const newPurchases = [...prevData.productPurchases, event];
        if (newPurchases.length > 1000) {
          newPurchases.shift();
        }
        const newData = {
          ...prevData,
          productPurchases: newPurchases,
        };
        saveAnalyticsData(newData);
        return newData;
      });
    } catch (error) {
      console.error('Error logging product purchase:', error);
    }
  };

  // Function to get top stores based on visits with time decay
  const getTopStores = (limit = 10) => {
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
  };

  // Function to get top products based on views and purchases with time decay
  const getTopProducts = (limit = 10) => {
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
        productScores[purchase.productId] = { views: 0, purchases: 0, storeId: purchase.storeId };
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
  };

  // Function to clear analytics data (for privacy/reset)
  const clearAnalyticsData = async () => {
    const emptyData = {
      storeVisits: [],
      productViews: [],
      productPurchases: [],
    };
    setAnalyticsData(emptyData);
    await saveAnalyticsData(emptyData);
  };

  // Function to clean old data for scalability (keep last 1000 events per type)
  const cleanOldData = () => {
    setAnalyticsData((prevData) => {
      const newData = {
        storeVisits: prevData.storeVisits.slice(-1000),
        productViews: prevData.productViews.slice(-1000),
        productPurchases: prevData.productPurchases.slice(-1000),
      };
      saveAnalyticsData(newData);
      return newData;
    });
  };

  // Values provided by the context
  const value = {
    analyticsData,
    isLoading,
    logStoreVisit,
    logProductView,
    logProductPurchase,
    getTopStores,
    getTopProducts,
    clearAnalyticsData,
  };

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>;
};