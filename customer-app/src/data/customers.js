// بيانات العملاء - Customer Data Models
// ======================================

export const CUSTOMER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
  PENDING: 'pending'
};

export const CUSTOMER_TIERS = {
  BRONZE: 'bronze',
  SILVER: 'silver',
  GOLD: 'gold',
  PLATINUM: 'platinum'
};

export const CUSTOMER_TYPES = {
  INDIVIDUAL: 'individual',
  BUSINESS: 'business',
  VIP: 'vip'
};

// نموذج بيانات العميل - Customer Data Model
export const CUSTOMER_SCHEMA = {
  id: 'string',
  firstName: 'string',
  lastName: 'string',
  email: 'string',
  phone: 'string',
  alternativePhone: 'string',
  dateOfBirth: 'date',
  gender: 'enum:["male", "female"]',
  nationality: 'string',
  address: {
    street: 'string',
    city: 'string',
    state: 'string',
    postalCode: 'string',
    country: 'string',
    coordinates: {
      lat: 'number',
      lng: 'number'
    }
  },
  type: 'enum',
  tier: 'enum',
  status: 'enum',
  registrationDate: 'datetime',
  lastActivityDate: 'datetime',
  profileImage: 'string',
  notes: 'text',
  tags: 'array',
  customFields: 'object',
  preferences: {
    language: 'string',
    timezone: 'string',
    communicationMethod: 'enum:["email", "sms", "phone", "whatsapp"]',
    notifications: {
      email: 'boolean',
      sms: 'boolean',
      push: 'boolean',
      marketing: 'boolean'
    }
  },
  statistics: {
    totalPurchases: 'number',
    totalSpent: 'number',
    averageOrderValue: 'number',
    lastPurchaseDate: 'date',
    purchaseFrequency: 'number',
    loyaltyPoints: 'number'
  },
  documents: 'array',
  interactions: 'array',
  createdBy: 'string',
  updatedBy: 'string'
};

// بيانات العملاء التجريبية - Sample Customer Data
export const MOCK_CUSTOMERS = [
  {
    id: 'cust_001',
    firstName: 'أحمد',
    lastName: 'محمد علي',
    email: 'ahmed.mohamed@email.com',
    phone: '01012345678',
    alternativePhone: '01234567890',
    dateOfBirth: '1985-06-15',
    gender: 'male',
    nationality: 'مصري',
    address: {
      street: '15 شارع النيل',
      city: 'القاهرة',
      state: 'القاهرة',
      postalCode: '11511',
      country: 'مصر',
      coordinates: {
        lat: 30.0444,
        lng: 31.2357
      }
    },
    type: CUSTOMER_TYPES.INDIVIDUAL,
    tier: CUSTOMER_TIERS.GOLD,
    status: CUSTOMER_STATUSES.ACTIVE,
    registrationDate: '2024-01-15T10:30:00Z',
    lastActivityDate: '2024-11-10T14:22:00Z',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    notes: 'عميل مميز، يفضل التواصل عبر واتساب',
    tags: ['VIP', 'عميل مكرر', 'فريق المبيعات'],
    customFields: {
      referredBy: 'emp_001',
      companyName: '',
      taxNumber: ''
    },
    preferences: {
      language: 'ar',
      timezone: 'Africa/Cairo',
      communicationMethod: 'whatsapp',
      notifications: {
        email: true,
        sms: false,
        push: true,
        marketing: true
      }
    },
    statistics: {
      totalPurchases: 45,
      totalSpent: 15750.50,
      averageOrderValue: 350.01,
      lastPurchaseDate: '2024-11-08',
      purchaseFrequency: 3.2,
      loyaltyPoints: 2450
    },
    documents: [
      {
        id: 'doc_001',
        type: 'national_id',
        name: 'بطاقة الرقم القومي',
        url: 'https://example.com/docs/national_id.pdf',
        uploadDate: '2024-01-15T10:30:00Z'
      }
    ],
    interactions: [
      {
        id: 'int_001',
        type: 'call',
        description: 'مكالمة هاتفيه لمناقشة طلب جديد',
        date: '2024-11-10T14:22:00Z',
        userId: 'emp_001',
        outcome: 'success'
      }
    ],
    createdBy: 'emp_admin',
    updatedBy: 'emp_001'
  },
  {
    id: 'cust_002',
    firstName: 'فاطمة',
    lastName: 'أحمد حسن',
    email: 'fatma.hassan@email.com',
    phone: '01098765432',
    alternativePhone: '',
    dateOfBirth: '1990-03-22',
    gender: 'female',
    nationality: 'مصري',
    address: {
      street: '22 حي الزهور',
      city: 'الإسكندرية',
      state: 'الإسكندرية',
      postalCode: '21500',
      country: 'مصر',
      coordinates: {
        lat: 31.2001,
        lng: 29.9187
      }
    },
    type: CUSTOMER_TYPES.BUSINESS,
    tier: CUSTOMER_TIERS.SILVER,
    status: CUSTOMER_STATUSES.ACTIVE,
    registrationDate: '2024-02-20T09:15:00Z',
    lastActivityDate: '2024-11-12T11:45:00Z',
    profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b7a9?w=150&h=150&fit=crop&crop=face',
    notes: 'شركة مقاولات، تتطلب فواتير ضريبية',
    tags: ['عميل تجاري', 'مقاولات', 'فواتير ضريبية'],
    customFields: {
      referredBy: '',
      companyName: 'شركة حسن للمقاولات',
      taxNumber: '123-456-789'
    },
    preferences: {
      language: 'ar',
      timezone: 'Africa/Cairo',
      communicationMethod: 'email',
      notifications: {
        email: true,
        sms: true,
        push: false,
        marketing: false
      }
    },
    statistics: {
      totalPurchases: 28,
      totalSpent: 42300.75,
      averageOrderValue: 1510.74,
      lastPurchaseDate: '2024-11-12',
      purchaseFrequency: 2.1,
      loyaltyPoints: 1890
    },
    documents: [
      {
        id: 'doc_002',
        type: 'tax_certificate',
        name: 'شهادة ضريبية',
        url: 'https://example.com/docs/tax_cert.pdf',
        uploadDate: '2024-02-20T09:15:00Z'
      }
    ],
    interactions: [
      {
        id: 'int_002',
        type: 'email',
        description: 'إرسال عرض سعر جديد',
        date: '2024-11-12T11:45:00Z',
        userId: 'emp_002',
        outcome: 'sent'
      }
    ],
    createdBy: 'emp_admin',
    updatedBy: 'emp_002'
  },
  {
    id: 'cust_003',
    firstName: 'محمد',
    lastName: 'عبد الله سالم',
    email: 'mohamed.salem@email.com',
    phone: '01123456789',
    alternativePhone: '01555666777',
    dateOfBirth: '1978-11-08',
    gender: 'male',
    nationality: 'مصري',
    address: {
      street: '8 شارع جامعة الدول العربية',
      city: 'الجيزة',
      state: 'الجيزة',
      postalCode: '12511',
      country: 'مصر',
      coordinates: {
        lat: 30.0131,
        lng: 31.2089
      }
    },
    type: CUSTOMER_TYPES.VIP,
    tier: CUSTOMER_TIERS.PLATINUM,
    status: CUSTOMER_STATUSES.ACTIVE,
    registrationDate: '2023-12-01T16:20:00Z',
    lastActivityDate: '2024-11-13T09:30:00Z',
    profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    notes: 'عميل VIP، مدير عام شركة كبرى',
    tags: ['VIP', 'مدير عام', 'شركات كبرى', 'عميل مخلص'],
    customFields: {
      referredBy: '',
      companyName: 'شركة الصناعات الكبرى',
      taxNumber: '987-654-321'
    },
    preferences: {
      language: 'ar',
      timezone: 'Africa/Cairo',
      communicationMethod: 'phone',
      notifications: {
        email: true,
        sms: true,
        push: true,
        marketing: false
      }
    },
    statistics: {
      totalPurchases: 156,
      totalSpent: 187500.00,
      averageOrderValue: 1201.92,
      lastPurchaseDate: '2024-11-13',
      purchaseFrequency: 4.8,
      loyaltyPoints: 8750
    },
    documents: [
      {
        id: 'doc_003',
        type: 'business_license',
        name: 'رخصة تجارية',
        url: 'https://example.com/docs/business_license.pdf',
        uploadDate: '2023-12-01T16:20:00Z'
      }
    ],
    interactions: [
      {
        id: 'int_003',
        type: 'meeting',
        description: 'اجتماع لمناقشة شراكة طويلة المدى',
        date: '2024-11-13T09:30:00Z',
        userId: 'emp_admin',
        outcome: 'positive'
      }
    ],
    createdBy: 'emp_admin',
    updatedBy: 'emp_admin'
  }
];

// وظائف مساعدة للعملاء - Customer Helper Functions
export const getCustomerDisplayName = (customer) => {
  return `${customer.firstName} ${customer.lastName}`;
};

export const getCustomerFullAddress = (customer) => {
  const { address } = customer;
  return `${address.street}, ${address.city}, ${address.state}, ${address.country}`;
};

export const getCustomerStatusColor = (status) => {
  const colors = {
    [CUSTOMER_STATUSES.ACTIVE]: '#10B981', // أخضر
    [CUSTOMER_STATUSES.INACTIVE]: '#F59E0B', // برتقالي
    [CUSTOMER_STATUSES.BLOCKED]: '#EF4444', // أحمر
    [CUSTOMER_STATUSES.PENDING]: '#8B5CF6' // بنفسجي
  };
  return colors[status] || '#6B7280';
};

export const getCustomerTierColor = (tier) => {
  const colors = {
    [CUSTOMER_TIERS.BRONZE]: '#CD7F32',
    [CUSTOMER_TIERS.SILVER]: '#C0C0C0',
    [CUSTOMER_TIERS.GOLD]: '#FFD700',
    [CUSTOMER_TIERS.PLATINUM]: '#E5E4E2'
  };
  return colors[tier] || '#6B7280';
};

export const calculateCustomerMetrics = (customers) => {
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === CUSTOMER_STATUSES.ACTIVE).length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.statistics.totalSpent, 0);
  const averageOrderValue = customers.length > 0 
    ? customers.reduce((sum, customer) => sum + customer.statistics.averageOrderValue, 0) / customers.length 
    : 0;

  return {
    totalCustomers,
    activeCustomers,
    totalRevenue,
    averageOrderValue,
    conversionRate: activeCustomers / totalCustomers * 100
  };
};

export const searchCustomers = (customers, query) => {
  const searchTerm = query.toLowerCase().trim();
  
  if (!searchTerm) return customers;
  
  return customers.filter(customer => {
    const fullName = getCustomerDisplayName(customer).toLowerCase();
    const email = customer.email.toLowerCase();
    const phone = customer.phone;
    const company = customer.customFields?.companyName?.toLowerCase() || '';
    
    return fullName.includes(searchTerm) ||
           email.includes(searchTerm) ||
           phone.includes(searchTerm) ||
           company.includes(searchTerm);
  });
};

export const filterCustomersByStatus = (customers, status) => {
  if (!status || status === 'all') return customers;
  return customers.filter(customer => customer.status === status);
};

export const filterCustomersByTier = (customers, tier) => {
  if (!tier || tier === 'all') return customers;
  return customers.filter(customer => customer.tier === tier);
};

export const sortCustomersByField = (customers, field, direction = 'asc') => {
  return [...customers].sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];
    
    // Handle nested fields
    if (field.includes('.')) {
      const fields = field.split('.');
      aValue = fields.reduce((obj, key) => obj?.[key], a);
      bValue = fields.reduce((obj, key) => obj?.[key], b);
    }
    
    // Handle different data types
    if (field === 'registrationDate' || field === 'lastActivityDate' || field === 'lastPurchaseDate') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

export default MOCK_CUSTOMERS;