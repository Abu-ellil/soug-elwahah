// Arabic localization utilities for Egyptian delivery app

import { I18nManager } from 'react-native';

// Arabic translations
export const ARABIC_TRANSLATIONS = {
  // Navigation & Common
  'app.title': 'تطبيق التوصيل للقرى المصرية',
  'navigation.home': 'الرئيسية',
  'navigation.cart': 'السلة',
  'navigation.orders': 'طلباتي',
  'navigation.profile': 'الملف الشخصي',

  // Location & Villages
  'location.select': 'اختر المنطقة',
  'location.myLocation': 'موقعي الحالي',
  'location.search': 'ابحث عن منطقة...',
  'location.delivery': 'التوصيل إلى',
  'location.available': 'متاح للتوصيل',
  'location.unavailable': 'غير متاح',

  // Stores & Categories
  'stores.title': 'المتاجر المتاحة',
  'stores.nearby': 'المتاجر القريبة',
  'stores.search': 'البحث في المحلات والمنتجات...',
  'stores.open': 'مفتوح',
  'stores.closed': 'مغلق',
  'stores.rating': 'التقييم',
  'stores.deliveryTime': 'وقت التوصيل',

  'categories.title': 'الفئات',
  'categories.all': 'الكل',

  // Products
  'products.title': 'المنتجات',
  'products.addToCart': 'أضف للسلة',
  'products.outOfStock': 'غير متوفر',
  'products.available': 'متوفر',

  // Cart
  'cart.title': 'سلة التسوق',
  'cart.empty': 'السلة فارغة',
  'cart.addItems': 'أضف منتجات إلى السلة لبدء التسوق',
  'cart.shopNow': 'تسوق الآن',
  'cart.clear': 'تفريغ السلة',
  'cart.subtotal': 'المجموع الفرعي',
  'cart.deliveryFee': 'رسوم التوصيل',
  'cart.total': 'المجموع الكلي',
  'cart.proceedCheckout': 'إتمام الطلب',

  // Checkout
  'checkout.title': 'إتمام الطلب',
  'checkout.customerInfo': 'معلومات العميل',
  'checkout.name': 'الاسم',
  'checkout.phone': 'رقم الهاتف',
  'checkout.address': 'عنوان التوصيل',
  'checkout.notes': 'ملاحظات إضافية',
  'checkout.deliveryTime': 'وقت التوصيل المفضل',
  'checkout.paymentMethod': 'طريقة الدفع',
  'checkout.confirmOrder': 'تأكيد الطلب',

  // Payment Methods
  'payment.cash': 'الدفع عند الاستلام',
  'payment.fawry': 'فوري',
  'payment.vodafoneCash': 'فودافون كاش',
  'payment.orangeMoney': 'أورانج ماني',
  'payment.aman': 'أمان',
  'payment.masary': 'مصاري',

  // Orders
  'orders.title': 'طلباتي',
  'orders.all': 'الكل',
  'orders.current': 'حالية',
  'orders.completed': 'منتهية',
  'orders.status.pending': 'في الانتظار',
  'orders.status.confirmed': 'مؤكد',
  'orders.status.delivering': 'قيد التوصيل',
  'orders.status.delivered': 'تم التوصيل',
  'orders.status.cancelled': 'ملغي',
  'orders.items': 'منتج',
  'orders.items_plural': 'منتجات',

  // Delivery Slots
  'delivery.morning': 'الصباح (9:00 - 12:00)',
  'delivery.noon': 'الظهيرة (12:00 - 15:00)',
  'delivery.evening': 'المساء (15:00 - 18:00)',
  'delivery.night': 'الليل (18:00 - 21:00)',

  // Messages
  'message.success': 'تم بنجاح',
  'message.error': 'حدث خطأ',
  'message.loading': 'جاري التحميل...',
  'message.retry': 'إعادة المحاولة',
  'message.cancel': 'إلغاء',
  'message.confirm': 'تأكيد',
  'message.save': 'حفظ',
  'message.edit': 'تعديل',
  'message.delete': 'حذف',

  // Time & Numbers
  'time.today': 'اليوم',
  'time.yesterday': 'أمس',
  'time.tomorrow': 'غداً',
  'time.minute': 'دقيقة',
  'time.minute_plural': 'دقائق',
  'time.hour': 'ساعة',
  'time.hour_plural': 'ساعات',
  'time.day': 'يوم',
  'time.day_plural': 'أيام',

  // Currency
  'currency.egp': 'جنيه مصري',
  'currency.symbol': 'ج.م',
};

// RTL Layout Configuration
export const RTL_CONFIG = {
  isRTL: true,
  textAlign: 'right',
  writingDirection: 'rtl',

  // Icon mappings for RTL
  iconMapping: {
    'chevron-left': 'chevron-right',
    'chevron-right': 'chevron-left',
    'arrow-back': 'arrow-forward',
    'arrow-forward': 'arrow-back',
    'navigate-before': 'navigate-next',
    'navigate-next': 'navigate-before',
  },

  // Layout configurations
  styles: {
    container: {
      direction: 'rtl',
    },
    text: {
      textAlign: 'right',
      writingDirection: 'rtl',
    },
    button: {
      flexDirection: 'row-reverse',
    },
  },
};

// Date formatting for Arabic/Egyptian locale
export const formatArabicDate = (date, format = 'long') => {
  const dateObj = new Date(date);

  const options = {
    long: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      locale: 'ar-EG',
    },
    short: {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      locale: 'ar-EG',
    },
    time: {
      hour: '2-digit',
      minute: '2-digit',
      locale: 'ar-EG',
    },
    datetime: {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      locale: 'ar-EG',
    },
  };

  return dateObj.toLocaleDateString('ar-EG', options[format] || options.long);
};

// Arabic number formatting
export const formatArabicNumber = (number) => {
  return number.toLocaleString('ar-EG');
};

// Currency formatting for Egyptian Pounds
export const formatEGPCurrency = (amount) => {
  const formatted = formatArabicNumber(amount.toFixed(2));
  return `${formatted} ${ARABIC_TRANSLATIONS['currency.symbol']}`;
};

// Time ago formatting in Arabic
export const formatTimeAgo = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) {
    return 'الآن';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `منذ ${diffInMinutes} ${diffInMinutes === 1 ? 'دقيقة' : 'دقائق'}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `منذ ${diffInHours} ${diffInHours === 1 ? 'ساعة' : 'ساعات'}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `منذ ${diffInDays} ${diffInDays === 1 ? 'يوم' : 'أيام'}`;
  }

  return formatArabicDate(date, 'short');
};

// Phone number formatting for Egyptian numbers
export const formatEgyptianPhone = (phone) => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');

  // Handle Egyptian phone numbers
  if (cleaned.startsWith('20')) {
    // International format +20xxxxxxxxx
    const number = cleaned.substring(2);
    if (number.length === 10) {
      return `+20 ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    }
  } else if (cleaned.startsWith('0')) {
    // Local format 01xxxxxxxxx
    if (cleaned.length === 11) {
      return `${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
    }
  }

  return phone; // Return original if can't format
};

// Validate Egyptian phone number
export const validateEgyptianPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');

  // Egyptian mobile numbers start with 01 and have 11 digits
  // Egyptian landline numbers have varying lengths

  // Mobile pattern: 01[0-9]{9}
  const mobilePattern = /^01[0-9]{9}$/;

  // Landline pattern: 0[1-3][0-9]{8}$ for Cairo and Alexandria
  const landlinePattern = /^0[1-3][0-9]{8}$/;

  return mobilePattern.test(cleaned) || landlinePattern.test(cleaned);
};

// Get localized text
export const t = (key, params = {}) => {
  let translation = ARABIC_TRANSLATIONS[key] || key;

  // Replace parameters in translation
  Object.keys(params).forEach((param) => {
    translation = translation.replace(`{${param}}`, params[param]);
  });

  return translation;
};

// Check if device supports RTL
export const isRTLSupported = () => {
  return I18nManager.isRTL;
};

// Toggle RTL layout (useful for testing)
export const toggleRTL = () => {
  const newRTL = !I18nManager.isRTL;
  I18nManager.forceRTL(newRTL);

  // Restart the app in development mode to apply changes
  // In production, this would require app restart

  return newRTL;
};

// Get plural form based on Arabic grammar rules
export const getPluralForm = (count, singular, plural, dual = null) => {
  if (count === 0) {
    return plural;
  }

  if (count === 1) {
    return singular;
  }

  if (count === 2) {
    return dual || plural;
  }

  if (count >= 3 && count <= 10) {
    return plural;
  }

  return singular;
};

// Egyptian calendar helpers (optional - for Islamic calendar integration)
export const formatIslamicDate = (date) => {
  // This would integrate with a Hijri date library
  // For now, return the Gregorian date in Arabic format
  return formatArabicDate(date);
};

// Configuration for Egyptian-specific settings
export const EGYPT_CONFIG = {
  currency: {
    code: 'EGP',
    symbol: 'ج.م',
    name: 'الجنيه المصري',
    decimals: 2,
  },

  phone: {
    countryCode: '+20',
    defaultRegion: 'EG',
    maxLength: 11,
  },

  address: {
    postalCodeRequired: false,
    provinces: [
      'القاهرة',
      'الإسكندرية',
      'الجيزة',
      'الشرقية',
      'الدقهلية',
      'البحيرة',
      'الفيوم',
      'المنوفية',
      'كفر الشيخ',
      'الغربية',
      'دمياط',
      'الوادي الجديد',
      'البحر الأحمر',
      'شمال سيناء',
      'جنوب سيناء',
      'السويس',
      'بورسعيد',
      'الإسماعيلية',
      'الأقصر',
      'أسوان',
      'سوهاج',
      'المنيا',
      'أسيوط',
      'الوادي الجديد',
      'الفيوم',
      'بني سويف',
      'قنا',
      'الأقصر',
    ],
  },

  delivery: {
    workingHours: {
      start: '09:00',
      end: '21:00',
    },
    estimatedDeliveryTime: '30-45 دقيقة',
    freeDeliveryThreshold: 200, // EGP
  },
};
