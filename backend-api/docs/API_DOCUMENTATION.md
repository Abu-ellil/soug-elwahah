# توثيق واجهة برمجة التطبيقات (API) - منصة السوق

## جدول المحتويات
- [معلومات أساسية](#معلومات-أساسية)
- [المصادقة والأمان](#المصادقة-والأمان)
- [نقاط النهاية المتاحة](#نقاط-النهاية-المتاحة)
- [نماذج البيانات](#نماذج-البيانات)
- [أكواد الحالة](#أكواد-الحالة) 
- [أمثلة الاستخدام](#أمثلة-الاستخدام)
- [معالجة الأخطاء](#معالجة-الأخطاء)

---

## معلومات أساسية

### معلومات عامة
- **اسم المشروع**: منصة السوق (ElSoug)
- **إصدار API**: v1
- **URL الأساسي**: `http://localhost:5000/api/v1`
- **نوع المحتوى**: `application/json`
- **ترميز الأحرف**: UTF-8

### الخصائص الرئيسية
- منصة تجارة إلكترونية محلية
- دعم المنتجات والخدمات
- نظام مصادقة بـ OTP
- إدارة المتاجر والقرى
- نظام الطلبات والمراجعات
- رفع الملفات والصور

### متطلبات النظام
- Node.js 16+
- MongoDB 4.4+
- Redis (للتخزين المؤقت)

---

## المصادقة والأمان

### نظام المصادقة
يستخدم النظام **JWT (JSON Web Tokens)** للمصادقة مع نظام **OTP** لتسجيل الدخول.

#### تدفق المصادقة
1. **إرسال OTP**: `POST /auth/send-otp`
2. **التحقق من OTP**: `POST /auth/verify-otp`
3. **إكمال الملف الشخصي**: `POST /auth/complete-profile`

#### أنواع المصادقة

| النوع | الوصف | الاستخدام |
|-------|--------|-----------|
| `Bearer Token` | رمز JWT في الهيدر | `Authorization: Bearer <token>` |
| `Cookie` | رمز JWT في الكوكيز | تلقائي من المتصفح |

#### أدوار المستخدمين

| الدور | الصلاحيات |
|-------|-----------|
| `user` | مستخدم عادي - تصفح وشراء |
| `seller` | بائع - إضافة منتجات وخدمات |
| `admin` | مدير - إدارة كاملة للنظام |

#### الحماية والأمان
- تشفير كلمات المرور بـ bcrypt
- حماية من CORS
- تحديد معدل الطلبات (Rate Limiting)
- تنظيف البيانات من XSS
- حماية من NoSQL Injection

---

## نقاط النهاية المتاحة

### 🔐 المصادقة (Authentication)
**المسار الأساسي**: `/api/v1/auth`

#### إرسال رمز OTP
```http
POST /auth/send-otp
```

**المعايير المطلوبة**:
```json
{
  "phone": "01234567890"
}
```

**الاستجابة المتوقعة**:
```json
{
  "success": true,
  "message": "تم إرسال رمز التحقق بنجاح",
  "data": {
    "phone": "01234567890",
    "expiresIn": 600
  }
}
```

#### التحقق من رمز OTP
```http
POST /auth/verify-otp
```

**المعايير المطلوبة**:
```json
{
  "phone": "01234567890",
  "otp": "123456"
}
```

**الاستجابة المتوقعة**:
```json
{
  "success": true,
  "message": "تم التحقق بنجاح",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "phone": "01234567890",
      "isProfileComplete": false
    }
  }
}
```

#### إكمال الملف الشخصي
```http
POST /auth/complete-profile
```
**المصادقة**: مطلوبة

**المعايير المطلوبة**:
```json
{
  "name": "أحمد محمد",
  "email": "ahmed@example.com",
  "village": "64f8a1b2c3d4e5f6a7b8c9d1"
}
```

#### الحصول على بيانات المستخدم الحالي
```http
GET /auth/me
```
**المصادقة**: مطلوبة

#### تحديث الملف الشخصي
```http
PUT /auth/update-profile
```
**المصادقة**: مطلوبة

#### تسجيل الخروج
```http
POST /auth/logout
```
**المصادقة**: مطلوبة

---

### 🛍️ المنتجات (Products)
**المسار الأساسي**: `/api/v1/products`

#### الحصول على جميع المنتجات
```http
GET /products
```

**معايير الاستعلام (Query Parameters)**:
| المعيار | النوع | الوصف | مثال |
|---------|-------|--------|------|
| `page` | Number | رقم الصفحة | `?page=1` |
| `limit` | Number | عدد العناصر | `?limit=10` |
| `category` | String | معرف الفئة | `?category=64f8a1b2c3d4e5f6a7b8c9d0` |
| `village` | String | معرف القرية | `?village=64f8a1b2c3d4e5f6a7b8c9d1` |
| `minPrice` | Number | أقل سعر | `?minPrice=100` |
| `maxPrice` | Number | أعلى سعر | `?maxPrice=1000` |
| `search` | String | البحث النصي | `?search=هاتف` |
| `sort` | String | ترتيب النتائج | `?sort=-createdAt` |

**الاستجابة المتوقعة**:
```json
{
  "success": true,
  "results": 25,
  "pagination": {
    "page": 1,
    "limit": 10,
    "pages": 3,
    "total": 25
  },
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
      "title": "هاتف ذكي جديد",
      "description": "هاتف ذكي بمواصفات عالية",
      "price": 5000,
      "currency": "EGP",
      "images": [
        {
          "url": "https://cloudinary.com/image1.jpg",
          "isMain": true
        }
      ],
      "seller": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d1",
        "name": "أحمد محمد"
      },
      "category": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d2",
        "name": "إلكترونيات"
      },
      "village": {
        "_id": "64f8a1b2c3d4e5f6a7b8c9d3",
        "name": "القرية الجديدة"
      },
      "createdAt": "2023-09-06T10:30:00.000Z"
    }
  ]
}
```

#### الحصول على منتج محدد
```http
GET /products/:id
```

#### إنشاء منتج جديد
```http
POST /products
```
**المصادقة**: مطلوبة (seller أو admin)

**المعايير المطلوبة**:
```json
{
  "title": "منتج جديد",
  "description": "وصف المنتج",
  "price": 1000,
  "category": "64f8a1b2c3d4e5f6a7b8c9d0",
  "village": "64f8a1b2c3d4e5f6a7b8c9d1",
  "quantity": 10,
  "images": [
    {
      "public_id": "sample_id",
      "url": "https://cloudinary.com/image.jpg"
    }
  ]
}
```

---

### 🔧 الخدمات (Services)
**المسار الأساسي**: `/api/v1/services`

#### الحصول على جميع الخدمات
```http
GET /services
```

**معايير الاستعلام**: مشابهة للمنتجات

#### الحصول على خدمة محددة
```http
GET /services/:id
```

#### إنشاء خدمة جديدة
```http
POST /services
```
**المصادقة**: مطلوبة (seller أو admin)

**المعايير المطلوبة**:
```json
{
  "title": "خدمة صيانة",
  "description": "خدمة صيانة الأجهزة الإلكترونية",
  "pricing": {
    "type": "hourly",
    "amount": 50,
    "currency": "EGP"
  },
  "category": "64f8a1b2c3d4e5f6a7b8c9d0",
  "village": "64f8a1b2c3d4e5f6a7b8c9d1",
  "serviceType": "on_site"
}
```

---

### 📦 الطلبات (Orders)
**المسار الأساسي**: `/api/v1/orders`

#### الحصول على جميع الطلبات
```http
GET /orders
```
**المصادقة**: مطلوبة

#### الحصول على طلب محدد
```http
GET /orders/:id
```
**المصادقة**: مطلوبة

#### إنشاء طلب جديد
```http
POST /orders
```
**المصادقة**: مطلوبة

**المعايير المطلوبة**:
```json
{
  "seller": "64f8a1b2c3d4e5f6a7b8c9d0",
  "items": [
    {
      "product": "64f8a1b2c3d4e5f6a7b8c9d1",
      "quantity": 2,
      "price": 1000
    }
  ],
  "deliveryInfo": {
    "type": "delivery",
    "address": {
      "street": "شارع الجمهورية",
      "buildingNumber": "123"
    }
  },
  "payment": {
    "method": "cash"
  }
}
```

---

### 🏪 المتاجر (Stores)
**المسار الأساسي**: `/api/v1/stores`

#### الحصول على جميع المتاجر
```http
GET /stores
```

#### الحصول على متجر محدد
```http
GET /stores/:id
```

#### إنشاء متجر جديد
```http
POST /stores
```
**المصادقة**: مطلوبة

---

### 🏘️ القرى (Villages)
**المسار الأساسي**: `/api/v1/villages`

#### الحصول على جميع القرى
```http
GET /villages
```

#### الحصول على قرية محددة
```http
GET /villages/:id
```

---

### 👥 المستخدمون (Users)
**المسار الأساسي**: `/api/v1/users`

#### البحث عن المستخدمين
```http
GET /users/search?q=أحمد
```

#### الحصول على المستخدمين القريبين
```http
GET /users/nearby?lat=30.0444&lng=31.2357&distance=10
```

#### الحصول على مستخدم محدد
```http
GET /users/:id
```

---

### 📁 الفئات (Categories)
**المسار الأساسي**: `/api/v1/categories`

#### الحصول على جميع الفئات
```http
GET /categories
```

#### الحصول على فئة محددة
```http
GET /categories/:id
```

---

### 📤 رفع الملفات (Upload)
**المسار الأساسي**: `/api/v1/upload`

#### رفع صورة واحدة
```http
POST /upload
Content-Type: multipart/form-data
```
**المصادقة**: مطلوبة

**المعايير**:
- `image`: ملف الصورة (jpg, png, webp)
- الحد الأقصى: 5MB

#### رفع عدة صور
```http
POST /upload/multiple
Content-Type: multipart/form-data
```
**المصادقة**: مطلوبة

---

### 💬 الرسائل (Messages)
**المسار الأساسي**: `/api/v1/messages`

#### البحث في الرسائل
```http
GET /messages/search?q=مرحبا
```
**المصادقة**: مطلوبة

#### الحصول على المحادثات
```http
GET /messages/conversations
```
**المصادقة**: مطلوبة

#### إنشاء محادثة جديدة
```http
POST /messages/conversations
```
**المصادقة**: مطلوبة

---

### 🔔 الإشعارات (Notifications)
**المسار الأساسي**: `/api/v1/notifications`

#### الحصول على الإشعارات
```http
GET /notifications
```
**المصادقة**: مطلوبة

#### عدد الإشعارات غير المقروءة
```http
GET /notifications/unread-count
```
**المصادقة**: مطلوبة

---

### ⭐ المراجعات (Reviews)
**المسار الأساسي**: `/api/v1/reviews`

#### الحصول على جميع المراجعات
```http
GET /reviews
```

#### الحصول على مراجعة محددة
```http
GET /reviews/:id
```

#### إنشاء مراجعة جديدة
```http
POST /reviews
```
**المصادقة**: مطلوبة

---

## نماذج البيانات

### نموذج المستخدم (User)
```json
{
  "_id": "ObjectId",
  "name": "String (مطلوب)",
  "phone": "String (مطلوب، فريد)",
  "email": "String (فريد)",
  "avatar": {
    "public_id": "String",
    "url": "String"
  },
  "bio": "String",
  "village": "ObjectId (مرجع للقرية)",
  "address": {
    "street": "String",
    "landmark": "String",
    "buildingNumber": "String",
    "floor": "String",
    "apartment": "String"
  },
  "location": {
    "type": "Point",
    "coordinates": "[Number, Number]"
  },
  "role": "String (user|seller|admin)",
  "isVerified": "Boolean",
  "isProfileComplete": "Boolean",
  "active": "Boolean",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### نموذج المنتج (Product)
```json
{
  "_id": "ObjectId",
  "title": "String (مطلوب)",
  "slug": "String (فريد)",
  "description": "String (مطلوب)",
  "shortDescription": "String",
  "category": "ObjectId (مرجع للفئة)",
  "subcategory": "ObjectId",
  "tags": ["String"],
  "seller": "ObjectId (مرجع للمستخدم)",
  "store": "ObjectId (مرجع للمتجر)",
  "village": "ObjectId (مرجع للقرية)",
  "location": {
    "type": "Point",
    "coordinates": "[Number, Number]"
  },
  "price": "Number (مطلوب)",
  "originalPrice": "Number",
  "currency": "String (EGP|USD)",
  "priceNegotiable": "Boolean",
  "quantity": "Number (مطلوب)",
  "unit": "String",
  "images": [
    {
      "public_id": "String",
      "url": "String",
      "alt": "String",
      "isMain": "Boolean"
    }
  ],
  "condition": "String (new|like_new|good|fair|poor)",
  "type": "String (physical|digital|service)",
  "isAvailable": "Boolean",
  "status": "String (draft|active|inactive|sold|expired|rejected)",
  "deliveryOptions": {
    "pickup": "Boolean",
    "delivery": "Boolean",
    "shipping": "Boolean"
  },
  "paymentMethods": ["String"],
  "views": "Number",
  "likes": "Number",
  "ratingsAverage": "Number",
  "ratingsQuantity": "Number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### نموذج الخدمة (Service)
```json
{
  "_id": "ObjectId",
  "title": "String (مطلوب)",
  "slug": "String (فريد)",
  "description": "String (مطلوب)",
  "category": "ObjectId (مرجع للفئة)",
  "provider": "ObjectId (مرجع للمستخدم)",
  "village": "ObjectId (مرجع للقرية)",
  "pricing": {
    "type": "String (fixed|hourly|daily|project|negotiable)",
    "amount": "Number (مطلوب)",
    "currency": "String (EGP|USD)",
    "minAmount": "Number",
    "maxAmount": "Number"
  },
  "serviceType": "String (on_site|remote|both)",
  "availability": {
    "isAvailable": "Boolean",
    "schedule": {
      "monday": {
        "available": "Boolean",
        "from": "String",
        "to": "String"
      }
    }
  },
  "experience": {
    "years": "Number",
    "description": "String"
  },
  "qualifications": [
    {
      "title": "String",
      "institution": "String",
      "year": "Number",
      "verified": "Boolean"
    }
  ],
  "ratingsAverage": "Number",
  "ratingsQuantity": "Number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### نموذج الطلب (Order)
```json
{
  "_id": "ObjectId",
  "orderNumber": "String (فريد)",
  "customer": "ObjectId (مرجع للمستخدم)",
  "seller": "ObjectId (مرجع للمستخدم)",
  "village": "ObjectId (مرجع للقرية)",
  "items": [
    {
      "product": "ObjectId (مرجع للمنتج)",
      "quantity": "Number",
      "price": "Number",
      "totalPrice": "Number"
    }
  ],
  "subtotal": "Number",
  "deliveryFee": "Number",
  "totalAmount": "Number",
  "currency": "String (EGP|USD)",
  "deliveryInfo": {
    "type": "String (pickup|delivery|shipping)",
    "address": {
      "street": "String",
      "buildingNumber": "String"
    },
    "recipientName": "String",
    "recipientPhone": "String"
  },
  "payment": {
    "method": "String (cash|card|mobile_wallet|bank_transfer)",
    "status": "String (pending|paid|failed|refunded)",
    "transactionId": "String"
  },
  "status": "String (pending|confirmed|preparing|ready|delivered|completed|cancelled)",
  "statusHistory": [
    {
      "status": "String",
      "timestamp": "Date",
      "note": "String"
    }
  ],
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## أكواد الحالة

### أكواد النجاح (2xx)
| الكود | الوصف | الاستخدام |
|-------|--------|-----------|
| `200` | نجح الطلب | استرجاع البيانات بنجاح |
| `201` | تم الإنشاء | إنشاء مورد جديد |
| `204` | لا يوجد محتوى | حذف ناجح |

### أكواد أخطاء العميل (4xx)
| الكود | الوصف | الاستخدام |
|-------|--------|-----------|
| `400` | طلب خاطئ | بيانات غير صحيحة |
| `401` | غير مصرح | مصادقة مطلوبة |
| `403` | ممنوع | لا توجد صلاحية |
| `404` | غير موجود | المورد غير موجود |
| `409` | تعارض | البيانات موجودة مسبقاً |
| `422` | كيان غير قابل للمعالجة | خطأ في التحقق |
| `429` | طلبات كثيرة | تجاوز الحد المسموح |

### أكواد أخطاء الخادم (5xx)
| الكود | الوصف | الاستخدام |
|-------|--------|-----------|
| `500` | خطأ داخلي | خطأ في الخادم |
| `502` | بوابة سيئة | خطأ في الاتصال |
| `503` | الخدمة غير متاحة | صيانة مؤقتة |

---

## أمثلة الاستخدام

### مثال 1: تسجيل مستخدم جديد

```javascript
// 1. إرسال OTP
const sendOTP = async (phone) => {
  const response = await fetch('http://localhost:5000/api/v1/auth/send-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phone })
  });
  
  const data = await response.json();
  return data;
};

// 2. التحقق من OTP
const verifyOTP = async (phone, otp) => {
  const response = await fetch('http://localhost:5000/api/v1/auth/verify-otp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ phone, otp })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // حفظ الرمز المميز
    localStorage.setItem('token', data.data.token);
  }
  
  return data;
};

// 3. إكمال الملف الشخصي
const completeProfile = async (profileData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/v1/auth/complete-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  
  return await response.json();
};

// الاستخدام
(async () => {
  try {
    // إرسال OTP
    await sendOTP('01234567890');
    
    // التحقق من OTP
    const verifyResult = await verifyOTP('01234567890', '123456');
    
    if (verifyResult.success) {
      // إكمال الملف الشخصي
      const profileResult = await completeProfile({
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        village: '64f8a1b2c3d4e5f6a7b8c9d0'
      });
      
      console.log('تم التسجيل بنجاح:', profileResult);
    }
  } catch (error) {
    console.error('خطأ في التسجيل:', error);
  }
})();
```

### مثال 2: البحث عن المنتجات

```javascript
const searchProducts = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  // إضافة المرشحات
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      queryParams.append(key, filters[key]);
    }
  });
  
  const response = await fetch(`http://localhost:5000/api/v1/products?${queryParams}`);
  const data = await response.json();
  
  return data;
};

// البحث بمرشحات مختلفة
const searchResults = await searchProducts({
  search: 'هاتف',
  category: '64f8a1b2c3d4e5f6a7b8c9d0',
  minPrice: 1000,
  maxPrice: 5000,
  village: '64f8a1b2c3d4e5f6a7b8c9d1',
  page: 1,
  limit: 10,
  sort: '-createdAt'
});

console.log('نتائج البحث:', searchResults);
```

### مثال 3: إنشاء طلب جديد

```javascript
const createOrder = async (orderData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });
  
  return await response.json();
};

// إنشاء طلب
const newOrder = await createOrder({
  seller: '64f8a1b2c3d4e5f6a7b8c9d0',
  items: [
    {
      product: '64f8a1b2c3d4e5f6a7b8c9d1',
      quantity: 2,
      price: 1000
    }
  ],
  deliveryInfo: {
    type: 'delivery',
    address: {
      street: 'شارع الجمهورية',
      buildingNumber: '123',
      floor: '2',
      apartment: '5'
    },
    recipientName: 'أحمد محمد',
    recipientPhone: '01234567890'
  },
  payment: {
    method: 'cash'
  }
});

console.log('تم إنشاء الطلب:', newOrder);
```

### مثال 4: رفع صورة

```javascript
const uploadImage = async (imageFile) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await fetch('http://localhost:5000/api/v1/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  return await response.json();
};

// رفع صورة من input file
const fileInput = document.getElementById('imageInput');
fileInput.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  
  if (file) {
    try {
      const uploadResult = await uploadImage(file);
      console.log('تم رفع الصورة:', uploadResult);
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
    }
  }
});
```

---

## معالجة الأخطاء

### هيكل الاستجابة للأخطاء
```json
{
  "success": false,
  "error": {
    "message": "رسالة الخطأ",
    "statusCode": 400,
    "details": {
      "field": "اسم الحقل",
      "code": "VALIDATION_ERROR"
    }
  }
}
```

### أمثلة على الأخطاء الشائعة

#### خطأ في المصادقة
```json
{
  "success": false,
  "error": {
    "message": "يجب تسجيل الدخول للوصول إلى هذا المورد",
    "statusCode": 401
  }
}
```

#### خطأ في التحقق من البيانات
```json
{
  "success": false,
  "error": {
    "message": "بيانات غير صحيحة",
    "statusCode": 422,
    "details": [
      {
        "field": "email",
        "message": "البريد الإلكتروني غير صحيح"
      },
      {
        "field": "phone",
        "message": "رقم الهاتف مطلوب"
      }
    ]
  }
}
```

#### خطأ في الخادم
```json
{
  "success": false,
  "error": {
    "message": "خطأ داخلي في الخادم",
    "statusCode": 500
  }
}
```

### معالجة الأخطاء في JavaScript

```javascript
const handleAPIError = (error) => {
  if (error.statusCode === 401) {
    // إعادة توجيه لصفحة تسجيل الدخول
    window.location.href = '/login';
  } else if (error.statusCode === 422) {
    // عرض أخطاء التحقق
    error.details?.forEach(detail => {
      console.error(`خطأ في ${detail.field}: ${detail.message}`);
    });
  } else {
    // عرض رسالة خطأ عامة
    console.error('حدث خطأ:', error.message);
  }
};

// مثال على الاستخدام
try {
  const response = await fetch('/api/v1/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(productData)
  });
  
  const data = await response.json();
  
  if (!data.success) {
    handleAPIError(data.error);
    return;
  }
  
  console.log('نجح الطلب:', data);
} catch (error) {
  console.error('خطأ في الشبكة:', error);
}
```

---

## ملاحظات إضافية

### التخزين المؤقت (Caching)
- يتم تخزين البيانات الثابتة مؤقتاً لمدة 15 دقيقة
- استخدم هيدر `Cache-Control` للتحكم في التخزين المؤقت

### تحديد معدل الطلبات (Rate Limiting)
- الحد الأقصى: 100 طلب كل 15 دقيقة لكل IP
- للمصادقة: 5 محاولات كل 15 دقيقة

### الترقيم (Pagination)
- الحد الأقصى للعناصر في الصفحة: 50
- الافتراضي: 10 عناصر

### البحث الجغرافي
- استخدم `lat` و `lng` للإحداثيات
- `distance` بالكيلومتر (افتراضي: 10km)

### رفع الملفات
- الأنواع المدعومة: JPG, PNG, WebP
- الحد الأقصى للحجم: 5MB
- الحد الأقصى للعدد: 5 ملفات

---

## الدعم والمساعدة

للحصول على المساعدة أو الإبلاغ عن مشاكل:
- **البريد الإلكتروني**: support@elsoug.com
- **الوثائق**: [رابط الوثائق]
- **GitHub**: [رابط المستودع]

---

**آخر تحديث**: سبتمبر 2023  
**إصدار الوثائق**: 1.0.0