import React, { createContext, useContext, useEffect } from 'react';
import { useLocalizationStore } from '../stores/localizationStore';

const LocalizationContext = createContext();

export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};

export const LocalizationProvider = ({ children }) => {
  const localizationStore = useLocalizationStore();

  useEffect(() => {
    // Initialize localization when the app starts
    localizationStore.initializeLocalization();
  }, []);

  const value = {
    language: localizationStore.language,
    isRTL: localizationStore.isRTL,
    isRTLSupported: localizationStore.isRTLSupported,
    changeLanguage: localizationStore.changeLanguage,
    toggleLanguage: localizationStore.toggleLanguage,
    getText: localizationStore.getText,
    formatDate: localizationStore.formatDate,
    formatCurrency: localizationStore.formatCurrency,
    getLocalizedStyles: localizationStore.getLocalizedStyles,
    getDirection: localizationStore.getDirection,
    getTextAlign: localizationStore.getTextAlign,
    toggleRTL: localizationStore.toggleRTL,
    getConfig: localizationStore.getConfig,
    getTranslations: localizationStore.getTranslations,
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};