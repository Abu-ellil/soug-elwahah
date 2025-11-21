import React, { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useLocationStore } from '../stores/locationStore';
import { useLocalizationStore } from '../stores/localizationStore';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { useCartStore } from '../stores/cartStore';

const AppInitializer = ({ children }) => {
  // تهيئة الـ stores عند بدء التطبيق
  const { loadUser } = useAuthStore();
  const { initializeLocation } = useLocationStore();
  const { initializeLocalization } = useLocalizationStore();
  const { loadAnalyticsData } = useAnalyticsStore();
  const { loadCart } = useCartStore();

  useEffect(() => {
    const initializeApp = async () => {
      // تحميل البيانات المحفوظة
      await loadUser();
      await loadCart();
      await loadAnalyticsData();

      // تهيئة الإعدادات
      await initializeLocalization();
      await initializeLocation();
    };

    initializeApp();
  }, [loadUser, loadCart, loadAnalyticsData, initializeLocalization, initializeLocation]);

  return <>{children}</>;
};

export default AppInitializer;
