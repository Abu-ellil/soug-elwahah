# ElSoug Backend API

Backend API for ElSoug - A comprehensive local marketplace system designed specifically for Egyptian villages, connecting local businesses, services, and customers.

## 🚀 Features

- **User Management**: Registration, authentication, profile management
- **Product Management**: CRUD operations for products with categories
- **Service Management**: Local services listing and booking
- **Store Management**: Store profiles and management
- **Order Management**: Complete order lifecycle management
- **Messaging System**: Real-time messaging between users
- **Review System**: Product, service, and store reviews
- **Notification System**: Real-time notifications
- **File Upload**: Image and document upload with Cloudinary
- **Village Management**: Location-based services
- **Category Management**: Product and service categorization

## 🛠 Tech Stack

- **Runtime**: Node.js (>=16.0.0)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Cloudinary + Multer
- **SMS/OTP**: Twilio
- **Email**: SendGrid (optional)
- **Security**: Helmet, CORS, Rate Limiting, XSS Protection
- **Validation**: Express Validator + Joi
- **Documentation**: Built-in API documentation

## 📋 المتطلبات

- Node.js (v16 أو أحدث)
- MongoDB Atlas account
- Cloudinary account (لرفع الصور)
- Twilio account (لإرسال SMS/OTP)

## 🛠️ التثبيت والإعداد

### 1. تثبيت المكتبات

```bash
npm install
```

### 2. إعداد متغيرات البيئة

انسخ ملف `.env.example` إلى `.env` وقم بتعديل القيم:

```bash
cp .env.example .env
```

قم بتعديل الملف `.env` وأضف القيم الصحيحة:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/elsoug

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# SMS/OTP Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### 3. تشغيل الخادم

```bash
# Development mode
npm run dev

# Production mode
npm start
```

**ملاحظة مهمة**: يمكن تشغيل الخادم بدون قاعدة بيانات MongoDB للاختبار. سيعمل الخادم ولكن العمليات التي تتطلب قاعدة البيانات ستفشل مع رسائل خطأ مناسبة.

## 🌐 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - تسجيل مستخدم جديد
- `POST /api/v1/auth/verify-otp` - تأكيد رمز OTP
- `POST /api/v1/auth/login` - تسجيل الدخول باستخدام البريد الإلكتروني وكلمة المرور
- `POST /api/v1/auth/resend-otp` - إعادة إرسال OTP

### Users
- `GET /api/v1/users/profile` - جلب بيانات المستخدم
- `PUT /api/v1/users/profile` - تحديث بيانات المستخدم
- `POST /api/v1/users/upload-avatar` - رفع صورة المستخدم

### Products
- `GET /api/v1/products` - جلب جميع المنتجات
- `GET /api/v1/products/:id` - جلب منتج محدد
- `POST /api/v1/products` - إضافة منتج جديد
- `PUT /api/v1/products/:id` - تحديث منتج
- `DELETE /api/v1/products/:id` - حذف منتج

### Services
- `GET /api/v1/services` - جلب جميع الخدمات
- `GET /api/v1/services/:id` - جلب خدمة محددة
- `POST /api/v1/services` - إضافة خدمة جديدة
- `PUT /api/v1/services/:id` - تحديث خدمة
- `DELETE /api/v1/services/:id` - حذف خدمة

## 🚀 النشر على Vercel

### 1. تثبيت Vercel CLI

```bash
npm i -g vercel
```

### 2. تسجيل الدخول

```bash
vercel login
```

### 3. النشر

```bash
vercel --prod
```

### 4. إعداد متغيرات البيئة على Vercel

```bash
vercel env add NODE_ENV
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add TWILIO_ACCOUNT_SID
vercel env add TWILIO_AUTH_TOKEN
vercel env add TWILIO_PHONE_NUMBER
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
```

## 📁 هيكل المشروع

```
backend-api/
├── config/
│   ├── database.js          # إعداد قاعدة البيانات
│   └── cloudinary.js        # إعداد Cloudinary
├── controllers/             # Controllers
├── middleware/
│   ├── errorHandler.js      # معالج الأخطاء
│   └── notFound.js          # معالج 404
├── models/                  # نماذج قاعدة البيانات
├── routes/                  # Routes
├── utils/
│   ├── asyncHandler.js      # معالج الدوال غير المتزامنة
│   ├── apiResponse.js       # استجابات API موحدة
│   └── apiFeatures.js       # ميزات API (pagination, filtering)
├── scripts/                 # سكريبتات مساعدة
├── server.js               # الملف الرئيسي
├── vercel.json             # إعداد Vercel
└── package.json
```

## 🧪 الاختبار

```bash
# تشغيل الاختبارات
npm test

# تشغيل الاختبارات مع المراقبة
npm run test:watch
```

## 📊 Health Check

للتأكد من أن API يعمل بشكل صحيح:

```
GET /health
```

## 🧪 اختبار API

### اختبار الخادم الأساسي

```bash
# اختبار Health Check
curl http://localhost:5000/health

# اختبار endpoint محمي (يجب أن يعطي 401)
curl http://localhost:5000/api/v1/users
```

### اختبار التسجيل

```bash
# إنشاء ملف بيانات اختبار
echo '{"name":"Test User","email":"test@example.com","password":"Test123!","phone":"01234567890","village":"507f1f77bcf86cd799439011"}' > test-data.json

# اختبار التسجيل
curl -X POST http://localhost:5000/api/v1/auth/register -H "Content-Type: application/json" -d @test-data.json
```

**ملاحظة**: للتسجيل الناجح، تحتاج إلى:
- كلمة مرور تحتوي على حرف كبير وصغير ورقم
- رقم هاتف صحيح (11 رقم يبدأ بـ 01)
- معرف قرية صحيح (ObjectId)

## 🔒 الأمان

- JWT للمصادقة
- Rate limiting
- CORS protection
- XSS protection
- NoSQL injection protection
- Helmet for security headers

## 📝 ملاحظات مهمة

- تأكد من إعداد MongoDB Atlas بشكل صحيح
- قم بإعداد Cloudinary للصور
- قم بإعداد Twilio لإرسال SMS
- استخدم HTTPS في الإنتاج
- قم بمراجعة logs بانتظام

## 🤝 المساهمة

1. Fork المشروع
2. إنشاء branch جديد (`git checkout -b feature/AmazingFeature`)
3. Commit التغييرات (`git commit -m 'Add some AmazingFeature'`)
4. Push إلى Branch (`git push origin feature/AmazingFeature`)
5. فتح Pull Request

## 📄 الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 التواصل

- Email: support@elsoug.com
- Website: https://elsoug.vercel.app