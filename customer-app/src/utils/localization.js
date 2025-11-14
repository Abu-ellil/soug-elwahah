// نظام الترجمة والدعم العربي - Arabic Localization System
// ======================================================

export const SUPPORTED_LANGUAGES = {
  ARABIC: 'ar',
  ENGLISH: 'en',
};

export const RTL_LANGUAGES = ['ar', 'fa', 'he', 'ur'];

// النصوص العربية - Arabic Translations
export const ARABIC_TRANSLATIONS = {
  // الملاحة والقوائم - Navigation & Menus
  navigation: {
    dashboard: 'لوحة التحكم',
    customers: 'العملاء',
    reports: 'التقارير',
    settings: 'الإعدادات',
    profile: 'الملف الشخصي',
    logout: 'تسجيل الخروج',
  },

  // العملاء - Customers
  customers: {
    title: 'إدارة العملاء',
    addCustomer: 'إضافة عميل جديد',
    editCustomer: 'تعديل بيانات العميل',
    deleteCustomer: 'حذف العميل',
    customerDetails: 'تفاصيل العميل',
    searchCustomers: 'البحث عن عملاء',
    filterBy: 'تصفية حسب',
    sortBy: 'ترتيب حسب',

    // أعمدة الجدول - Table Columns
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    type: 'نوع العميل',
    tier: 'مستوى الولاء',
    status: 'الحالة',
    totalSpent: 'إجمالي المصروفات',
    lastActivity: 'آخر نشاط',
    actions: 'الإجراءات',

    // أنواع العملاء - Customer Types
    individual: 'فردي',
    business: 'تجاري',
    vip: 'VIP',

    // مستويات الولاء - Loyalty Tiers
    bronze: 'برونزي',
    silver: 'فضي',
    gold: 'ذهبي',
    platinum: 'بلاتيني',

    // حالات العميل - Customer Status
    active: 'نشط',
    inactive: 'غير نشط',
    blocked: 'محظور',
    pending: 'في الانتظار',
  },

  // لوحة التحكم - Dashboard
  dashboard: {
    title: 'لوحة التحكم',
    welcome: 'مرحباً بك',
    totalCustomers: 'إجمالي العملاء',
    activeCustomers: 'العملاء النشطون',
    monthlyRevenue: 'الإيرادات الشهرية',
    newCustomers: 'عملاء جدد',
    customerGrowth: 'نمو العملاء',

    // إحصائيات سريعة - Quick Stats
    stats: {
      today: 'اليوم',
      thisWeek: 'هذا الأسبوع',
      thisMonth: 'هذا الشهر',
      thisYear: 'هذا العام',
    },

    // رسوم بيانية - Charts
    charts: {
      customerGrowth: 'نمو العملاء',
      revenueTrends: 'اتجاهات الإيرادات',
      topCustomers: 'أفضل العملاء',
      customerStatus: 'حالات العملاء',
    },
  },

  // النماذج - Forms
  forms: {
    // حقول الإدخال - Input Fields
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    alternativePhone: 'رقم الهاتف البديل',
    dateOfBirth: 'تاريخ الميلاد',
    gender: 'الجنس',
    nationality: 'الجنسية',

    // العنوان - Address
    address: {
      street: 'الشارع',
      city: 'المدينة',
      state: 'المحافظة',
      postalCode: 'الرمز البريدي',
      country: 'البلد',
    },

    // التفضيلات - Preferences
    preferences: {
      language: 'اللغة المفضلة',
      timezone: 'المنطقة الزمنية',
      communicationMethod: 'طريقة التواصل',
      notifications: 'الإشعارات',
    },

    // الأزرار - Buttons
    buttons: {
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      add: 'إضافة',
      search: 'بحث',
      filter: 'تصفية',
      export: 'تصدير',
      import: 'استيراد',
      submit: 'إرسال',
      reset: 'إعادة تعيين',
    },

    // التحقق من صحة البيانات - Validation
    validation: {
      required: 'هذا الحقل مطلوب',
      invalidEmail: 'البريد الإلكتروني غير صحيح',
      invalidPhone: 'رقم الهاتف غير صحيح',
      minLength: 'الحد الأدنى للأحرف',
      maxLength: 'الحد الأقصى للأحرف',
    },
  },

  // الرسائل - Messages
  messages: {
    success: {
      customerAdded: 'تم إضافة العميل بنجاح',
      customerUpdated: 'تم تحديث بيانات العميل بنجاح',
      customerDeleted: 'تم حذف العميل بنجاح',
      dataExported: 'تم تصدير البيانات بنجاح',
      dataImported: 'تم استيراد البيانات بنجاح',
    },

    error: {
      genericError: 'حدث خطأ غير متوقع',
      networkError: 'خطأ في الاتصال بالشبكة',
      validationError: 'خطأ في التحقق من صحة البيانات',
      unauthorizedError: 'غير مخول للدخول',
      notFoundError: 'البيانات غير موجودة',
    },

    confirm: {
      deleteCustomer: 'هل أنت متأكد من حذف هذا العميل؟',
      clearData: 'هل أنت متأكد من مسح جميع البيانات؟',
      logout: 'هل تريد تسجيل الخروج؟',
    },
  },

  // الإعدادات - Settings
  settings: {
    title: 'الإعدادات',
    generalTab: 'عام',
    securityTab: 'الأمان',
    notifications: 'الإشعارات',
    backup: 'النسخ الاحتياطي',
    about: 'حول التطبيق',

    // إعدادات عامة - General Settings
    general: {
      language: 'اللغة',
      theme: 'المظهر',
      currency: 'العملة',
      dateFormat: 'تنسيق التاريخ',
    },

    // إعدادات الأمان - Security Settings
    security: {
      changePassword: 'تغيير كلمة المرور',
      twoFactorAuth: 'المصادقة الثنائية',
      biometricLogin: 'تسجيل الدخول البيومتري',
      sessionTimeout: 'مهلة انتهاء الجلسة',
    },
  },

  // التقارير - Reports
  reports: {
    title: 'التقارير',
    customerReport: 'تقرير العملاء',
    salesReport: 'تقرير المبيعات',
    performanceReport: 'تقرير الأداء',

    // فترات زمنية - Date Ranges
    dateRanges: {
      today: 'اليوم',
      yesterday: 'أمس',
      last7Days: 'آخر 7 أيام',
      last30Days: 'آخر 30 يوم',
      last3Months: 'آخر 3 أشهر',
      last6Months: 'آخر 6 أشهر',
      lastYear: 'العام الماضي',
      custom: 'فترة مخصصة',
    },
  },

  // التواريخ والأوقات - Dates & Times
  dateTime: {
    today: 'اليوم',
    yesterday: 'أمس',
    tomorrow: 'غداً',

    days: {
      sunday: 'الأحد',
      monday: 'الاثنين',
      tuesday: 'الثلاثاء',
      wednesday: 'الأربعاء',
      thursday: 'الخميس',
      friday: 'الجمعة',
      saturday: 'السبت',
    },

    months: {
      january: 'يناير',
      february: 'فبراير',
      march: 'مارس',
      april: 'أبريل',
      may: 'مايو',
      june: 'يونيو',
      july: 'يوليو',
      august: 'أغسطس',
      september: 'سبتمبر',
      october: 'أكتوبر',
      november: 'نوفمبر',
      december: 'ديسمبر',
    },
  },

  // العملات والأرقام - Currency & Numbers
  currency: {
    egyptianPound: 'جنيه مصري',
    usDollar: 'دولار أمريكي',
    euro: 'يورو',
    saudiRiyal: 'ريال سعودي',
  },

  // حالات التحميل - Loading States
  loading: {
    loading: 'جاري التحميل...',
    saving: 'جاري الحفظ...',
    deleting: 'جاري الحذف...',
    exporting: 'جاري التصدير...',
    importing: 'جاري الاستيراد...',
  },

  // الحالات الفارغة - Empty States
  empty: {
    noCustomers: 'لا توجد عملاء',
    noData: 'لا توجد بيانات',
    noResults: 'لا توجد نتائج',
    searchToStart: 'ابحث لبدء النتائج',
  },
};

// النصوص الإنجليزية - English Translations
export const ENGLISH_TRANSLATIONS = {
  navigation: {
    dashboard: 'Dashboard',
    customers: 'Customers',
    reports: 'Reports',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Logout',
  },

  customers: {
    title: 'Customer Management',
    addCustomer: 'Add New Customer',
    editCustomer: 'Edit Customer',
    deleteCustomer: 'Delete Customer',
    customerDetails: 'Customer Details',
    searchCustomers: 'Search Customers',
    filterBy: 'Filter by',
    sortBy: 'Sort by',

    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    type: 'Type',
    tier: 'Tier',
    status: 'Status',
    totalSpent: 'Total Spent',
    lastActivity: 'Last Activity',
    actions: 'Actions',

    individual: 'Individual',
    business: 'Business',
    vip: 'VIP',

    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold',
    platinum: 'Platinum',

    active: 'Active',
    inactive: 'Inactive',
    blocked: 'Blocked',
    pending: 'Pending',
  },

  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome',
    totalCustomers: 'Total Customers',
    activeCustomers: 'Active Customers',
    monthlyRevenue: 'Monthly Revenue',
    newCustomers: 'New Customers',
    customerGrowth: 'Customer Growth',

    stats: {
      today: 'Today',
      thisWeek: 'This Week',
      thisMonth: 'This Month',
      thisYear: 'This Year',
    },

    charts: {
      customerGrowth: 'Customer Growth',
      revenueTrends: 'Revenue Trends',
      topCustomers: 'Top Customers',
      customerStatus: 'Customer Status',
    },
  },

  forms: {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email',
    phone: 'Phone',
    alternativePhone: 'Alternative Phone',
    dateOfBirth: 'Date of Birth',
    gender: 'Gender',
    nationality: 'Nationality',

    address: {
      street: 'Street',
      city: 'City',
      state: 'State',
      postalCode: 'Postal Code',
      country: 'Country',
    },

    preferences: {
      language: 'Preferred Language',
      timezone: 'Timezone',
      communicationMethod: 'Communication Method',
      notifications: 'Notifications',
    },

    buttons: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      submit: 'Submit',
      reset: 'Reset',
    },

    validation: {
      required: 'This field is required',
      invalidEmail: 'Invalid email format',
      invalidPhone: 'Invalid phone number',
      minLength: 'Minimum length',
      maxLength: 'Maximum length',
    },
  },

  messages: {
    success: {
      customerAdded: 'Customer added successfully',
      customerUpdated: 'Customer updated successfully',
      customerDeleted: 'Customer deleted successfully',
      dataExported: 'Data exported successfully',
      dataImported: 'Data imported successfully',
    },

    error: {
      genericError: 'An unexpected error occurred',
      networkError: 'Network connection error',
      validationError: 'Validation error',
      unauthorizedError: 'Unauthorized access',
      notFoundError: 'Data not found',
    },

    confirm: {
      deleteCustomer: 'Are you sure you want to delete this customer?',
      clearData: 'Are you sure you want to clear all data?',
      logout: 'Do you want to logout?',
    },
  },

  settings: {
    title: 'Settings',
    generalTab: 'General',
    securityTab: 'Security',
    notifications: 'Notifications',
    backup: 'Backup',
    about: 'About App',

    general: {
      language: 'Language',
      theme: 'Theme',
      currency: 'Currency',
      dateFormat: 'Date Format',
    },

    security: {
      changePassword: 'Change Password',
      twoFactorAuth: 'Two Factor Authentication',
      biometricLogin: 'Biometric Login',
      sessionTimeout: 'Session Timeout',
    },
  },

  reports: {
    title: 'Reports',
    customerReport: 'Customer Report',
    salesReport: 'Sales Report',
    performanceReport: 'Performance Report',

    dateRanges: {
      today: 'Today',
      yesterday: 'Yesterday',
      last7Days: 'Last 7 Days',
      last30Days: 'Last 30 Days',
      last3Months: 'Last 3 Months',
      last6Months: 'Last 6 Months',
      lastYear: 'Last Year',
      custom: 'Custom Range',
    },
  },

  dateTime: {
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',

    days: {
      sunday: 'Sunday',
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
    },

    months: {
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December',
    },
  },

  currency: {
    egyptianPound: 'Egyptian Pound',
    usDollar: 'US Dollar',
    euro: 'Euro',
    saudiRiyal: 'Saudi Riyal',
  },

  loading: {
    loading: 'Loading...',
    saving: 'Saving...',
    deleting: 'Deleting...',
    exporting: 'Exporting...',
    importing: 'Importing...',
  },

  empty: {
    noCustomers: 'No customers',
    noData: 'No data',
    noResults: 'No results',
    searchToStart: 'Search to start seeing results',
  },
};

// Translation Storage and Management
class TranslationManager {
  constructor() {
    this.currentLanguage = SUPPORTED_LANGUAGES.ARABIC;
    this.translations = {
      [SUPPORTED_LANGUAGES.ARABIC]: ARABIC_TRANSLATIONS,
      [SUPPORTED_LANGUAGES.ENGLISH]: ENGLISH_TRANSLATIONS,
    };
  }

  // Set current language
  setLanguage(language) {
    if (this.translations[language]) {
      this.currentLanguage = language;
      // Update app locale
      this.updateAppLocale(language);
    }
  }

  // Get translation by key path
  t(keyPath, fallback = '') {
    const keys = keyPath.split('.');
    let current = this.translations[this.currentLanguage];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return fallback || keyPath;
      }
    }

    return current;
  }

  // Check if current language is RTL
  isRTL() {
    return RTL_LANGUAGES.includes(this.currentLanguage);
  }

  // Update app locale for RTL support
  updateAppLocale(language) {
    const isRTL = RTL_LANGUAGES.includes(language);

    // Set document direction
    if (typeof document !== 'undefined') {
      document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = language;
    }
  }

  // Format numbers based on locale
  formatNumber(number, options = {}) {
    const locale = this.currentLanguage === SUPPORTED_LANGUAGES.ARABIC ? 'ar-EG' : 'en-US';
    return new Intl.NumberFormat(locale, options).format(number);
  }

  // Format dates based on locale
  formatDate(date, options = {}) {
    const locale = this.currentLanguage === SUPPORTED_LANGUAGES.ARABIC ? 'ar-EG' : 'en-US';
    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
  }

  // Format currency based on locale
  formatCurrency(amount, currency = 'EGP') {
    const locale = this.currentLanguage === SUPPORTED_LANGUAGES.ARABIC ? 'ar-EG' : 'en-US';
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
}

// Create singleton instance
export const translationManager = new TranslationManager();

// Export translation function for easy use
export const t = (keyPath, fallback = '') => translationManager.t(keyPath, fallback);

// Export utility functions
export const { setLanguage, isRTL, formatNumber, formatDate, formatCurrency } = translationManager;

export default translationManager;
