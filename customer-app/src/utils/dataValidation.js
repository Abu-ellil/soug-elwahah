// نظام التحقق من البيانات وتنظيفها - Data Validation & Sanitization System
// =================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { customerManager } from './customerManager';
import { t, translationManager } from './localization';

// أنواع التحقق - Validation Types
export const VALIDATION_TYPES = {
  REQUIRED: 'required',
  EMAIL: 'email',
  PHONE: 'phone',
  URL: 'url',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  NUMERIC: 'numeric',
  INTEGER: 'integer',
  POSITIVE: 'positive',
  DATE: 'date',
  CUSTOM: 'custom',
  REGEX: 'regex',
  IN_RANGE: 'inRange',
  ALPHANUMERIC: 'alphanumeric',
  ALPHA: 'alpha',
  BOOLEAN: 'boolean',
  ARRAY: 'array',
  OBJECT: 'object',
};

// قواعد التنظيف - Sanitization Rules
export const SANITIZATION_RULES = {
  TRIM: 'trim',
  STRIP_TAGS: 'stripTags',
  HTML_ENTITIES: 'htmlEntities',
  URL_ENCODE: 'urlEncode',
  NORMALIZE_EMAIL: 'normalizeEmail',
  CONVERT_PHONE: 'convertPhone',
  FORMAT_CURRENCY: 'formatCurrency',
  FORMAT_DATE: 'formatDate',
  SANITIZE_HTML: 'sanitizeHtml',
  REMOVE_DUPLICATES: 'removeDuplicates',
  SANITIZE_FILENAME: 'sanitizeFilename',
};

// إعدادات التحقق الافتراضية - Default Validation Settings
export const DEFAULT_VALIDATION_SETTINGS = {
  enableStrictValidation: true,
  sanitizeInput: true,
  validateOnChange: true,
  validateOnBlur: true,
  showInlineErrors: true,
  maxFieldLength: 1000,
  preventXSS: true,
  sanitizeOutput: true,
  normalizeData: true,
};

// فئة التحقق من البيانات - Data Validation Class
export class DataValidator {
  constructor(settings = DEFAULT_VALIDATION_SETTINGS) {
    this.settings = { ...DEFAULT_VALIDATION_SETTINGS, ...settings };
    this.customValidators = new Map();
    this.customSanitizers = new Map();
  }

  // إضافة مخصص للتحقق - Add Custom Validator
  addCustomValidator(name, validatorFn) {
    this.customValidators.set(name, validatorFn);
  }

  // إضافة منظف مخصص - Add Custom Sanitizer
  addCustomSanitizer(name, sanitizerFn) {
    this.customSanitizers.set(name, sanitizerFn);
  }

  // التحقق من البيانات - Validate Data
  validate(data, rules, options = {}) {
    const results = {
      isValid: true,
      errors: [],
      sanitizedData: { ...data },
      warnings: [],
    };

    try {
      // تنظيف البيانات أولاً - Sanitize data first
      if (this.settings.sanitizeInput) {
        results.sanitizedData = this.sanitize(data);
      }

      // التحقق من الحقول المطلوبة - Validate required fields
      for (const [field, fieldRules] of Object.entries(rules)) {
        const fieldResult = this.validateField(
          field,
          results.sanitizedData[field],
          fieldRules,
          data
        );

        if (!fieldResult.isValid) {
          results.isValid = false;
          results.errors.push(...fieldResult.errors);
        }

        if (fieldResult.warnings.length > 0) {
          results.warnings.push(...fieldResult.warnings);
        }

        // تحديث البيانات المنظفة - Update sanitized data
        if (fieldResult.sanitizedValue !== undefined) {
          results.sanitizedData[field] = fieldResult.sanitizedValue;
        }
      }

      // التحقق المخصص - Custom validation
      if (options.customValidation) {
        const customResult = options.customValidation(results.sanitizedData);
        if (!customResult.isValid) {
          results.isValid = false;
          results.errors.push(...customResult.errors);
        }
      }
    } catch (error) {
      console.error('خطأ في التحقق من البيانات:', error);
      results.isValid = false;
      results.errors.push('خطأ في عملية التحقق من البيانات');
    }

    return results;
  }

  // التحقق من حقل واحد - Validate Single Field
  validateField(fieldName, value, rules, fullData) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedValue: value,
    };

    // التحقق من الحقل المطلوب - Required field check
    if (rules.required && (value === undefined || value === null || value === '')) {
      result.isValid = false;
      result.errors.push(`${fieldName} مطلوب`);
      return result;
    }

    // تخطي التحقق إذا كانت القيمة فارغة وغير مطلوبة - Skip validation if empty and not required
    if (!value && !rules.required) {
      return result;
    }

    // تطبيق قواعد التحقق - Apply validation rules
    for (const [ruleType, ruleValue] of Object.entries(rules)) {
      if (ruleType === 'required') continue; // Already handled above

      const ruleResult = this.applyValidationRule(fieldName, value, ruleType, ruleValue, fullData);

      if (!ruleResult.isValid) {
        result.isValid = false;
        result.errors.push(...ruleResult.errors);
      }

      if (ruleResult.warnings.length > 0) {
        result.warnings.push(...ruleResult.warnings);
      }

      if (ruleResult.sanitizedValue !== undefined) {
        result.sanitizedValue = ruleResult.sanitizedValue;
      }
    }

    return result;
  }

  // تطبيق قاعدة التحقق - Apply Validation Rule
  applyValidationRule(fieldName, value, ruleType, ruleValue, fullData) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitizedValue: undefined,
    };

    switch (ruleType) {
      case VALIDATION_TYPES.EMAIL:
        if (!this.isValidEmail(value)) {
          result.isValid = false;
          result.errors.push('البريد الإلكتروني غير صحيح');
        }
        break;

      case VALIDATION_TYPES.PHONE:
        if (!this.isValidPhone(value)) {
          result.isValid = false;
          result.errors.push('رقم الهاتف غير صحيح');
        }
        break;

      case VALIDATION_TYPES.MIN_LENGTH:
        if (value && value.length < ruleValue) {
          result.isValid = false;
          result.errors.push(`${fieldName} يجب أن يكون على الأقل ${ruleValue} أحرف`);
        }
        break;

      case VALIDATION_TYPES.MAX_LENGTH:
        if (value && value.length > ruleValue) {
          result.isValid = false;
          result.errors.push(`${fieldName} يجب ألا يزيد عن ${ruleValue} أحرف`);
        }
        break;

      case VALIDATION_TYPES.NUMERIC:
        if (!this.isNumeric(value)) {
          result.isValid = false;
          result.errors.push(`${fieldName} يجب أن يكون رقماً`);
        }
        break;

      case VALIDATION_TYPES.POSITIVE:
        if (value && (isNaN(value) || parseFloat(value) <= 0)) {
          result.isValid = false;
          result.errors.push(`${fieldName} يجب أن يكون رقماً موجباً`);
        }
        break;

      case VALIDATION_TYPES.DATE:
        if (!this.isValidDate(value)) {
          result.isValid = false;
          result.errors.push(`${fieldName} يجب أن يكون تاريخاً صحيحاً`);
        }
        break;

      case VALIDATION_TYPES.REGEX:
        if (ruleValue && !new RegExp(ruleValue).test(value)) {
          result.isValid = false;
          result.errors.push(`${fieldName} لا يتطابق مع التنسيق المطلوب`);
        }
        break;

      case VALIDATION_TYPES.CUSTOM:
        if (this.customValidators.has(ruleValue)) {
          const customValidator = this.customValidators.get(ruleValue);
          const customResult = customValidator(value, fullData);
          if (!customResult.isValid) {
            result.isValid = false;
            result.errors.push(...customResult.errors);
          }
        }
        break;

      case VALIDATION_TYPES.IN_RANGE:
        if (ruleValue.min !== undefined && value < ruleValue.min) {
          result.isValid = false;
          result.errors.push(`${fieldName} يجب أن يكون أكبر من ${ruleValue.min}`);
        }
        if (ruleValue.max !== undefined && value > ruleValue.max) {
          result.isValid = false;
          result.errors.push(`${fieldName} يجب أن يكون أصغر من ${ruleValue.max}`);
        }
        break;
    }

    return result;
  }

  // تنظيف البيانات - Sanitize Data
  sanitize(data, rules = {}) {
    const sanitized = { ...data };

    for (const [field, value] of Object.entries(data)) {
      if (value !== null && value !== undefined) {
        sanitized[field] = this.sanitizeField(value, rules[field] || []);
      }
    }

    return sanitized;
  }

  // تنظيف حقل واحد - Sanitize Single Field
  sanitizeField(value, sanitizeRules = []) {
    let sanitizedValue = value;

    for (const rule of sanitizeRules) {
      if (typeof rule === 'string') {
        sanitizedValue = this.applySanitizationRule(sanitizedValue, rule);
      } else if (typeof rule === 'function') {
        sanitizedValue = rule(sanitizedValue);
      } else if (typeof rule === 'object' && rule.name) {
        sanitizedValue = this.applyCustomSanitization(sanitizedValue, rule);
      }
    }

    return sanitizedValue;
  }

  // تطبيق قاعدة التنظيف - Apply Sanitization Rule
  applySanitizationRule(value, rule) {
    if (value === null || value === undefined) return value;

    switch (rule) {
      case SANITIZATION_RULES.TRIM:
        return typeof value === 'string' ? value.trim() : value;

      case SANITIZATION_RULES.STRIP_TAGS:
        return typeof value === 'string' ? value.replace(/<[^>]*>/g, '') : value;

      case SANITIZATION_RULES.HTML_ENTITIES:
        if (typeof value === 'string') {
          const div = document.createElement('div');
          div.innerHTML = value;
          return div.textContent || div.innerText || '';
        }
        return value;

      case SANITIZATION_RULES.NORMALIZE_EMAIL:
        return typeof value === 'string' ? value.toLowerCase().trim() : value;

      case SANITIZATION_RULES.CONVERT_PHONE:
        return typeof value === 'string' ? this.normalizePhoneNumber(value) : value;

      case SANITIZATION_RULES.FORMAT_DATE:
        return typeof value === 'string' ? this.formatDate(value) : value;

      case SANITIZATION_RULES.SANITIZE_FILENAME:
        return typeof value === 'string' ? this.sanitizeFilename(value) : value;

      default:
        return value;
    }
  }

  // تطبيق التنظيف المخصص - Apply Custom Sanitization
  applyCustomSanitization(value, ruleConfig) {
    if (this.customSanitizers.has(ruleConfig.name)) {
      const customSanitizer = this.customSanitizers.get(ruleConfig.name);
      return customSanitizer(value, ruleConfig.options);
    }
    return value;
  }

  // التحقق من صحة البريد الإلكتروني - Validate Email
  isValidEmail(email) {
    if (typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }

  // التحقق من صحة رقم الهاتف - Validate Phone Number
  isValidPhone(phone) {
    if (typeof phone !== 'string') return false;
    // Egyptian phone number validation
    const phoneRegex = /^(\+20|0)?1[0125][0-9]{8}$/;
    const cleaned = phone.replace(/\s|-/g, '');
    return phoneRegex.test(cleaned);
  }

  // التحقق من صحة الرقم - Validate Numeric
  isNumeric(value) {
    if (typeof value === 'number') return !isNaN(value);
    if (typeof value === 'string') return !isNaN(value) && !isNaN(parseFloat(value));
    return false;
  }

  // التحقق من صحة التاريخ - Validate Date
  isValidDate(date) {
    if (!date) return false;
    const d = new Date(date);
    return d instanceof Date && !isNaN(d.getTime());
  }

  // تطبيع رقم الهاتف - Normalize Phone Number
  normalizePhoneNumber(phone) {
    if (typeof phone !== 'string') return phone;

    let cleaned = phone.replace(/\D/g, '');

    // تحويل الرقم المصري - Convert Egyptian number
    if (cleaned.startsWith('20')) {
      cleaned = cleaned.substring(2);
    }
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    return `+20${cleaned}`;
  }

  // تنسيق التاريخ - Format Date
  formatDate(date) {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) return date;

    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  // تنظيف اسم الملف - Sanitize Filename
  sanitizeFilename(filename) {
    if (typeof filename !== 'string') return filename;

    return filename
      .replace(/[^a-zA-Z0-9\u0600-\u06FF._-]/g, '_')
      .replace(/_{2,}/g, '_')
      .substring(0, 255);
  }

  // التحقق من XSS - XSS Detection
  detectXSS(value) {
    if (typeof value !== 'string') return false;

    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<[^>]*on\w+="[^"]*"/gi,
    ];

    return xssPatterns.some((pattern) => pattern.test(value));
  }

  // منع XSS - XSS Prevention
  preventXSS(value) {
    if (typeof value !== 'string') return value;

    return value
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}

// قواعد التحقق المحددة للعملاء - Customer-Specific Validation Rules
export const CUSTOMER_VALIDATION_RULES = {
  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    custom: 'validateArabicName',
  },

  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    custom: 'validateArabicName',
  },

  email: {
    required: true,
    email: true,
    maxLength: 100,
    custom: 'validateUniqueEmail',
  },

  phone: {
    required: true,
    phone: true,
    custom: 'validateUniquePhone',
  },

  alternativePhone: {
    phone: true,
    custom: 'validateUniqueAlternativePhone',
  },

  dateOfBirth: {
    date: true,
    custom: 'validateAge',
  },

  address: {
    required: true,
    custom: 'validateAddress',
  },

  type: {
    required: true,
    custom: 'validateCustomerType',
  },

  tier: {
    required: true,
    custom: 'validateCustomerTier',
  },

  status: {
    required: true,
    custom: 'validateCustomerStatus',
  },

  notes: {
    maxLength: 1000,
    custom: 'sanitizeNotes',
  },
};

// قواعد التنظيف المحددة للعملاء - Customer-Specific Sanitization Rules
export const CUSTOMER_SANITIZATION_RULES = {
  firstName: [SANITIZATION_RULES.TRIM],
  lastName: [SANITIZATION_RULES.TRIM],
  email: [SANITIZATION_RULES.TRIM, SANITIZATION_RULES.NORMALIZE_EMAIL],
  phone: [SANITIZATION_RULES.TRIM, SANITIZATION_RULES.CONVERT_PHONE],
  alternativePhone: [SANITIZATION_RULES.TRIM, SANITIZATION_RULES.CONVERT_PHONE],
  notes: [SANITIZATION_RULES.STRIP_TAGS, SANITIZATION_RULES.TRIM],
  address: {
    street: [SANITIZATION_RULES.TRIM],
    city: [SANITIZATION_RULES.TRIM],
    state: [SANITIZATION_RULES.TRIM],
    country: [SANITIZATION_RULES.TRIM],
  },
};

// فئات التحقق المخصصة - Custom Validator Classes
export class CustomerValidator extends DataValidator {
  constructor() {
    super();
    this.setupCustomValidators();
  }

  // إعداد المخصصين للتحقق - Setup Custom Validators
  setupCustomValidators() {
    // التحقق من الاسم العربي - Arabic Name Validation
    this.addCustomValidator('validateArabicName', (value, fullData) => {
      const arabicRegex = /^[\u0600-\u06FF\s]+$/;
      const englishRegex = /^[a-zA-Z\s]+$/;

      if (!arabicRegex.test(value) && !englishRegex.test(value)) {
        return { isValid: false, errors: ['يجب أن يحتوي الاسم على أحرف عربية أو إنجليزية فقط'] };
      }

      return { isValid: true, errors: [] };
    });

    // التحقق من البريد الإلكتروني الفريد - Unique Email Validation
    this.addCustomValidator('validateUniqueEmail', async (value, fullData) => {
      try {
        const existingCustomer = await this.findCustomerByEmail(value, fullData.id);
        if (existingCustomer) {
          return { isValid: false, errors: ['البريد الإلكتروني مستخدم بالفعل'] };
        }
        return { isValid: true, errors: [] };
      } catch (error) {
        return { isValid: false, errors: ['خطأ في التحقق من البريد الإلكتروني'] };
      }
    });

    // التحقق من رقم الهاتف الفريد - Unique Phone Validation
    this.addCustomValidator('validateUniquePhone', async (value, fullData) => {
      try {
        const normalizedPhone = this.normalizePhoneNumber(value);
        const existingCustomer = await this.findCustomerByPhone(normalizedPhone, fullData.id);
        if (existingCustomer) {
          return { isValid: false, errors: ['رقم الهاتف مستخدم بالفعل'] };
        }
        return { isValid: true, errors: [] };
      } catch (error) {
        return { isValid: false, errors: ['خطأ في التحقق من رقم الهاتف'] };
      }
    });

    // التحقق من العمر - Age Validation
    this.addCustomValidator('validateAge', (value) => {
      if (!value) return { isValid: true, errors: [] };

      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 16) {
        return { isValid: false, errors: ['يجب أن يكون العميل أكبر من 16 سنة'] };
      }

      if (age > 120) {
        return { isValid: false, errors: ['العمر غير منطقي'] };
      }

      return { isValid: true, errors: [] };
    });

    // التحقق من العنوان - Address Validation
    this.addCustomValidator('validateAddress', (address) => {
      if (!address || typeof address !== 'object') {
        return { isValid: false, errors: ['العنوان مطلوب'] };
      }

      const requiredFields = ['street', 'city', 'country'];
      const missingFields = requiredFields.filter(
        (field) => !address[field] || address[field].trim() === ''
      );

      if (missingFields.length > 0) {
        return {
          isValid: false,
          errors: [`الحقول التالية مطلوبة في العنوان: ${missingFields.join(', ')}`],
        };
      }

      return { isValid: true, errors: [] };
    });

    // التحقق من نوع العميل - Customer Type Validation
    this.addCustomValidator('validateCustomerType', (type) => {
      const validTypes = ['individual', 'business', 'vip'];
      if (!validTypes.includes(type)) {
        return { isValid: false, errors: ['نوع العميل غير صحيح'] };
      }
      return { isValid: true, errors: [] };
    });

    // التحقق من مستوى الولاء - Customer Tier Validation
    this.addCustomValidator('validateCustomerTier', (tier) => {
      const validTiers = ['bronze', 'silver', 'gold', 'platinum'];
      if (!validTiers.includes(tier)) {
        return { isValid: false, errors: ['مستوى الولاء غير صحيح'] };
      }
      return { isValid: true, errors: [] };
    });

    // التحقق من حالة العميل - Customer Status Validation
    this.addCustomValidator('validateCustomerStatus', (status) => {
      const validStatuses = ['active', 'inactive', 'blocked', 'pending'];
      if (!validStatuses.includes(status)) {
        return { isValid: false, errors: ['حالة العميل غير صحيحة'] };
      }
      return { isValid: true, errors: [] };
    });
  }

  // البحث عن عميل بالبريد الإلكتروني - Find Customer by Email
  async findCustomerByEmail(email, excludeId = null) {
    try {
      const customers = await customerManager.getAllCustomers({});
      return customers.customers.find((c) => c.email === email && c.id !== excludeId);
    } catch (error) {
      console.error('خطأ في البحث عن البريد الإلكتروني:', error);
      return null;
    }
  }

  // البحث عن عميل برقم الهاتف - Find Customer by Phone
  async findCustomerByPhone(phone, excludeId = null) {
    try {
      const customers = await customerManager.getAllCustomers({});
      return customers.customers.find((c) => c.phone === phone && c.id !== excludeId);
    } catch (error) {
      console.error('خطأ في البحث عن رقم الهاتف:', error);
      return null;
    }
  }

  // التحقق من بيانات العميل - Validate Customer Data
  async validateCustomerData(customerData, options = {}) {
    const { isUpdate = false, validateDuplicates = true, customValidation = null } = options;

    // تعديل القواعد للتحديث - Adjust rules for update
    const rules = { ...CUSTOMER_VALIDATION_RULES };
    if (isUpdate) {
      Object.keys(rules).forEach((key) => {
        if (rules[key].required) {
          delete rules[key].required;
        }
      });
    }

    const result = this.validate(customerData, rules, {
      customValidation,
    });

    // التحقق من الأمان الإضافي - Additional security checks
    if (this.settings.preventXSS) {
      for (const [field, value] of Object.entries(result.sanitizedData)) {
        if (typeof value === 'string' && this.detectXSS(value)) {
          result.isValid = false;
          result.errors.push(`حقل ${field} يحتوي على محتوى مشبوه`);
        }
      }
    }

    return result;
  }
}

// تنظيف بيانات العميل - Sanitize Customer Data
export function sanitizeCustomerData(customerData, rules = CUSTOMER_SANITIZATION_RULES) {
  const validator = new CustomerValidator();
  return validator.sanitize(customerData, rules);
}

// التحقق من أمن البيانات - Security Data Checks
export class SecurityValidator {
  // فحص الثغرات الأمنية - Security Vulnerability Checks
  static performSecurityScan(data) {
    const vulnerabilities = [];

    for (const [field, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        // فحص XSS - XSS Check
        if (this.detectXSS(value)) {
          vulnerabilities.push({
            type: 'XSS',
            field,
            severity: 'high',
            message: `حقل ${field} يحتوي على محتوى XSS محتمل`,
          });
        }

        // فحص الحقن - Injection Check
        if (this.detectSQLInjection(value)) {
          vulnerabilities.push({
            type: 'INJECTION',
            field,
            severity: 'high',
            message: `حقل ${field} قد يحتوي على محاولة حقن`,
          });
        }

        // فحص البيانات الحساسة - Sensitive Data Check
        if (this.detectSensitiveData(value)) {
          vulnerabilities.push({
            type: 'SENSITIVE_DATA',
            field,
            severity: 'medium',
            message: `حقل ${field} قد يحتوي على بيانات حساسة`,
          });
        }
      }
    }

    return {
      isSecure: vulnerabilities.length === 0,
      vulnerabilities,
      securityScore: Math.max(0, 100 - vulnerabilities.length * 20),
    };
  }

  // فحص XSS - XSS Detection
  static detectXSS(value) {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<[^>]*on\w+="[^"]*"/gi,
      /eval\s*\(/gi,
      /expression\s*\(/gi,
    ];

    return xssPatterns.some((pattern) => pattern.test(value));
  }

  // فحص الحقن - Injection Detection
  static detectSQLInjection(value) {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/gi,
      /(\b(UNION|JOIN|WHERE|OR|AND)\b)/gi,
      /['";]/g,
      /--/g,
      /\/\*/g,
      /\*\//g,
    ];

    return sqlPatterns.some((pattern) => pattern.test(value));
  }

  // فحص البيانات الحساسة - Sensitive Data Detection
  static detectSensitiveData(value) {
    const sensitivePatterns = [
      /\b\d{16}\b/g, // أرقام بطاقات الائتمان
      /\b\d{3}-\d{2}-\d{4}\b/g, // أرقام الضمان الاجتماعي
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // بريد إلكتروني
      /\b\d{10,}\b/g, // أرقام طويلة محتملة
    ];

    return sensitivePatterns.some((pattern) => pattern.test(value));
  }
}

// إنشاء مثيلات التحقق - Create Validation Instances
export const dataValidator = new DataValidator();
export const customerValidator = new CustomerValidator();

// وظائف مساعدة للتحقق والمساعدة - Helper Functions
export const validateCustomer = (data, options = {}) => {
  return customerValidator.validateCustomerData(data, options);
};

export const sanitizeCustomer = (data) => {
  return sanitizeCustomerData(data);
};

export const securityCheck = (data) => {
  return SecurityValidator.performSecurityScan(data);
};

// تصدير جميع الوظائف - Export All Functions
export default {
  DataValidator,
  CustomerValidator,
  SecurityValidator,
  dataValidator,
  customerValidator,
  validateCustomer,
  sanitizeCustomer,
  securityCheck,
  VALIDATION_TYPES,
  SANITIZATION_RULES,
  CUSTOMER_VALIDATION_RULES,
  CUSTOMER_SANITIZATION_RULES,
  DEFAULT_VALIDATION_SETTINGS,
};
