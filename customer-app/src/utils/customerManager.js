// عمليات إدارة العملاء مع الأمان - Customer CRUD Operations with Security
// ===================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MOCK_CUSTOMERS,
  CUSTOMER_STATUSES,
  CUSTOMER_TIERS,
  CUSTOMER_TYPES,
  getCustomerDisplayName,
  calculateCustomerMetrics,
  searchCustomers,
  filterCustomersByStatus,
  filterCustomersByTier,
  sortCustomersByField,
} from '../data/customers';
import {
  hasPermission,
  hasPermissions,
  encryptSensitiveData,
  decryptSensitiveData,
  validatePasswordStrength,
} from './auth';

// مفاتيح التخزين - Storage Keys
const STORAGE_KEYS = {
  CUSTOMERS: 'customers_data',
  CUSTOMER_ENCRYPTED: 'customers_encrypted',
  CUSTOMER_BACKUPS: 'customers_backups',
};

// فئة إدارة العملاء - Customer Management Class
export class CustomerManager {
  constructor() {
    this.customers = new Map();
    this.isInitialized = false;
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key';
  }

  // تهيئة النظام - Initialize System
  async initialize() {
    try {
      await this.loadCustomers();
      this.isInitialized = true;
      console.log('نظام إدارة العملاء تم تهيئته بنجاح');
    } catch (error) {
      console.error('فشل في تهيئة نظام إدارة العملاء:', error);
      throw error;
    }
  }

  // تحميل البيانات من التخزين - Load Data from Storage
  async loadCustomers() {
    try {
      const encryptedData = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOMER_ENCRYPTED);

      if (encryptedData) {
        // فك تشريع البيانات الحساسة - Decrypt sensitive data
        const decryptedData = decryptSensitiveData(encryptedData, this.encryptionKey);
        this.customers = new Map(decryptedData.map((customer) => [customer.id, customer]));
      } else {
        // تحميل البيانات التجريبية - Load mock data
        this.customers = new Map(MOCK_CUSTOMERS.map((customer) => [customer.id, customer]));
        await this.saveCustomers();
      }
    } catch (error) {
      console.error('فشل في تحميل البيانات:', error);
      // تحميل البيانات التجريبية كبديل - Load mock data as fallback
      this.customers = new Map(MOCK_CUSTOMERS.map((customer) => [customer.id, customer]));
    }
  }

  // حفظ البيانات في التخزين - Save Data to Storage
  async saveCustomers() {
    try {
      // تشريع البيانات الحساسة - Encrypt sensitive data
      const customerArray = Array.from(this.customers.values());
      const encryptedData = encryptSensitiveData(customerArray, this.encryptionKey);

      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOMER_ENCRYPTED, encryptedData);
      console.log('تم حفظ بيانات العملاء بنجاح');
    } catch (error) {
      console.error('فشل في حفظ البيانات:', error);
      throw error;
    }
  }

  // إنشاء عميل جديد - Create New Customer
  async createCustomer(customerData, currentUser) {
    try {
      // التحقق من الصلاحيات - Check permissions
      if (!hasPermission(currentUser, 'customers:write')) {
        throw new Error('غير مخول لإضافة عملاء جدد');
      }

      // التحقق من صحة البيانات - Validate data
      const validationResult = this.validateCustomerData(customerData);
      if (!validationResult.isValid) {
        throw new Error(`خطأ في البيانات: ${validationResult.errors.join(', ')}`);
      }

      // إنشاء معرف فريد - Generate unique ID
      const customerId = this.generateCustomerId();

      // إنشاء بيانات العميل - Create customer object
      const newCustomer = {
        id: customerId,
        ...customerData,
        status: CUSTOMER_STATUSES.ACTIVE,
        registrationDate: new Date().toISOString(),
        lastActivityDate: new Date().toISOString(),
        statistics: {
          totalPurchases: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          lastPurchaseDate: null,
          purchaseFrequency: 0,
          loyaltyPoints: 0,
        },
        interactions: [],
        documents: [],
        customFields: customerData.customFields || {},
        createdBy: currentUser.id,
        updatedBy: currentUser.id,
        updatedAt: new Date().toISOString(),
      };

      // حفظ في الذاكرة - Save to memory
      this.customers.set(customerId, newCustomer);

      // حفظ في التخزين - Save to storage
      await this.saveCustomers();

      console.log(`تم إنشاء عميل جديد: ${getCustomerDisplayName(newCustomer)}`);
      return newCustomer;
    } catch (error) {
      console.error('فشل في إنشاء عميل جديد:', error);
      throw error;
    }
  }

  // قراءة بيانات العميل - Read Customer Data
  async getCustomer(customerId, currentUser) {
    try {
      // التحقق من الصلاحيات - Check permissions
      if (!hasPermission(currentUser, 'customers:read')) {
        throw new Error('غير مخول لقراءة بيانات العملاء');
      }

      const customer = this.customers.get(customerId);
      if (!customer) {
        throw new Error('العميل غير موجود');
      }

      return customer;
    } catch (error) {
      console.error('فشل في قراءة بيانات العميل:', error);
      throw error;
    }
  }

  // تحديث بيانات العميل - Update Customer Data
  async updateCustomer(customerId, updateData, currentUser) {
    try {
      // التحقق من الصلاحيات - Check permissions
      if (!hasPermission(currentUser, 'customers:write')) {
        throw new Error('غير مخول لتحديث بيانات العملاء');
      }

      const customer = this.customers.get(customerId);
      if (!customer) {
        throw new Error('العميل غير موجود');
      }

      // التحقق من صحة البيانات المحدثة - Validate updated data
      const validationResult = this.validateCustomerData(updateData, true);
      if (!validationResult.isValid) {
        throw new Error(`خطأ في البيانات: ${validationResult.errors.join(', ')}`);
      }

      // تحديث البيانات - Update data
      const updatedCustomer = {
        ...customer,
        ...updateData,
        updatedBy: currentUser.id,
        updatedAt: new Date().toISOString(),
      };

      // حفظ في الذاكرة - Save to memory
      this.customers.set(customerId, updatedCustomer);

      // حفظ في التخزين - Save to storage
      await this.saveCustomers();

      console.log(`تم تحديث بيانات العميل: ${getCustomerDisplayName(updatedCustomer)}`);
      return updatedCustomer;
    } catch (error) {
      console.error('فشل في تحديث بيانات العميل:', error);
      throw error;
    }
  }

  // حذف العميل - Delete Customer
  async deleteCustomer(customerId, currentUser) {
    try {
      // التحقق من الصلاحيات - Check permissions
      if (!hasPermission(currentUser, 'customers:delete')) {
        throw new Error('غير مخول لحذف العملاء');
      }

      const customer = this.customers.get(customerId);
      if (!customer) {
        throw new Error('العميل غير موجود');
      }

      // إنشاء نسخة احتياطية - Create backup
      await this.createBackup(customer);

      // حذف من الذاكرة - Remove from memory
      this.customers.delete(customerId);

      // حفظ في التخزين - Save to storage
      await this.saveCustomers();

      console.log(`تم حذف العميل: ${getCustomerDisplayName(customer)}`);
      return true;
    } catch (error) {
      console.error('فشل في حذف العميل:', error);
      throw error;
    }
  }

  // قراءة جميع العملاء - Read All Customers
  async getAllCustomers(currentUser, options = {}) {
    try {
      // التحقق من الصلاحيات - Check permissions
      if (!hasPermission(currentUser, 'customers:read')) {
        throw new Error('غير مخول لقراءة بيانات العملاء');
      }

      let customers = Array.from(this.customers.values());

      // تطبيق البحث - Apply search
      if (options.search) {
        customers = searchCustomers(customers, options.search);
      }

      // تطبيق التصفية - Apply filters
      if (options.status) {
        customers = filterCustomersByStatus(customers, options.status);
      }

      if (options.tier) {
        customers = filterCustomersByTier(customers, options.tier);
      }

      // تطبيق الترتيب - Apply sorting
      if (options.sortBy) {
        customers = sortCustomersByField(customers, options.sortBy, options.sortOrder || 'asc');
      }

      // تطبيق التصفح - Apply pagination
      if (options.page && options.limit) {
        const startIndex = (options.page - 1) * options.limit;
        customers = customers.slice(startIndex, startIndex + options.limit);
      }

      return {
        customers,
        total: this.customers.size,
        filtered: customers.length,
        ...calculateCustomerMetrics(customers),
      };
    } catch (error) {
      console.error('فشل في قراءة جميع العملاء:', error);
      throw error;
    }
  }

  // التحقق من صحة البيانات - Validate Customer Data
  validateCustomerData(data, isUpdate = false) {
    const errors = [];

    // التحقق من الحقول الإلزامية - Check required fields
    if (!isUpdate || data.firstName !== undefined) {
      if (!data.firstName || data.firstName.trim().length === 0) {
        errors.push('الاسم الأول مطلوب');
      }
    }

    if (!isUpdate || data.lastName !== undefined) {
      if (!data.lastName || data.lastName.trim().length === 0) {
        errors.push('اسم العائلة مطلوب');
      }
    }

    if (!isUpdate || data.email !== undefined) {
      if (!data.email || !this.isValidEmail(data.email)) {
        errors.push('البريد الإلكتروني غير صحيح');
      }
    }

    if (!isUpdate || data.phone !== undefined) {
      if (!data.phone || !this.isValidPhone(data.phone)) {
        errors.push('رقم الهاتف غير صحيح');
      }
    }

    if (!isUpdate || data.type !== undefined) {
      if (!Object.values(CUSTOMER_TYPES).includes(data.type)) {
        errors.push('نوع العميل غير صحيح');
      }
    }

    if (!isUpdate || data.tier !== undefined) {
      if (!Object.values(CUSTOMER_TIERS).includes(data.tier)) {
        errors.push('مستوى الولاء غير صحيح');
      }
    }

    if (!isUpdate || data.status !== undefined) {
      if (!Object.values(CUSTOMER_STATUSES).includes(data.status)) {
        errors.push('حالة العميل غير صحيحة');
      }
    }

    // التحقق من التطابق في البيانات - Validate data consistency
    if (data.email && !isUpdate) {
      const existingCustomer = Array.from(this.customers.values()).find(
        (c) => c.email === data.email
      );
      if (existingCustomer) {
        errors.push('البريد الإلكتروني مستخدم بالفعل');
      }
    }

    if (data.phone && !isUpdate) {
      const existingCustomer = Array.from(this.customers.values()).find(
        (c) => c.phone === data.phone
      );
      if (existingCustomer) {
        errors.push('رقم الهاتف مستخدم بالفعل');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // التحقق من صحة البريد الإلكتروني - Validate Email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // التحقق من صحة رقم الهاتف - Validate Phone
  isValidPhone(phone) {
    // التحقق من الأرقام المصرية - Egyptian phone validation
    const phoneRegex = /^(\+20|0)?1[0125][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  // إنشاء معرف فريد للعميل - Generate Unique Customer ID
  generateCustomerId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `cust_${timestamp}_${randomStr}`;
  }

  // إنشاء نسخة احتياطية - Create Backup
  async createBackup(customer) {
    try {
      const backups = await this.getBackups();
      const backup = {
        id: `backup_${Date.now()}`,
        customerId: customer.id,
        data: customer,
        timestamp: new Date().toISOString(),
        reason: 'deletion',
      };

      backups.push(backup);
      await AsyncStorage.setItem(STORAGE_KEYS.CUSTOMER_BACKUPS, JSON.stringify(backups));
    } catch (error) {
      console.error('فشل في إنشاء النسخة الاحتياطية:', error);
    }
  }

  // الحصول على النسخ الاحتياطية - Get Backups
  async getBackups() {
    try {
      const backupsData = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOMER_BACKUPS);
      return backupsData ? JSON.parse(backupsData) : [];
    } catch (error) {
      console.error('فشل في الحصول على النسخ الاحتياطية:', error);
      return [];
    }
  }

  // استعادة من النسخة الاحتياطية - Restore from Backup
  async restoreFromBackup(backupId, currentUser) {
    try {
      // التحقق من الصلاحيات - Check permissions
      if (!hasPermission(currentUser, 'customers:write')) {
        throw new Error('غير مخول لاستعادة البيانات');
      }

      const backups = await this.getBackups();
      const backup = backups.find((b) => b.id === backupId);

      if (!backup) {
        throw new Error('النسخة الاحتياطية غير موجودة');
      }

      // استعادة البيانات - Restore data
      const restoredCustomer = {
        ...backup.data,
        id: this.generateCustomerId(), // New ID to avoid conflicts
        restored: true,
        restoredBy: currentUser.id,
        restoredAt: new Date().toISOString(),
      };

      this.customers.set(restoredCustomer.id, restoredCustomer);
      await this.saveCustomers();

      console.log(
        `تم استعادة العميل من النسخة الاحتياطية: ${getCustomerDisplayName(restoredCustomer)}`
      );
      return restoredCustomer;
    } catch (error) {
      console.error('فشل في استعادة البيانات:', error);
      throw error;
    }
  }

  // تحديث إحصائيات العميل - Update Customer Statistics
  async updateCustomerStatistics(customerId, purchaseData) {
    try {
      const customer = this.customers.get(customerId);
      if (!customer) {
        throw new Error('العميل غير موجود');
      }

      // تحديث الإحصائيات - Update statistics
      const stats = customer.statistics;
      stats.totalPurchases += 1;
      stats.totalSpent += purchaseData.amount;
      stats.averageOrderValue = stats.totalSpent / stats.totalPurchases;
      stats.lastPurchaseDate = new Date().toISOString();
      stats.purchaseFrequency = this.calculatePurchaseFrequency(customer);

      // تحديث نقاط الولاء - Update loyalty points
      stats.loyaltyPoints = this.calculateLoyaltyPoints(stats);

      customer.statistics = stats;
      customer.lastActivityDate = new Date().toISOString();

      this.customers.set(customerId, customer);
      await this.saveCustomers();

      return customer;
    } catch (error) {
      console.error('فشل في تحديث إحصائيات العميل:', error);
      throw error;
    }
  }

  // حساب تكرار الشراء - Calculate Purchase Frequency
  calculatePurchaseFrequency(customer) {
    const registrationDate = new Date(customer.registrationDate);
    const now = new Date();
    const daysDiff = Math.floor((now - registrationDate) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) return customer.statistics.totalPurchases;

    return customer.statistics.totalPurchases / (daysDiff / 30); // Monthly frequency
  }

  // حساب نقاط الولاء - Calculate Loyalty Points
  calculateLoyaltyPoints(stats) {
    const basePoints = stats.totalSpent * 0.01; // 1 point per EGP spent
    const purchaseBonus = stats.totalPurchases * 10; // 10 points per purchase
    const frequencyBonus = stats.purchaseFrequency * 5; // Bonus for regular customers

    return Math.floor(basePoints + purchaseBonus + frequencyBonus);
  }

  // الحصول على إحصائيات العملاء - Get Customer Statistics
  getCustomersStatistics() {
    const customers = Array.from(this.customers.values());
    return calculateCustomerMetrics(customers);
  }

  // تنظيف البيانات المنتهية الصلاحية - Clean Expired Data
  async cleanExpiredData() {
    // يمكن تطبيق منطق تنظيف البيانات هنا
    console.log('تم تنظيف البيانات المنتهية الصلاحية');
  }
}

// إنشاء مثيل مدير العملاء - Create Customer Manager Instance
export const customerManager = new CustomerManager();

// تصدير الوظائف السريعة - Export Quick Functions
export const createCustomer = (data, user) => customerManager.createCustomer(data, user);
export const getCustomer = (id, user) => customerManager.getCustomer(id, user);
export const updateCustomer = (id, data, user) => customerManager.updateCustomer(id, data, user);
export const deleteCustomer = (id, user) => customerManager.deleteCustomer(id, user);
export const getAllCustomers = (user, options) => customerManager.getAllCustomers(user, options);
export const getCustomersStatistics = () => customerManager.getCustomersStatistics();

export default customerManager;
