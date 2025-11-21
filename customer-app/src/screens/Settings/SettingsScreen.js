// نظام الإعدادات القابل للتخصيص - Customizable Settings System
// ============================================================

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { translationManager, t, SUPPORTED_LANGUAGES } from '../../utils/localization';
import { customerManager } from '../../utils/customerManager';

// أنواع الإعدادات - Settings Types
export const SETTINGS_TYPES = {
  GENERAL: 'general',
  SECURITY: 'security',
  NOTIFICATIONS: 'notifications',
  PRIVACY: 'privacy',
  BACKUP: 'backup',
  ADVANCED: 'advanced',
  HELP: 'help',
};

// إعدادات التطبيق الافتراضية - Default Application Settings
export const DEFAULT_SETTINGS = {
  general: {
    language: SUPPORTED_LANGUAGES.ARABIC,
    theme: 'light',
    currency: 'EGP',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '12h',
    rtl: true,
    animations: true,
    autoSave: true,
    sessionTimeout: 30, // minutes
    dataRetentionDays: 365,
  },

  security: {
    biometricLogin: true,
    twoFactorAuth: true,
    autoLock: true,
    autoLockTimeout: 5, // minutes
    passwordComplexity: 'medium',
    requirePasswordForActions: true,
    sessionTimeoutWarning: true,
    failedLoginAttempts: 5,
    accountLockoutDuration: 15, // minutes
  },

  notifications: {
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: true,
    inAppNotifications: true,
    sound: true,
    vibration: true,
    ledIndicator: true,
    notificationSounds: {
      customerAdded: true,
      customerUpdated: true,
      systemAlerts: true,
      reminders: true,
    },
    quietHours: {
      enabled: true,
      startTime: '22:00',
      endTime: '08:00',
    },
  },

  privacy: {
    dataCollection: true,
    analytics: true,
    crashReporting: true,
    locationTracking: true,
    contactSync: true,
    automaticBackups: true,
    dataSharing: true,
  },

  backup: {
    autoBackup: true,
    backupFrequency: 'daily', // daily, weekly, monthly
    backupLocation: 'local',
    cloudBackup: true,
    backupRetention: 30, // days
    encryptedBackup: true,
    backupNotification: true,
  },

  advanced: {
    debugMode: true,
    performanceMode: true,
    cacheSize: '100MB',
    offlineMode: true,
    syncFrequency: 5, // minutes
    maxRetries: 3,
    requestTimeout: 30000, // milliseconds
    networkTimeout: 10000,
  },

  help: {
    troubleshootingEnabled: true,
  },
};

// فئة إدارة الإعدادات - Settings Manager Class
export class SettingsManager {
  constructor() {
    this.settings = { ...DEFAULT_SETTINGS };
    this.isInitialized = false;
    this.listeners = new Map();
  }

  // تهيئة نظام الإعدادات - Initialize Settings System
  async initialize() {
    try {
      await this.loadSettings();
      this.isInitialized = true;
      console.log('تم تهيئة نظام الإعدادات بنجاح');
    } catch (error) {
      console.error('فشل في تهيئة نظام الإعدادات:', error);
      // استخدام الإعدادات الافتراضية - Use default settings
      this.settings = { ...DEFAULT_SETTINGS };
      await this.saveSettings();
    }
  }

  // تحميل الإعدادات من التخزين - Load Settings from Storage
  async loadSettings() {
    try {
      const storedSettings = await AsyncStorage.getItem('app_settings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        this.settings = this.mergeSettings(DEFAULT_SETTINGS, parsedSettings);
      }
    } catch (error) {
      console.error('خطأ في تحميل الإعدادات:', error);
      throw error;
    }
  }

  // حفظ الإعدادات في التخزين - Save Settings to Storage
  async saveSettings() {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      throw error;
    }
  }

  // دمج الإعدادات مع القيم الافتراضية - Merge Settings with Defaults
  mergeSettings(defaults, stored) {
    const merged = { ...defaults };

    for (const category in defaults) {
      if (stored[category]) {
        merged[category] = { ...defaults[category], ...stored[category] };
      }
    }

    return merged;
  }

  // الحصول على قيمة إعداد معين - Get Setting Value
  getSetting(category, key, defaultValue = null) {
    return this.settings[category]?.[key] ?? defaultValue;
  }

  // تحديث إعداد معين - Update Specific Setting
  async updateSetting(category, key, value) {
    try {
      if (!this.settings[category]) {
        this.settings[category] = {};
      }

      // تطبيق الإعداد فوراً - Apply setting immediately
      const canApply = await this.applySetting(category, key, value);
      if (canApply === false) {
        return false; // Don't save if application failed
      }

      this.settings[category][key] = value;

      // حفظ في التخزين - Save to storage
      await this.saveSettings();

      return true;
    } catch (error) {
      console.error('خطأ في تحديث الإعداد:', error);
      throw error;
    }
  }

  // تحديث عدة إعدادات مرة واحدة - Update Multiple Settings at Once
  async updateSettings(updates) {
    try {
      for (const [category, categoryUpdates] of Object.entries(updates)) {
        if (!this.settings[category]) {
          this.settings[category] = {};
        }

        for (const [key, value] of Object.entries(categoryUpdates)) {
          const canApply = await this.applySetting(category, key, value);
          if (canApply === false) {
            return false; // Don't save if any application failed
          }
          this.settings[category][key] = value;
        }
      }

      await this.saveSettings();
      return true;
    } catch (error) {
      console.error('خطأ في تحديث الإعدادات:', error);
      throw error;
    }
  }

  // تطبيق الإعداد فوراً - Apply Setting Immediately
  async applySetting(category, key, value) {
    try {
      switch (category) {
        case 'general':
          await this.applyGeneralSetting(key, value);
          break;
        case 'security':
          await this.applySecuritySetting(key, value);
          break;
        case 'notifications':
          await this.applyNotificationSetting(key, value);
          break;
        case 'privacy':
          await this.applyPrivacySetting(key, value);
          break;
        case 'backup':
          await this.applyBackupSetting(key, value);
          break;
        case 'advanced':
          await this.applyAdvancedSetting(key, value);
          break;
      }
    } catch (error) {
      console.error(`خطأ في تطبيق إعداد ${category}.${key}:`, error);
    }
  }

  // تطبيق إعدادات عامة - Apply General Settings
  async applyGeneralSetting(key, value) {
    switch (key) {
      case 'language':
        translationManager.setLanguage(value);
        break;
      case 'theme':
        // تطبيق المظهر - Apply theme (would integrate with theme system)
        break;
      case 'rtl':
        // تطبيق اتجاه النص - Apply text direction
        break;
      case 'animations':
        // تفعيل/إلغاء الرسوم المتحركة - Enable/disable animations
        break;
    }
  }

  // تطبيق إعدادات الأمان - Apply Security Settings
  async applySecuritySetting(key, value) {
    switch (key) {
      case 'biometricLogin':
        // تفعيل/إلغاء المصادقة البيومترية - Enable/disable biometric auth
        if (value) {
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          if (!hasHardware || !isEnrolled) {
            Alert.alert('خطأ', 'الجهاز لا يدعم المصادقة البيومترية أو لم يتم تسجيل بصمة الإصبع');
            return false;
          }
        }
        break;
      case 'twoFactorAuth':
        // تفعيل/إلغاء المصادقة الثنائية - Enable/disable 2FA
        if (value) {
          Alert.alert('تفعيل المصادقة الثنائية', 'سيتم إرسال رمز التحقق إلى رقم هاتفك المسجل', [
            { text: 'موافق' },
          ]);
        }
        break;
      case 'autoLock':
        // تفعيل/إلغاء القفل التلقائي - Enable/disable auto lock
        break;
      case 'sessionTimeout':
        // تحديث مهلة انتهاء الجلسة - Update session timeout
        break;
    }
    return true;
  }

  // تطبيق إعدادات الإشعارات - Apply Notification Settings
  async applyNotificationSetting(key, value) {
    // تطبيق إعدادات الإشعارات - Apply notification settings
    // (would integrate with notification system)
  }

  // تطبيق إعدادات الخصوصية - Apply Privacy Settings
  async applyPrivacySetting(key, value) {
    switch (key) {
      case 'dataCollection':
        // تفعيل/إلغاء جمع البيانات - Enable/disable data collection
        break;
      case 'analytics':
        // تفعيل/إلغاء التحليلات - Enable/disable analytics
        break;
      case 'locationTracking':
        // تفعيل/إلغاء تتبع الموقع - Enable/disable location tracking
        break;
    }
  }

  // تطبيق إعدادات النسخ الاحتياطي - Apply Backup Settings
  async applyBackupSetting(key, value) {
    switch (key) {
      case 'autoBackup':
        // تفعيل/إلغاء النسخ الاحتياطي التلقائي - Enable/disable auto backup
        break;
      case 'backupFrequency':
        // تحديث تكرار النسخ الاحتياطي - Update backup frequency
        break;
      case 'encryptedBackup':
        // تفعيل/إلغاء التشفير - Enable/disable encryption
        break;
    }
  }

  // تطبيق إعدادات متقدمة - Apply Advanced Settings
  async applyAdvancedSetting(key, value) {
    switch (key) {
      case 'performanceMode':
        // تفعيل/إلغاء وضع الأداء - Enable/disable performance mode
        break;
      case 'offlineMode':
        // تفعيل/إلغاء الوضع غير المتصل - Enable/disable offline mode
        break;
      case 'syncFrequency':
        // تحديث تكرار المزامنة - Update sync frequency
        break;
    }
  }

  // إعادة تعيين الإعدادات للقيم الافتراضية - Reset Settings to Defaults
  async resetSettings(category = null) {
    try {
      if (category) {
        this.settings[category] = { ...DEFAULT_SETTINGS[category] };
      } else {
        this.settings = { ...DEFAULT_SETTINGS };
      }

      await this.saveSettings();
      return true;
    } catch (error) {
      console.error('خطأ في إعادة تعيين الإعدادات:', error);
      throw error;
    }
  }

  // تصدير الإعدادات - Export Settings
  async exportSettings() {
    try {
      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        settings: this.settings,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('خطأ في تصدير الإعدادات:', error);
      throw error;
    }
  }

  // استيراد الإعدادات - Import Settings
  async importSettings(settingsJson) {
    try {
      const importData = JSON.parse(settingsJson);

      if (!importData.settings) {
        throw new Error('ملف الإعدادات غير صحيح');
      }

      // دمج الإعدادات المستوردة - Merge imported settings
      this.settings = this.mergeSettings(DEFAULT_SETTINGS, importData.settings);
      await this.saveSettings();

      return true;
    } catch (error) {
      console.error('خطأ في استيراد الإعدادات:', error);
      throw error;
    }
  }

  // الاشتراك في تحديثات الإعدادات - Subscribe to Settings Updates
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    // إرجاع دالة إلغاء الاشتراك - Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  // إشعار المستمعين بالتحديثات - Notify Listeners of Updates
  notifyListeners() {
    for (const [key, callbacks] of this.listeners.entries()) {
      const value = this.getSettingValue(key);
      callbacks.forEach((callback) => {
        try {
          callback(value);
        } catch (error) {
          console.error('خطأ في استدعاء المستمع:', error);
        }
      });
    }
  }

  // الحصول على قيمة إعداد بالمفتاح - Get Setting Value by Key
  getSettingValue(key) {
    const keys = key.split('.');
    let current = this.settings;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return null;
      }
    }

    return current;
  }

  // المصادقة البيومترية - Biometric Authentication
  async authenticateBiometric() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'المصادقة البيومترية',
        fallbackLabel: 'استخدم كلمة المرور',
      });
      return result.success;
    } catch (error) {
      console.error('خطأ في المصادقة البيومترية:', error);
      return false;
    }
  }

  // التحقق من صحة الإعدادات - Validate Settings
  validateSettings(settings) {
    const errors = [];

    // التحقق من صحة اللغة - Validate language
    if (
      settings.general?.language &&
      !Object.values(SUPPORTED_LANGUAGES).includes(settings.general.language)
    ) {
      errors.push('لغة غير مدعومة');
    }

    // التحقق من صحة المظهر - Validate theme
    if (settings.general?.theme && !['light', 'dark', 'auto'].includes(settings.general.theme)) {
      errors.push('مظهر غير مدعوم');
    }

    // التحقق من صحة العملة - Validate currency
    if (
      settings.general?.currency &&
      !['EGP', 'USD', 'EUR', 'SAR'].includes(settings.general.currency)
    ) {
      errors.push('عملة غير مدعومة');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// إنشاء مثيل مدير الإعدادات - Create Settings Manager Instance
export const settingsManager = new SettingsManager();

// مكون شاشة الإعدادات - Settings Screen Component
const SettingsScreen = ({ navigation }) => {
  const [settings, setSettings] = useState(settingsManager.settings);
  const [activeTab, setActiveTab] = useState(SETTINGS_TYPES.GENERAL);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();

    // الاشتراك في تحديثات الإعدادات - Subscribe to settings updates
    const unsubscribe = settingsManager.subscribe('*', (value) => {
      setSettings({ ...settingsManager.settings });
    });

    return unsubscribe;
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      await settingsManager.initialize();
      setSettings({ ...settingsManager.settings });
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحميل الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (category, key, value) => {
    try {
      const success = await settingsManager.updateSetting(category, key, value);
      if (success) {
        setSettings({ ...settingsManager.settings });
      }
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تحديث الإعداد');
    }
  };

  const resetCategorySettings = async (category) => {
    Alert.alert('تأكيد إعادة التعيين', 'هل أنت متأكد من إعادة تعيين جميع إعدادات هذه الفئة؟', [
      { text: 'إلغاء', style: 'cancel' },
      {
        text: 'إعادة تعيين',
        style: 'destructive',
        onPress: async () => {
          try {
            await settingsManager.resetSettings(category);
            setSettings({ ...settingsManager.settings });
          } catch (error) {
            Alert.alert('خطأ', 'فشل في إعادة التعيين');
          }
        },
      },
    ]);
  };

  const renderTabButton = (tabType, title, icon) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tabType && styles.activeTabButton]}
      onPress={() => setActiveTab(tabType)}>
      <Text style={[styles.tabButtonText, activeTab === tabType && styles.activeTabButtonText]}>
        {icon} {title}
      </Text>
    </TouchableOpacity>
  );

  const renderGeneralSettings = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>{t('settings.generalTab')}</Text>

      {/* إعدادات اللغة - Language Settings */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>{t('settings.general.language')}</Text>
        <Text style={styles.settingValue}>
          {settings.general?.language === 'ar' ? 'العربية' : 'English'}
        </Text>
      </View>

      {/* إعدادات المظهر - Theme Settings */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>{t('settings.general.theme')}</Text>
        <Text style={styles.settingValue}>
          {settings.general?.theme === 'light'
            ? 'فاتح'
            : settings.general?.theme === 'dark'
              ? 'داكن'
              : 'تلقائي'}
        </Text>
      </View>

      {/* إعدادات العملة - Currency Settings */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>{t('settings.general.currency')}</Text>
        <Text style={styles.settingValue}>{settings.general?.currency}</Text>
      </View>

      {/* إعدادات التنسيق - Format Settings */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>تنسيق التاريخ</Text>
        <Text style={styles.settingValue}>{settings.general?.dateFormat}</Text>
      </View>

      {/* تفعيل RTL - RTL Toggle */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>دعم القراءة من اليمين</Text>
        <Switch
          value={settings.general?.rtl}
          onValueChange={(value) => updateSetting('general', 'rtl', value)}
        />
      </View>

      {/* تفعيل الرسوم المتحركة - Animations Toggle */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>الرسوم المتحركة</Text>
        <Switch
          value={settings.general?.animations}
          onValueChange={(value) => updateSetting('general', 'animations', value)}
        />
      </View>
    </View>
  );

  const renderSecuritySettings = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>{t('settings.securityTab')}</Text>

      {/* المصادقة البيومترية - Biometric Authentication */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>{t('settings.security.biometricLogin')}</Text>
        <Switch
          value={settings.security?.biometricLogin}
          onValueChange={(value) => updateSetting('security', 'biometricLogin', value)}
        />
      </View>

      {/* المصادقة الثنائية - Two Factor Authentication */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>{t('settings.security.twoFactorAuth')}</Text>
        <Switch
          value={settings.security?.twoFactorAuth}
          onValueChange={(value) => updateSetting('security', 'twoFactorAuth', value)}
        />
      </View>

      {/* القفل التلقائي - Auto Lock */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>القفل التلقائي</Text>
        <Switch
          value={settings.security?.autoLock}
          onValueChange={(value) => updateSetting('security', 'autoLock', value)}
        />
      </View>

      {/* مهلة انتهاء الجلسة - Session Timeout */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>مهلة انتهاء الجلسة (دقيقة)</Text>
        <Text style={styles.settingValue}>{settings.security?.sessionTimeout}</Text>
      </View>
    </View>
  );

  const renderNotificationSettings = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>الإشعارات</Text>

      {/* الإشعارات الدفعية - Push Notifications */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>الإشعارات الدفعية</Text>
        <Switch
          value={settings.notifications?.pushNotifications}
          onValueChange={(value) => updateSetting('notifications', 'pushNotifications', value)}
        />
      </View>

      {/* الإشعارات البريدية - Email Notifications */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>الإشعارات البريدية</Text>
        <Switch
          value={settings.notifications?.emailNotifications}
          onValueChange={(value) => updateSetting('notifications', 'emailNotifications', value)}
        />
      </View>

      {/* أصوات الإشعارات - Notification Sounds */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>أصوات الإشعارات</Text>
        <Switch
          value={settings.notifications?.sound}
          onValueChange={(value) => updateSetting('notifications', 'sound', value)}
        />
      </View>

      {/* الاهتزاز - Vibration */}
      <View style={styles.settingItem}>
        <Text style={styles.settingLabel}>الاهتزاز</Text>
        <Switch
          value={settings.notifications?.vibration}
          onValueChange={(value) => updateSetting('notifications', 'vibration', value)}
        />
      </View>
    </View>
  );

  const renderAccountSettings = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>الحساب</Text>
      <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Addresses')}>
        <Text style={styles.settingLabel}>إدارة العناوين</Text>
        <Text style={styles.settingValue}>&gt;</Text>
      </TouchableOpacity>
    </View>
  );
  const renderHelpSettings = () => (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>المساعدة والدعم</Text>

      <View style={styles.helpSection}>
        <Text style={styles.helpTitle}>مشاكل شائعة في التسجيل</Text>
        <Text style={styles.helpDescription}>
          إذا واجهت شاشة فارغة أثناء التسجيل، جرب الخطوات التالية:
        </Text>

        <View style={styles.troubleshootingItem}>
          <Text style={styles.troubleshootingTitle}>🔗 مشاكل الشبكة أو الاتصال:</Text>
          <Text style={styles.troubleshootingText}>
            • تحقق من اتصال الإنترنت{'\n'}• جرب التبديل إلى شبكة Wi-Fi مستقرة أو بيانات محمولة{'\n'}
            • أعد تحميل الصفحة أو أعد تشغيل التطبيق
          </Text>
        </View>

        <View style={styles.troubleshootingItem}>
          <Text style={styles.troubleshootingTitle}>💾 مشاكل ذاكرة التخزين المؤقت:</Text>
          <Text style={styles.troubleshootingText}>
            • امسح ذاكرة التخزين المؤقت للمتصفح{'\n'}• أعد تثبيت التطبيق إذا لزم الأمر
          </Text>
        </View>

        <View style={styles.troubleshootingItem}>
          <Text style={styles.troubleshootingTitle}>⚙️ مشاكل JavaScript:</Text>
          <Text style={styles.troubleshootingText}>
            • تأكد من تفعيل JavaScript في إعدادات المتصفح{'\n'}• حدث المتصفح إلى أحدث إصدار
          </Text>
        </View>

        <View style={styles.troubleshootingItem}>
          <Text style={styles.troubleshootingTitle}>🖥️ مشاكل الخادم:</Text>
          <Text style={styles.troubleshootingText}>
            • تحقق من حالة الخادم من خلال الموقع الرسمي{'\n'}• انتظر بضع ساعات وحاول مرة أخرى{'\n'}•
            اتصل بدعم التطبيق للمساعدة
          </Text>
        </View>

        <View style={styles.troubleshootingItem}>
          <Text style={styles.troubleshootingTitle}>📝 مشاكل البيانات:</Text>
          <Text style={styles.troubleshootingText}>
            • تأكد من صحة جميع الحقول المدخلة{'\n'}• جرب التسجيل ببيانات مختلفة لعزل المشكلة
          </Text>
        </View>

        <Text style={styles.helpNote}>
          إذا استمرت المشكلة، شارك تفاصيل الخطأ مع فريق الدعم الفني.
        </Text>
      </View>
    </View>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case SETTINGS_TYPES.GENERAL:
        return renderGeneralSettings();
      case SETTINGS_TYPES.SECURITY:
        return renderSecuritySettings();
      case SETTINGS_TYPES.NOTIFICATIONS:
        return renderNotificationSettings();
      case 'account':
        return renderAccountSettings();
      case SETTINGS_TYPES.HELP:
        return renderHelpSettings();
      default:
        return renderGeneralSettings();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
      </View>

      {/* تبويبات الإعدادات - Settings Tabs */}
      <View style={styles.tabContainer}>
        {renderTabButton(SETTINGS_TYPES.GENERAL, 'عام', '⚙️')}
        {renderTabButton(SETTINGS_TYPES.SECURITY, 'أمان', '🔒')}
        {renderTabButton(SETTINGS_TYPES.NOTIFICATIONS, 'إشعارات', '🔔')}
        {renderTabButton('account', 'الحساب', '👤')}
        {renderTabButton(SETTINGS_TYPES.HELP, 'مساعدة', '❓')}
      </View>

      {/* محتوى الإعدادات - Settings Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderActiveTab()}

        {/* أزرار الإعدادات - Settings Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => resetCategorySettings(activeTab)}>
            <Text style={styles.resetButtonText}>إعادة تعيين الفئة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exportButton}
            onPress={async () => {
              try {
                const exportData = await settingsManager.exportSettings();
                // مشاركة البيانات أو حفظها - Share or save data
                Alert.alert('نجح', 'تم تصدير الإعدادات بنجاح');
              } catch (error) {
                Alert.alert('خطأ', 'فشل في تصدير الإعدادات');
              }
            }}>
            <Text style={styles.exportButtonText}>تصدير الإعدادات</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// أنماط CSS - CSS Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
  },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },

  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },

  activeTabButton: {
    backgroundColor: '#FF6B35',
  },

  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },

  activeTabButtonText: {
    color: 'white',
  },

  content: {
    flex: 1,
    padding: 20,
  },

  settingsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 16,
  },

  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  settingLabel: {
    fontSize: 16,
    color: '#2D3436',
    flex: 1,
  },

  settingValue: {
    fontSize: 14,
    color: '#666',
    marginRight: 16,
  },

  actionsContainer: {
    marginTop: 20,
  },

  resetButton: {
    backgroundColor: '#EF476F',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },

  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  exportButton: {
    backgroundColor: '#4ECDC4',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },

  exportButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  // Help section styles
  helpSection: {
    marginTop: 10,
  },

  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 8,
  },

  helpDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },

  troubleshootingItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },

  troubleshootingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 6,
  },

  troubleshootingText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  helpNote: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default SettingsScreen;
