// نظام المصادقة المتقدم - Advanced Authentication System
// ====================================================

import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// الأدوار والصلاحيات - User Roles & Permissions
export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  SALES_REP: 'sales_rep',
  SUPPORT: 'support',
  VIEWER: 'viewer',
};

export const PERMISSIONS = {
  // إدارة العملاء - Customer Management
  CUSTOMERS_READ: 'customers:read',
  CUSTOMERS_WRITE: 'customers:write',
  CUSTOMERS_DELETE: 'customers:delete',
  CUSTOMERS_EXPORT: 'customers:export',

  // التقارير - Reports
  REPORTS_READ: 'reports:read',
  REPORTS_EXPORT: 'reports:export',

  // الإعدادات - Settings
  SETTINGS_READ: 'settings:read',
  SETTINGS_WRITE: 'settings:write',

  // المستخدمون - Users
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',

  // النظام - System
  SYSTEM_BACKUP: 'system:backup',
  SYSTEM_RESTORE: 'system:restore',
  SYSTEM_LOGS: 'system:logs',
};

// ربط الأدوار بالصلاحيات - Role-Based Access Control
export const ROLE_PERMISSIONS = {
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
  [USER_ROLES.MANAGER]: [
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.CUSTOMERS_WRITE,
    PERMISSIONS.CUSTOMERS_DELETE,
    PERMISSIONS.CUSTOMERS_EXPORT,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.REPORTS_EXPORT,
    PERMISSIONS.USERS_READ,
    PERMISSIONS.SETTINGS_READ,
  ],
  [USER_ROLES.SALES_REP]: [
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.CUSTOMERS_WRITE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.SETTINGS_READ,
  ],
  [USER_ROLES.SUPPORT]: [
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.CUSTOMERS_WRITE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.SETTINGS_READ,
  ],
  [USER_ROLES.VIEWER]: [
    PERMISSIONS.CUSTOMERS_READ,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.SETTINGS_READ,
  ],
};

// بيانات المستخدمين التجريبية - Mock User Data
export const MOCK_USERS = [
  {
    id: 'user_admin',
    email: 'admin@crm.com',
    username: 'admin',
    firstName: 'أحمد',
    lastName: 'المدير',
    role: USER_ROLES.ADMIN,
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    phone: '01012345678',
    isActive: true,
    lastLogin: '2024-11-14T10:30:00Z',
    preferences: {
      language: 'ar',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
    },
    // معلومات الأمان - Security Information
    security: {
      passwordHash: CryptoJS.SHA256('admin123').toString(),
      twoFactorEnabled: true,
      biometricEnabled: true,
      lastPasswordChange: '2024-10-01T10:00:00Z',
      failedLoginAttempts: 0,
      isLocked: false,
      lockExpiresAt: null,
      sessionTimeout: 30, // minutes
    },
    // مفتاح التشفير - Encryption Key (للبيانات الحساسة)
    encryptionKey: CryptoJS.lib.WordArray.random(32).toString(),
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-11-14T10:30:00Z',
  },
  {
    id: 'user_manager',
    email: 'manager@crm.com',
    username: 'manager',
    firstName: 'فاطمة',
    lastName: 'المدير التنفيذي',
    role: USER_ROLES.MANAGER,
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b7a9?w=150&h=150&fit=crop&crop=face',
    phone: '01098765432',
    isActive: true,
    lastLogin: '2024-11-13T16:45:00Z',
    preferences: {
      language: 'ar',
      theme: 'dark',
      notifications: {
        email: true,
        push: true,
        sms: true,
      },
    },
    security: {
      passwordHash: CryptoJS.SHA256('manager123').toString(),
      twoFactorEnabled: false,
      biometricEnabled: true,
      lastPasswordChange: '2024-09-15T10:00:00Z',
      failedLoginAttempts: 0,
      isLocked: false,
      lockExpiresAt: null,
      sessionTimeout: 30,
    },
    encryptionKey: CryptoJS.lib.WordArray.random(32).toString(),
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-11-13T16:45:00Z',
  },
  {
    id: 'user_sales',
    email: 'sales@crm.com',
    username: 'sales',
    firstName: 'محمد',
    lastName: 'مندوب المبيعات',
    role: USER_ROLES.SALES_REP,
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    phone: '01123456789',
    isActive: true,
    lastLogin: '2024-11-14T09:15:00Z',
    preferences: {
      language: 'ar',
      theme: 'light',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
    },
    security: {
      passwordHash: CryptoJS.SHA256('sales123').toString(),
      twoFactorEnabled: false,
      biometricEnabled: false,
      lastPasswordChange: '2024-11-01T10:00:00Z',
      failedLoginAttempts: 0,
      isLocked: false,
      lockExpiresAt: null,
      sessionTimeout: 20,
    },
    encryptionKey: CryptoJS.lib.WordArray.random(32).toString(),
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-11-14T09:15:00Z',
  },
];

// إنشاء JWT Token
export const createJWT = (payload, secret = process.env.JWT_SECRET || 'crm-secret-key') => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));

  const signature = CryptoJS.HmacSHA256(`${encodedHeader}.${encodedPayload}`, secret).toString();

  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

// التحقق من JWT Token
export const verifyJWT = (token, secret = process.env.JWT_SECRET || 'crm-secret-key') => {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');

    const expectedSignature = CryptoJS.HmacSHA256(
      `${encodedHeader}.${encodedPayload}`,
      secret
    ).toString();

    if (signature !== expectedSignature) {
      throw new Error('Invalid signature');
    }

    const payload = JSON.parse(atob(encodedPayload));

    // Check if token is expired
    if (payload.exp && payload.exp < Date.now()) {
      throw new Error('Token expired');
    }

    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// إنشاء رمز الوصول - Access Token
export const createAccessToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + user.security.sessionTimeout * 60, // Session timeout
    type: 'access',
  };

  return createJWT(payload);
};

// إنشاء رمز التحديث - Refresh Token
export const createRefreshToken = (user) => {
  const payload = {
    userId: user.id,
    type: 'refresh',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
  };

  return createJWT(payload);
};

// تشفير البيانات الحساسة - Encrypt Sensitive Data
export const encryptSensitiveData = (data, key) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
    return encrypted;
  } catch (error) {
    throw new Error('Encryption failed');
  }
};

// فك تشفير البيانات الحساسة - Decrypt Sensitive Data
export const decryptSensitiveData = (encryptedData, key) => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    throw new Error('Decryption failed');
  }
};

// التحقق من كلمة المرور - Password Validation
export const validatePassword = (password, user) => {
  const passwordHash = CryptoJS.SHA256(password).toString();
  return passwordHash === user.security.passwordHash;
};

// تشفير كلمة المرور الجديدة - Hash New Password
export const hashPassword = (password) => {
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 512 / 32,
    iterations: 10000,
  }).toString();

  return `${salt.toString()}:${hash}`;
};

// التحقق من قوة كلمة المرور - Password Strength Validation
export const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل');
  }

  if (!/\d/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل');
  }

  if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل');
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password),
  };
};

// حساب قوة كلمة المرور - Calculate Password Strength
export const calculatePasswordStrength = (password) => {
  let score = 0;

  // Length
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Character types
  if (/[a-z]/.test(password)) score += 10;
  if (/[A-Z]/.test(password)) score += 10;
  if (/\d/.test(password)) score += 10;
  if (/[!@#$%^&*(),.?\":{}|<>]/.test(password)) score += 20;

  // Complexity
  if (/[a-zA-Z]/.test(password) && /\d/.test(password)) score += 10;
  if (/[a-zA-Z]/.test(password) && /[!@#$%^&*(),.?\":{}|<>]/.test(password)) score += 5;
  if (/[a-zA-Z]/.test(password) && /\d/.test(password) && /[!@#$%^&*(),.?\":{}|<>]/.test(password))
    score += 5;

  return {
    score: Math.min(score, 100),
    level: score < 30 ? 'ضعيفة' : score < 60 ? 'متوسطة' : score < 80 ? 'قوية' : 'قوية جداً',
  };
};

// إنشاء رمز التحقق الثنائي - Generate 2FA Code
export const generate2FACode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// التحقق من رمز التحقق الثنائي - Verify 2FA Code
export const verify2FACode = (inputCode, storedCode, expiryTime = 5 * 60 * 1000) => {
  if (!storedCode || !inputCode) return false;

  const now = Date.now();
  if (now > expiryTime) return false; // Code expired

  return inputCode === storedCode;
};

// التحقق من الصلاحيات - Permission Check
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;

  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
};

// التحقق من الصلاحيات المتعددة - Multiple Permissions Check
export const hasPermissions = (user, permissions) => {
  return permissions.every((permission) => hasPermission(user, permission));
};

// التحقق من الأدوار - Role Check
export const hasRole = (user, role) => {
  return user && user.role === role;
};

// التحقق من الأدوار المتعددة - Multiple Roles Check
export const hasRoles = (user, roles) => {
  return user && roles.includes(user.role);
};

// إدارة جلسات المستخدمين - User Session Management
export class SessionManager {
  constructor() {
    this.currentSession = null;
    this.sessions = new Map();
  }

  // إنشاء جلسة جديدة - Create New Session
  createSession(user, accessToken, refreshToken) {
    const session = {
      userId: user.id,
      accessToken,
      refreshToken,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + user.security.sessionTimeout * 60 * 1000,
    };

    this.sessions.set(user.id, session);
    this.currentSession = session;

    // حفظ في التخزين المحلي - Store in local storage
    this.saveSessionToStorage(session);

    return session;
  }

  // التحقق من صحة الجلسة - Validate Session
  validateSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const now = Date.now();
    if (now > session.expiresAt) {
      this.endSession(sessionId);
      return false;
    }

    // تحديث آخر نشاط - Update last activity
    session.lastActivity = now;
    return true;
  }

  // إنهاء الجلسة - End Session
  endSession(userId) {
    this.sessions.delete(userId);

    if (this.currentSession && this.currentSession.userId === userId) {
      this.currentSession = null;
    }

    // إزالة من التخزين المحلي - Remove from storage
    this.removeSessionFromStorage(userId);
  }

  // تنظيف الجلسات منتهية الصلاحية - Clean Expired Sessions
  cleanExpiredSessions() {
    const now = Date.now();

    for (const [userId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(userId);
        this.removeSessionFromStorage(userId);
      }
    }
  }

  // حفظ الجلسة في التخزين المحلي - Save Session to Storage
  async saveSessionToStorage(session) {
    try {
      await AsyncStorage.setItem(`session_${session.userId}`, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save session to storage:', error);
    }
  }

  // إزالة الجلسة من التخزين المحلي - Remove Session from Storage
  async removeSessionFromStorage(userId) {
    try {
      await AsyncStorage.removeItem(`session_${userId}`);
    } catch (error) {
      console.error('Failed to remove session from storage:', error);
    }
  }

  // استعادة الجلسة من التخزين المحلي - Restore Session from Storage
  async restoreSessionFromStorage() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const sessionKeys = keys.filter((key) => key.startsWith('session_'));

      const sessions = await AsyncStorage.multiGet(sessionKeys);

      for (const [key, sessionData] of sessions) {
        if (sessionData) {
          const session = JSON.parse(sessionData);
          this.sessions.set(session.userId, session);

          // التحقق من صحة الجلسة - Validate session
          if (this.validateSession(session.userId)) {
            this.currentSession = session;
          }
        }
      }
    } catch (error) {
      console.error('Failed to restore sessions from storage:', error);
    }
  }
}

// إنشاء مثيل مدير الجلسات - Create Session Manager Instance
export const sessionManager = new SessionManager();

// تصدير جميع الوظائف - Export All Functions
export default {
  USER_ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  MOCK_USERS,
  createJWT,
  verifyJWT,
  createAccessToken,
  createRefreshToken,
  encryptSensitiveData,
  decryptSensitiveData,
  validatePassword,
  hashPassword,
  validatePasswordStrength,
  calculatePasswordStrength,
  generate2FACode,
  verify2FACode,
  hasPermission,
  hasPermissions,
  hasRole,
  hasRoles,
  sessionManager,
};
