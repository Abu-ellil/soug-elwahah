// نظام تصدير واستيراد البيانات - Data Export/Import System
// =========================================================

import * as FileSystem from 'expo-file-system';
import { Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import XLSX from 'xlsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';
import { customerManager } from './customerManager';
import { t } from './localization';

// أنواع الملفات المدعومة - Supported File Types
export const SUPPORTED_FORMATS = {
  CSV: 'csv',
  JSON: 'json',
  EXCEL: 'xlsx',
  PDF: 'pdf',
  XML: 'xml',
};

// أنواع البيانات للتصدير - Data Types for Export
export const EXPORT_TYPES = {
  CUSTOMERS: 'customers',
  ALL_DATA: 'all_data',
  BACKUP: 'backup',
  REPORT: 'report',
};

// إعدادات التصدير - Export Settings
export const EXPORT_SETTINGS = {
  MAX_RECORDS: 10000,
  CHUNK_SIZE: 1000,
  TIMEOUT: 30000,
};

// فئة تصدير البيانات - Data Export Class
export class DataExporter {
  constructor() {
    this.exportPath = `${Paths.cache.uri}exports/`;
    this.ensureExportDirectory();
  }

  // التأكد من وجود مجلد التصدير - Ensure Export Directory Exists
  async ensureExportDirectory() {
    const dirInfo = await FileSystem.getInfoAsync(this.exportPath);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.exportPath, { intermediates: true });
    }
  }

  // تصدير العملاء بصيغة CSV - Export Customers as CSV
  async exportCustomersCSV(customers, filename = null) {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = filename || `customers_${timestamp}.csv`;
      const filePath = `${this.exportPath}${fileName}`;

      // إنشاء رأس الجدول - Create CSV headers
      const headers = [
        'الرقم التعريفي',
        'الاسم الأول',
        'اسم العائلة',
        'البريد الإلكتروني',
        'رقم الهاتف',
        'نوع العميل',
        'مستوى الولاء',
        'الحالة',
        'تاريخ التسجيل',
        'آخر نشاط',
        'إجمالي المصروفات',
        'عدد المشتريات',
        'متوسط قيمة الطلب',
        'نقاط الولاء',
      ];

      // تحويل البيانات إلى صيغة CSV - Convert data to CSV format
      const csvRows = [headers.join(',')];

      customers.forEach((customer) => {
        const row = [
          customer.id,
          customer.firstName || '',
          customer.lastName || '',
          customer.email || '',
          customer.phone || '',
          this.getTypeName(customer.type),
          this.getTierName(customer.tier),
          this.getStatusName(customer.status),
          this.formatDate(customer.registrationDate),
          this.formatDate(customer.lastActivityDate),
          customer.statistics?.totalSpent || 0,
          customer.statistics?.totalPurchases || 0,
          customer.statistics?.averageOrderValue || 0,
          customer.statistics?.loyaltyPoints || 0,
        ];

        // تنظيف البيانات من الفواصل والأقواس - Clean data from commas and quotes
        const cleanedRow = row.map((field) => {
          if (typeof field === 'string') {
            return `"${field.replace(/"/g, '""')}"`;
          }
          return field;
        });

        csvRows.push(cleanedRow.join(','));
      });

      const csvContent = csvRows.join('\n');

      // حفظ الملف - Save file
      await FileSystem.writeAsStringAsync(filePath, csvContent, {
        encoding: 'utf8',
      });

      return {
        success: true,
        filePath,
        fileName,
        recordCount: customers.length,
        format: 'CSV',
      };
    } catch (error) {
      console.error('خطأ في تصدير CSV:', error);
      throw new Error(`فشل في تصدير البيانات: ${error.message}`);
    }
  }

  // تصدير العملاء بصيغة JSON - Export Customers as JSON
  async exportCustomersJSON(customers, filename = null) {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = filename || `customers_${timestamp}.json`;
      const filePath = `${this.exportPath}${fileName}`;

      // إعداد بيانات التصدير - Prepare export data
      const exportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          totalRecords: customers.length,
          exportFormat: 'JSON',
          version: '1.0',
          generatedBy: 'نظام إدارة العملاء',
        },
        customers: customers.map((customer) => ({
          ...customer,
          exportDate: new Date().toISOString(),
        })),
      };

      const jsonContent = JSON.stringify(exportData, null, 2);

      // حفظ الملف - Save file
      await FileSystem.writeAsStringAsync(filePath, jsonContent, {
        encoding: 'utf8',
      });

      return {
        success: true,
        filePath,
        fileName,
        recordCount: customers.length,
        format: 'JSON',
      };
    } catch (error) {
      console.error('خطأ في تصدير JSON:', error);
      throw new Error(`فشل في تصدير البيانات: ${error.message}`);
    }
  }

  // تصدير العملاء بصيغة Excel - Export Customers as Excel
  async exportCustomersExcel(customers, filename = null) {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = filename || `customers_${timestamp}.xlsx`;
      const filePath = `${this.exportPath}${fileName}`;

      // إنشاء ورقة العمل - Create worksheet
      const ws = XLSX.utils.json_to_sheet(
        customers.map((customer) => ({
          'الرقم التعريفي': customer.id,
          'الاسم الأول': customer.firstName,
          'اسم العائلة': customer.lastName,
          'البريد الإلكتروني': customer.email,
          'رقم الهاتف': customer.phone,
          'نوع العميل': this.getTypeName(customer.type),
          'مستوى الولاء': this.getTierName(customer.tier),
          الحالة: this.getStatusName(customer.status),
          'تاريخ التسجيل': this.formatDate(customer.registrationDate),
          'آخر نشاط': this.formatDate(customer.lastActivityDate),
          'إجمالي المصروفات': customer.statistics?.totalSpent || 0,
          'عدد المشتريات': customer.statistics?.totalPurchases || 0,
          'متوسط قيمة الطلب': customer.statistics?.averageOrderValue || 0,
          'نقاط الولاء': customer.statistics?.loyaltyPoints || 0,
        }))
      );

      // إنشاء الكتاب - Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'العملاء');

      // كتابة الملف - Write file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
      const base64Data = Buffer.from(excelBuffer, 'base64').toString('base64');

      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: 'base64',
      });

      return {
        success: true,
        filePath,
        fileName,
        recordCount: customers.length,
        format: 'Excel',
      };
    } catch (error) {
      console.error('خطأ في تصدير Excel:', error);
      throw new Error(`فشل في تصدير البيانات: ${error.message}`);
    }
  }

  // تصدير تقرير PDF - Export PDF Report
  async exportCustomersPDF(customers, filename = null) {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = filename || `customers_report_${timestamp}.pdf`;
      const filePath = `${this.exportPath}${fileName}`;

      // إنشاء محتوى HTML - Create HTML content
      const htmlContent = this.generatePDFHTML(customers);

      // إنشاء ملف PDF - Create PDF file
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false,
      });

      // نقل الملف إلى مجلد التصدير - Move file to export directory
      await FileSystem.moveAsync({
        from: uri,
        to: filePath,
      });

      return {
        success: true,
        filePath,
        fileName,
        recordCount: customers.length,
        format: 'PDF',
      };
    } catch (error) {
      console.error('خطأ في تصدير PDF:', error);
      throw new Error(`فشل في إنشاء التقرير: ${error.message}`);
    }
  }

  // تصدير نسخة احتياطية شاملة - Export Comprehensive Backup
  async exportFullBackup() {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `full_backup_${timestamp}.json`;
      const filePath = `${this.exportPath}${fileName}`;

      // جمع جميع البيانات - Collect all data
      const backupData = {
        metadata: {
          backupType: 'full_backup',
          exportedAt: new Date().toISOString(),
          version: '1.0',
          generatedBy: 'نظام إدارة العملاء',
        },
        customers: await customerManager.getAllCustomers({}), // Get all customers
        settings: await this.getApplicationSettings(),
        statistics: customerManager.getCustomersStatistics(),
      };

      const jsonContent = JSON.stringify(backupData, null, 2);

      await FileSystem.writeAsStringAsync(filePath, jsonContent, {
        encoding: 'utf8',
      });

      return {
        success: true,
        filePath,
        fileName,
        backupSize: jsonContent.length,
        format: 'Full Backup',
      };
    } catch (error) {
      console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
      throw new Error(`فشل في إنشاء النسخة الاحتياطية: ${error.message}`);
    }
  }

  // مشاركة الملف - Share File
  async shareFile(filePath, fileName, title = 'تقرير العملاء') {
    try {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error('مشاركة الملفات غير متاحة على هذا الجهاز');
      }

      await Sharing.shareAsync(filePath, {
        mimeType: this.getMimeType(fileName),
        dialogTitle: title,
      });

      return { success: true };
    } catch (error) {
      console.error('خطأ في مشاركة الملف:', error);
      throw new Error(`فشل في مشاركة الملف: ${error.message}`);
    }
  }

  // نسخ البيانات إلى الحافظة - Copy Data to Clipboard
  async copyToClipboard(data, format = 'text') {
    try {
      let content;

      switch (format) {
        case 'json':
          content = JSON.stringify(data, null, 2);
          break;
        case 'csv':
          content = this.convertToCSV(data);
          break;
        default:
          content = String(data);
      }

      await Clipboard.setStringAsync(content);
      return { success: true };
    } catch (error) {
      console.error('خطأ في نسخ البيانات:', error);
      throw new Error(`فشل في نسخ البيانات: ${error.message}`);
    }
  }

  // إنشاء محتوى HTML للتقرير - Generate HTML Content for Report
  generatePDFHTML(customers) {
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter((c) => c.status === 'active').length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.statistics?.totalSpent || 0), 0);

    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تقرير العملاء</title>
        <style>
          body { font-family: 'Arial', sans-serif; direction: rtl; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .summary { display: flex; justify-content: space-around; margin-bottom: 30px; }
          .stat { text-align: center; padding: 15px; background: #f5f5f5; border-radius: 8px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #333; }
          .stat-label { font-size: 14px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 12px; text-align: right; }
          th { background-color: #f2f2f2; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير العملاء</h1>
          <p>تم إنشاء التقرير في: ${new Date().toLocaleDateString('ar-EG')}</p>
        </div>
        
        <div class="summary">
          <div class="stat">
            <div class="stat-value">${totalCustomers}</div>
            <div class="stat-label">إجمالي العملاء</div>
          </div>
          <div class="stat">
            <div class="stat-value">${activeCustomers}</div>
            <div class="stat-label">العملاء النشطون</div>
          </div>
          <div class="stat">
            <div class="stat-value">${totalRevenue.toLocaleString('ar-EG')} جنيه</div>
            <div class="stat-label">إجمالي الإيرادات</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>الرقم التعريفي</th>
              <th>الاسم</th>
              <th>البريد الإلكتروني</th>
              <th>رقم الهاتف</th>
              <th>نوع العميل</th>
              <th>الحالة</th>
              <th>إجمالي المصروفات</th>
            </tr>
          </thead>
          <tbody>
            ${customers
              .map(
                (customer) => `
              <tr>
                <td>${customer.id}</td>
                <td>${customer.firstName} ${customer.lastName}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${this.getTypeName(customer.type)}</td>
                <td>${this.getStatusName(customer.status)}</td>
                <td>${(customer.statistics?.totalSpent || 0).toLocaleString('ar-EG')} جنيه</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>تم إنشاء هذا التقرير بواسطة نظام إدارة العملاء</p>
        </div>
      </body>
      </html>
    `;
  }

  // الحصول على إعدادات التطبيق - Get Application Settings
  async getApplicationSettings() {
    try {
      const settings = await AsyncStorage.getItem('app_settings');
      return settings ? JSON.parse(settings) : {};
    } catch (error) {
      console.error('خطأ في الحصول على الإعدادات:', error);
      return {};
    }
  }

  // تحويل البيانات إلى CSV - Convert Data to CSV
  convertToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  // الحصول على نوع MIME - Get MIME Type
  getMimeType(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    const mimeTypes = {
      csv: 'text/csv',
      json: 'application/json',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pdf: 'application/pdf',
    };
    return mimeTypes[extension] || 'application/octet-stream';
  }

  // تنسيق التاريخ - Format Date
  formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ar-EG');
  }

  // الحصول على اسم النوع - Get Type Name
  getTypeName(type) {
    const names = {
      individual: 'فردي',
      business: 'تجاري',
      vip: 'VIP',
    };
    return names[type] || type;
  }

  // الحصول على اسم المستوى - Get Tier Name
  getTierName(tier) {
    const names = {
      bronze: 'برونزي',
      silver: 'فضي',
      gold: 'ذهبي',
      platinum: 'بلاتيني',
    };
    return names[tier] || tier;
  }

  // الحصول على اسم الحالة - Get Status Name
  getStatusName(status) {
    const names = {
      active: 'نشط',
      inactive: 'غير نشط',
      blocked: 'محظور',
      pending: 'في الانتظار',
    };
    return names[status] || status;
  }
}

// فئة استيراد البيانات - Data Import Class
export class DataImporter {
  constructor() {
    this.importPath = `${Paths.cache.uri}imports/`;
    this.ensureImportDirectory();
  }

  // التأكد من وجود مجلد الاستيراد - Ensure Import Directory Exists
  async ensureImportDirectory() {
    const dirInfo = await FileSystem.getInfoAsync(this.importPath);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(this.importPath, { intermediates: true });
    }
  }

  // استيراد البيانات من ملف - Import Data from File
  async importFromFile(fileUri, format) {
    try {
      switch (format) {
        case SUPPORTED_FORMATS.JSON:
          return await this.importFromJSON(fileUri);
        case SUPPORTED_FORMATS.CSV:
          return await this.importFromCSV(fileUri);
        case SUPPORTED_FORMATS.EXCEL:
          return await this.importFromExcel(fileUri);
        default:
          throw new Error(`صيغة الملف غير مدعومة: ${format}`);
      }
    } catch (error) {
      console.error('خطأ في استيراد البيانات:', error);
      throw new Error(`فشل في استيراد البيانات: ${error.message}`);
    }
  }

  // استيراد من JSON - Import from JSON
  async importFromJSON(fileUri) {
    try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const data = JSON.parse(fileContent);

      // التحقق من صحة البيانات - Validate data structure
      if (data.customers && Array.isArray(data.customers)) {
        return {
          success: true,
          format: 'JSON',
          recordCount: data.customers.length,
          customers: data.customers,
        };
      } else {
        throw new Error('تنسيق ملف JSON غير صحيح');
      }
    } catch (error) {
      throw new Error(`فشل في قراءة ملف JSON: ${error.message}`);
    }
  }

  // استيراد من CSV - Import from CSV
  async importFromCSV(fileUri) {
    try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const lines = fileContent.split('\n').filter((line) => line.trim());

      if (lines.length < 2) {
        throw new Error('ملف CSV فارغ أو لا يحتوي على بيانات');
      }

      // تحليل الرأس - Parse header
      const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));

      // تحليل البيانات - Parse data
      const customers = [];
      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length === headers.length) {
          const customer = this.mapCSVToCustomer(headers, values);
          if (customer) {
            customers.push(customer);
          }
        }
      }

      return {
        success: true,
        format: 'CSV',
        recordCount: customers.length,
        customers,
      };
    } catch (error) {
      throw new Error(`فشل في قراءة ملف CSV: ${error.message}`);
    }
  }

  // استيراد من Excel - Import from Excel
  async importFromExcel(fileUri) {
    try {
      const base64Data = await FileSystem.readAsStringAsync(fileUri, {
        encoding: 'base64',
      });

      const workbook = XLSX.read(base64Data, { type: 'base64' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const customers = XLSX.utils.sheet_to_json(worksheet);

      return {
        success: true,
        format: 'Excel',
        recordCount: customers.length,
        customers: customers.map((row) => this.mapExcelToCustomer(row)),
      };
    } catch (error) {
      throw new Error(`فشل في قراءة ملف Excel: ${error.message}`);
    }
  }

  // تحليل سطر CSV - Parse CSV Line
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  }

  // ربط بيانات CSV بالعميل - Map CSV Data to Customer
  mapCSVToCustomer(headers, values) {
    try {
      const customer = {};

      headers.forEach((header, index) => {
        const value = values[index]?.replace(/"/g, '') || '';

        switch (header.trim()) {
          case 'الاسم الأول':
            customer.firstName = value;
            break;
          case 'اسم العائلة':
            customer.lastName = value;
            break;
          case 'البريد الإلكتروني':
            customer.email = value;
            break;
          case 'رقم الهاتف':
            customer.phone = value;
            break;
          case 'نوع العميل':
            customer.type = this.getTypeFromName(value);
            break;
        }
      });

      // التحقق من الحقول الإلزامية - Check required fields
      if (!customer.firstName || !customer.lastName || !customer.email) {
        return null;
      }

      return {
        ...customer,
        id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        registrationDate: new Date().toISOString(),
        status: 'active',
      };
    } catch (error) {
      console.error('خطأ في ربط بيانات CSV:', error);
      return null;
    }
  }

  // ربط بيانات Excel بالعميل - Map Excel Data to Customer
  mapExcelToCustomer(row) {
    try {
      return {
        id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        firstName: row['الاسم الأول'] || '',
        lastName: row['اسم العائلة'] || '',
        email: row['البريد الإلكتروني'] || '',
        phone: row['رقم الهاتف'] || '',
        type: this.getTypeFromName(row['نوع العميل'] || 'individual'),
        registrationDate: new Date().toISOString(),
        status: 'active',
      };
    } catch (error) {
      console.error('خطأ في ربط بيانات Excel:', error);
      return null;
    }
  }

  // الحصول على النوع من الاسم - Get Type from Name
  getTypeFromName(name) {
    const typeMap = {
      فردي: 'individual',
      تجاري: 'business',
      vip: 'vip',
      individual: 'individual',
      business: 'business',
    };
    return typeMap[name.toLowerCase()] || 'individual';
  }
}

// إنشاء مثيلات التصدير والاستيراد - Create Export/Import Instances
export const dataExporter = new DataExporter();
export const dataImporter = new DataImporter();

// وظائف مساعدة للتصدير والاستيراد - Helper Functions for Export/Import
export const exportCustomers = async (customers, format, options = {}) => {
  try {
    let result;

    switch (format) {
      case SUPPORTED_FORMATS.CSV:
        result = await dataExporter.exportCustomersCSV(customers, options.filename);
        break;
      case SUPPORTED_FORMATS.JSON:
        result = await dataExporter.exportCustomersJSON(customers, options.filename);
        break;
      case SUPPORTED_FORMATS.EXCEL:
        result = await dataExporter.exportCustomersExcel(customers, options.filename);
        break;
      case SUPPORTED_FORMATS.PDF:
        result = await dataExporter.exportCustomersPDF(customers, options.filename);
        break;
      default:
        throw new Error(`صيغة التصدير غير مدعومة: ${format}`);
    }

    return result;
  } catch (error) {
    console.error('خطأ في تصدير العملاء:', error);
    throw error;
  }
};

export const importCustomers = async (fileUri, format) => {
  try {
    return await dataImporter.importFromFile(fileUri, format);
  } catch (error) {
    console.error('خطأ في استيراد العملاء:', error);
    throw error;
  }
};

export const shareExportedFile = async (filePath, fileName, title) => {
  try {
    return await dataExporter.shareFile(filePath, fileName, title);
  } catch (error) {
    console.error('خطأ في مشاركة الملف:', error);
    throw error;
  }
};

export const copyDataToClipboard = async (data, format) => {
  try {
    return await dataExporter.copyToClipboard(data, format);
  } catch (error) {
    console.error('خطأ في نسخ البيانات:', error);
    throw error;
  }
};

export default {
  DataExporter,
  DataImporter,
  dataExporter,
  dataImporter,
  exportCustomers,
  importCustomers,
  shareExportedFile,
  copyDataToClipboard,
};
