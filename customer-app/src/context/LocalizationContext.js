import React, { createContext, useContext, useState, useEffect } from 'react';
import { I18nManager } from 'react-native';
import { 
  ARABIC_TRANSLATIONS, 
  RTL_CONFIG, 
  t as translate,
  formatArabicDate,
  formatEGPCurrency,
  isRTLSupported,
  toggleRTL,
  EGYPT_CONFIG
} from '../utils/arabicLocalization';

// إنشاء سياق التوطين - Create Localization Context
const LocalizationContext = createContext();

// خطاف مخصص لاستخدام سياق التوطين - Custom hook for using Localization Context
export const useLocalization = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('يجب استخدام useLocalization داخل LocalizationProvider'); // useLocalization must be used within a LocalizationProvider
  }
  return context;
};

// مزود سياق التوطين - Localization Context Provider Component
export const LocalizationProvider = ({ children }) => {
  const [language, setLanguage] = useState('ar'); // 'ar' للغة العربية، 'en' للإنجليزية - 'ar' for Arabic, 'en' for English
  const [isRTL, setIsRTL] = useState(true); // هل الاتجاه من اليمين لليسار؟ - Is direction RTL?
  const [isRTLSupportedState, setIsRTLSupportedState] = useState(false); // هل يدعم الجهاز RTL؟ - Is device RTL supported?

  // تهيئة التوطين عند تحميل المكون - Initialize localization on component mount
  useEffect(() => {
    initializeLocalization();
  }, []);

  // دالة تهيئة إعدادات التوطين - Function to initialize localization settings
  const initializeLocalization = async () => {
    try {
      // التحقق مما إذا كان RTL مدعومًا - Check if RTL is supported
      const rtlSupported = isRTLSupported();
      setIsRTLSupportedState(rtlSupported);
      
      if (rtlSupported) {
        // فرض تخطيط RTL للغة العربية - Force RTL layout for Arabic
        I18nManager.forceRTL(true);
        setIsRTL(true);
      }
    } catch (error) {
      console.error('خطأ في تهيئة التوطين:', error); // Error initializing localization
    }
  };

  // دالة تغيير اللغة - Function to change language
  const changeLanguage = (newLanguage) => {
    const languageCode = newLanguage === 'ar' ? 'ar' : 'en';
    setLanguage(languageCode);
    
    const shouldBeRTL = languageCode === 'ar';
    setIsRTL(shouldBeRTL);
    
    // تحديث I18nManager لـ RTL - Update I18nManager for RTL
    if (shouldBeRTL !== I18nManager.isRTL) {
      I18nManager.forceRTL(shouldBeRTL);
    }
  };

  // دالة تبديل اللغة بين العربية والإنجليزية - Function to toggle language between Arabic and English
  const toggleLanguage = () => {
    const newLanguage = language === 'ar' ? 'en' : 'ar';
    changeLanguage(newLanguage);
  };

  // دالة الحصول على النص المترجم - Function to get translated text
  const getText = (key, params = {}) => {
    if (language === 'ar') {
      return translate(key, params);
    }
    // العودة إلى الإنجليزية إذا لزم الأمر (يمكنك إضافة ترجمات إنجليزية) - Fallback to English if needed (you can add English translations)
    return ARABIC_TRANSLATIONS[key] || key;
  };

  // دالة تنسيق التاريخ - Function to format date
  const formatDate = (date, format = 'long') => {
    return formatArabicDate(date, format);
  };

  // دالة تنسيق العملة - Function to format currency
  const formatCurrency = (amount) => {
    return formatEGPCurrency(amount);
  };

  // دالة الحصول على الأنماط الموطنة (RTL/LTR) - Function to get localized styles (RTL/LTR)
  const getLocalizedStyles = (baseStyles = {}) => {
    const rtlStyles = {};
    
    Object.keys(baseStyles).forEach(key => {
      const style = baseStyles[key];
      if (isRTL) {
        // تطبيق تحويلات RTL - Apply RTL transformations
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
  };

  // دالة الحصول على اتجاه النص (rtl/ltr) - Function to get text direction (rtl/ltr)
  const getDirection = () => {
    return isRTL ? 'rtl' : 'ltr';
  };

  // دالة الحصول على محاذاة النص (right/left) - Function to get text alignment (right/left)
  const getTextAlign = () => {
    return isRTL ? 'right' : 'left';
  };

  // القيم التي يوفرها السياق - Values provided by the context
  const value = {
    // الحالة - State
    language,
    isRTL,
    isRTLSupported: isRTLSupportedState,
    
    // الإجراءات - Actions
    changeLanguage,
    toggleLanguage,
    toggleRTL: () => {
      const newRTL = toggleRTL();
      setIsRTL(newRTL);
      return newRTL;
    },
    
    // الأدوات المساعدة - Utilities
    t: getText,
    formatDate,
    formatCurrency,
    getLocalizedStyles,
    getDirection,
    getTextAlign,
    
    // الثوابت - Constants
    config: EGYPT_CONFIG,
    translations: ARABIC_TRANSLATIONS,
  };

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export default LocalizationProvider;