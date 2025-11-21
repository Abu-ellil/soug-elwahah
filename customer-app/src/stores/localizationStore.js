import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import {
  ARABIC_TRANSLATIONS,
  RTL_CONFIG,
  t as translate,
  formatArabicDate,
  formatEGPCurrency,
  isRTLSupported,
  toggleRTL,
  EGYPT_CONFIG,
} from '../utils/arabicLocalization';

export const useLocalizationStore = create(
  persist(
    (set, get) => ({
      // الحالة - State
      language: 'ar', // 'ar' للغة العربية، 'en' للإنجليزية
      isRTL: true, // هل الاتجاه من اليمين لليسار؟
      isRTLSupported: false, // هل يدعم الجهاز RTL؟

      // الإجراءات - Actions
      initializeLocalization: async () => {
        try {
          // التحقق مما إذا كان RTL مدعومًا
          const rtlSupported = isRTLSupported();
          set({ isRTLSupported: rtlSupported });

          if (rtlSupported) {
            // فرض تخطيط RTL للغة العربية
            I18nManager.forceRTL(true);
            set({ isRTL: true });
          }
        } catch (error) {
          console.error('خطأ في تهيئة التوطين:', error);
        }
      },

      changeLanguage: (newLanguage) => {
        const languageCode = newLanguage === 'ar' ? 'ar' : 'en';
        set({ language: languageCode });

        const shouldBeRTL = languageCode === 'ar';
        set({ isRTL: shouldBeRTL });

        // تحديث I18nManager لـ RTL
        if (shouldBeRTL !== I18nManager.isRTL) {
          I18nManager.forceRTL(shouldBeRTL);
        }
      },

      toggleLanguage: () => {
        const newLanguage = get().language === 'ar' ? 'en' : 'ar';
        get().changeLanguage(newLanguage);
      },

      getText: (key, params = {}) => {
        const { language } = get();
        if (language === 'ar') {
          return translate(key, params);
        }
        // العودة إلى الإنجليزية إذا لزم الأمر
        return ARABIC_TRANSLATIONS[key] || key;
      },

      formatDate: (date, format = 'long') => {
        return formatArabicDate(date, format);
      },

      formatCurrency: (amount) => {
        return formatEGPCurrency(amount);
      },

      getLocalizedStyles: (baseStyles = {}) => {
        const { isRTL } = get();
        const rtlStyles = {};

        Object.keys(baseStyles).forEach((key) => {
          const style = baseStyles[key];
          if (isRTL) {
            // تطبيق تحويلات RTL
            if (style.flexDirection === 'row') {
              rtlStyles[key] = { ...style, flexDirection: 'row-reverse' };
            } else if (style.textAlign === 'left') {
              rtlStyles[key] = { ...style, textAlign: 'right' };
            } else if (style.textAlign === 'right') {
              rtlStyles[key] = { ...style, textAlign: 'left' };
            } else {
              rtlStyles[key] = style;
            }
          } else {
            rtlStyles[key] = style;
          }
        });

        return rtlStyles;
      },

      getDirection: () => {
        return get().isRTL ? 'rtl' : 'ltr';
      },

      getTextAlign: () => {
        return get().isRTL ? 'right' : 'left';
      },

      toggleRTL: () => {
        const newRTL = toggleRTL();
        set({ isRTL: newRTL });
        return newRTL;
      },

      // الثوابت - Constants
      getConfig: () => EGYPT_CONFIG,
      getTranslations: () => ARABIC_TRANSLATIONS,
    }),
    {
      name: 'localization-storage',
      storage: createJSONStorage(() => AsyncStorage, {
        reviver: (key, value) => value,
        replacer: (key, value) => value,
      }),
      partialize: (state) => ({
        language: state.language,
        isRTL: state.isRTL,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.log('Error rehydrating localization storage:', error);
        }
      },
    }
  )
);
