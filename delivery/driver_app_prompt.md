# Prompt للتطبيق الرابع: تطبيق السائقين (Driver App)

## 🎯 Project Overview
أنت Senior React Native Expo Developer. مطلوب منك تطوير تطبيق للسائقين/مناديب التوصيل في تطبيق توصيل القرى المصرية. التطبيق يعتمد على Mock Data بالكامل في البداية، ثم سيتم ربطه بالـ API.

---

use command 
npx create-expo-app@latest

## 📋 Technical Requirements

### Core Technologies:
- **Framework**: React Native + Expo SDK (latest stable)
- **Navigation**: React Navigation v6+ (Native Stack, Bottom Tabs)
- **State Management**: React Context API + useReducer
- **Storage**: AsyncStorage for driver data
- **Location**: Expo Location API (Real-time tracking)
- **Maps**: React Native Maps (Expo)
- **Notifications**: Expo Notifications
- **Phone Calls**: Expo Linking
- **Language**: Arabic RTL full support
- **Icons**: @expo/vector-icons (Ionicons, MaterialCommunityIcons)
- **UI Components**: Custom components

### Project Structure:
```
driver-app/
├── App.js
├── app.json
├── package.json
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   ├── MainTabNavigator.js
│   │   └── AuthNavigator.js
│   ├── screens/
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js
│   │   │   └── RegisterScreen.js
│   │   ├── Home/
│   │   │   ├── HomeScreen.js
│   │   │   └── AvailableOrdersScreen.js
│   │   ├── Orders/
│   │   │   ├── ActiveOrderScreen.js
│   │   │   ├── OrderDetailsScreen.js
│   │   │   └── NavigationScreen.js
│   │   ├── History/
│   │   │   ├── OrderHistoryScreen.js
│   │   │   └── EarningsScreen.js
│   │   └── Profile/
│   │       ├── ProfileScreen.js
│   │       └── SettingsScreen.js
│   ├── components/
│   │   ├── OrderCard.js
│   │   ├── MapView.js
│   │   ├── RouteInfo.js
│   │   ├── EarningsCard.js
│   │   ├── StatusBadge.js
│   │   └── ConfirmDialog.js
│   ├── context/
│   │   ├── DriverContext.js
│   │   ├── OrdersContext.js
│   │   ├── LocationContext.js
│   │   └── AuthContext.js
│   ├── data/
│   │   ├── drivers.js
│   │   ├── orders.js
│   │   ├── stores.js
│   │   └── villages.js
│   ├── utils/
│   │   ├── storage.js
│   │   ├── distance.js
│   │   ├── location.js
│   │   └── helpers.js
│   ├── constants/
│   │   ├── colors.js
│   │   └── sizes.js
│   └── assets/
│       └── images/
```

---

## 🎨 Design System

### Color Palette (Professional & Action-oriented):
```javascript
const COLORS = {
  primary: '#1E88E5',      // أزرق قوي
  secondary: '#43A047',    // أخضر
  accent: '#FFA726',       // برتقالي
  success: '#00C853',      // أخضر فاتح
  danger: '#F44336',       // أحمر
  warning: '#FFB300',      // أصفر
  
  background: '#F5F5F5',   
  card: '#FFFFFF',         
  text: '#212121',         
  textSecondary: '#757575',
  border: '#E0E0E0',
  
  // Order Status Colors
  available: '#2196F3',    // أزرق
  accepted: '#FF9800',     // برتقالي
  picked_up: '#9C27B0',    // بنفسجي
  on_way: '#3F51B5',       // أزرق غامق
  delivered: '#4CAF50',    // أخضر
  
  // Map Colors
  driverMarker: '#1E88E5',
  storeMarker: '#FF5722',
  customerMarker: '#4CAF50',
  route: '#1E88E5',
};
```

### Typography:
- استخدم خطوط Cairo أو Tajawal
- Sizes: 12, 14, 16, 18, 20, 24, 32

### UI Guidelines:
- Border Radius: 12px للكاردات، 8px للأزرار
- Shadows: elevation 2-4
- Spacing: 8, 12, 16, 20, 24
- Bottom Tab Bar: 65px height
- RTL Support كامل
- **Large Touch Targets** (للاستخدام أثناء القيادة)

---

## 📱 Screens Detailed Specifications

### 1. LoginScreen
**Features:**
- Logo التطبيق
- عنوان "تسجيل دخول السائق"
- رقم الموبايل (input)
- كلمة المرور (input مع show/hide)
- Checkbox "تذكرني"
- زر "تسجيل الدخول" (كبير وملون)
- رابط "مندوب جديد؟ سجل الآن"
- رسالة خطأ واضحة

**Logic:**
- التحقق من البيانات (validation)
- إرسال طلب للـ API: `POST /api/auth/login`
- حفظ Token في AsyncStorage
- التحقق من حالة الحساب:
  - إذا `verificationStatus === 'pending'` → رسالة "طلبك قيد المراجعة"
  - إذا `verificationStatus === 'rejected'` → رسالة "تم رفض طلبك: {reason}"
  - إذا `isActive === false` → رسالة "حسابك غير مفعّل"
  - إذا `approved` → الانتقال للـ Main App
- حفظ بيانات السائق في Context

**UI:**
- Background gradient
- Centered card
- Smooth animations

---

### 2. RegisterScreen
**Features:**
- Header مع "تسجيل سائق جديد"
- **Form Sections**:
  
  **1. معلومات شخصية:**
  - الاسم الكامل (input)
  - رقم الموبايل (input مع validation)
  - كلمة المرور (input مع show/hide)
  - تأكيد كلمة المرور
  
  **2. معلومات المركبة:**
  - نوع المركبة (Picker):
    - موتوسيكل 🏍️
    - سيارة 🚗
    - توك توك 🛺
  - رقم اللوحة (input)
  
  **3. المستندات المطلوبة:**
  - **صورة البطاقة الشخصية** (إلزامي):
    - زر "التقط صورة" أو "اختر من المعرض"
    - عرض الصورة المختارة (thumbnail)
    - زر حذف/تغيير
  - **صورة رخصة القيادة** (إلزامي):
    - زر "التقط صورة" أو "اختر من المعرض"
    - عرض الصورة المختارة
    - زر حذف/تغيير
  
  **4. الموافقة:**
  - Checkbox "أوافق على الشروط والأحكام"

- زر "إرسال الطلب" (كبير، أخضر)
- زر "العودة لتسجيل الدخول"

**Logic:**
- Validation شاملة:
  - التحقق من ملء جميع الحقول
  - التحقق من رقم الموبايل المصري (01xxxxxxxxx)
  - التحقق من تطابق كلمات المرور
  - التحقق من رفع الصورتين
  - التحقق من الموافقة على الشروط
- Image Picker:
  - طلب صلاحيات الكاميرا والمعرض
  - خيار الكاميرا أو المعرض
  - ضغط الصورة (max 1MB)
  - عرض preview
- إرسال طلب التسجيل:
  - `POST /api/auth/driver/register`
  - إرسال FormData مع الصور
- بعد النجاح:
  - عرض رسالة نجاح
  - "تم إرسال طلبك بنجاح! سيتم مراجعته خلال 24 ساعة"
  - زر "العودة لتسجيل الدخول"
  - (أو Auto-redirect بعد 3 ثواني)

**UI:**
- Multi-step form (optional - أو scroll واحد)
- Progress indicator في الأعلى
- Icons واضحة لكل section
- Image preview cards جذابة
- Success screen مع animation

---

### 3. HomeScreen (Main Tab)
**Features:**
- **Header**:
  - صورة السائق + الاسم
  - Badge: verificationStatus
    - Approved ✅ (أخضر)
    - Pending ⏳ (برتقالي)
    - Rejected ❌ (أحمر)
  - نقاط التقييم ⭐ (كبير)
  
- **Availability Toggle** (كبير جداً وواضح):
  - إذا `approved`:
    - Switch كبير: "متاح للتوصيل" / "غير متاح"
    - اللون الأخضر عند التفعيل
    - Haptic feedback عند التغيير
  - إذا `pending`:
    - رسالة "طلبك قيد المراجعة، برجاء الانتظار"
    - Disable التوصيل
  - إذا `rejected`:
    - رسالة "تم رفض طلبك"
    - عرض السبب
    - زر "التواصل مع الدعم"

- **Today Stats Card**:
  - عدد الطلبات اليوم
  - الأرباح اليوم (بخط كبير وملون)
  - ساعات العمل
  
- **Quick Stats Grid** (3 cards):
  - إجمالي الطلبات المكتملة
  - متوسط التقييم ⭐
  - إجمالي الأرباح (الأسبوع)

- **Action Buttons**:
  - إذا متاح ولا يوجد طلب نشط:
    - زر كبير "ابحث عن طلبات" (أخضر)
  - إذا يوجد طلب نشط:
    - Active Order Card (يظهر مباشرة)
    - Order ID + Store Name
    - Status الحالي
    - زر "عرض التفاصيل"

**Logic:**
- Fetch driver profile: `GET /api/driver/profile`
- Toggle availability: `PATCH /api/driver/toggle-availability`
- Fetch today stats: `GET /api/driver/statistics?period=today`
- Fetch active order: `GET /api/driver/orders/active`
- Auto-refresh كل دقيقة (إذا متاح)

---

### 4. AvailableOrdersScreen
**Features:**
- **Header**:
  - "الطلبات المتاحة"
  - Badge بالعدد
  - زر Refresh
  
- **Filter/Sort Options** (Tabs في الأعلى):
  - الأقرب إليك (default)
  - الأعلى قيمة
  - الأحدث

- **Orders List**:
  - Pull to Refresh
  - Empty State "لا توجد طلبات متاحة حالياً"
  
- **كل Order Card** يحتوي على:
  - **Header**:
    - Order ID
    - منذ كم دقيقة (e.g., "منذ 3 دقائق")
  - **Store Info**:
    - أيقونة الفئة + اسم المحل
    - المسافة من موقعك الحالي (بخط كبير) "2.5 كم"
  - **Route Info**:
    - محل → عميل
    - المسافة الإجمالية: "5.3 كم"
    - الوقت المتوقع: "15-20 دقيقة"
  - **Earnings**:
    - رسوم التوصيل (بخط كبير وملون) "15 جنيه"
  - **Actions**:
    - زر "قبول الطلب" (أخضر، كبير)
    - زر "عرض التفاصيل" (ghost button)

**Logic:**
- Fetch available orders: `GET /api/driver/orders/available?lat={lat}&lng={lng}&radius=10`
- حساب المسافات من موقع السائق الحالي
- ترتيب حسب الفلتر المختار
- Accept order: `POST /api/driver/orders/{orderId}/accept`
- بعد القبول → الانتقال لـ ActiveOrderScreen

**UI:**
- Cards مع shadows جذابة
- Icons ملونة
- Shimmer loading عند التحميل
- Animation عند القبول

---

### 5. ActiveOrderScreen (Main Tab)
**Features:**

#### **إذا لا يوجد طلب نشط:**
- Empty State:
  - أيقونة كبيرة 📦
  - "لا يوجد طلب نشط حالياً"
  - زر "ابحث عن طلبات جديدة"

#### **إذا يوجد طلب نشط:**

**Layout: مقسّم لنصفين**

**A. النصف العلوي: Map View (50%)**
- عرض خريطة تفاعلية مع:
  - **Marker السائق** (موقعك الحالي):
    - أيقونة سيارة/موتوسيكل
    - لون أزرق
    - يتحرك real-time
  - **Marker المحل**:
    - أيقونة محل 🏪
    - لون أحمر
    - Pin واضح
  - **Marker العميل**:
    - أيقونة منزل 🏠
    - لون أخضر
    - Pin واضح
  - **Route Line**:
    - خط ملون بين النقاط
    - اللون يتغير حسب الحالة:
      - برتقالي: من السائق → المحل
      - أزرق: من المحل → العميل
  - **Auto-zoom** ليشمل كل النقاط
  
- **Floating Buttons** على الخريطة:
  - زر "تكبير الخريطة" (fullscreen)
  - زر "موقعي" (center على السائق)
  - زر "فتح في Google Maps"

**B. النصف السفلي: Order Info Card (50%)**

**Info Tabs** (Swipeable):

**Tab 1: معلومات الطلب**
- Order ID + Status Badge
- Timeline (visual - dots مع خطوط):
  - ✅ تم القبول
  - 🏪 استلم من المحل
  - 🚗 في الطريق
  - ✅ تم التسليم

**Tab 2: معلومات المحل**
- اسم المحل
- العنوان (كامل)
- رقم الموبايل مع زر اتصال 📞
- المسافة من موقعك
- زر "فتح الموقع في الخريطة"

**Tab 3: معلومات العميل**
- اسم العميل
- العنوان (كامل)
- رقم الموبايل مع زر اتصال 📞
- المسافة من موقعك
- زر "فتح الموقع في الخريطة"
- ملاحظات العميل (إن وجدت)

**Tab 4: تفاصيل الطلب**
- قائمة المنتجات (مختصرة):
  - عدد المنتجات
  - زر "عرض التفاصيل"
- قيمة الطلب
- طريقة الدفع (نقدي/أونلاين)
- **رسوم التوصيل (أرباحك)** (بخط كبير)

**C. Action Buttons (في الأسفل، ثابتة)**

الأزرار تتغير حسب `status`:

**إذا Status: accepted**
- زر "وصلت للمحل" (أخضر، كبير، full width)

**إذا Status: confirmed**  
- زر "استلمت الطلب" (أخضر، كبير)

**إذا Status: picked_up**
- زر "في الطريق للعميل" (أزرق، كبير)

**إذا Status: on_way**
- زر "تم التسليم" (أخضر، كبير)
- (هنا يظهر أيضاً ETA للعميل)

**Logic:**
- Fetch active order: `GET /api/driver/orders/active`
- Real-time location tracking:
  - Update كل 10 ثواني: `PATCH /api/driver/tracking/location`
  - تحديث Map marker
- Update order status:
  - `PATCH /api/driver/orders/{orderId}/status`
  - Body: { status: 'picked_up' | 'on_way' | 'delivered' }
- حساب المسافات والـ ETA تلقائياً
- الاتصال: `Linking.openURL('tel:{phone}')`
- فتح الخريطة: `Linking.openURL('https://maps.google.com/?q={lat},{lng}')`

**UI:**
- Map responsive وسلس
- Tabs swipeable
- Buttons كبيرة وواضحة
- Loading states عند تحديث الحالة
- Success animation عند التسليم

---

### 6. NavigationScreen (Full Map)
**Features:**
- **Full Screen Map**
- **Marker السائق** (يتحرك real-time)
- **Marker الوجهة** (محل أو عميل حسب الحالة)
- **Route مرسومة** (polyline)
- **Info Card في الأسفل** (Draggable):
  - الوجهة الحالية (اسم المحل/العميل)
  - المسافة المتبقية (كم)
  - الوقت المتوقع (دقائق)
  - Progress bar
- **Floating Buttons**:
  - زر "إلغاء الملاحة" (X في الزاوية)
  - زر "فتح في Google Maps"
  - زر "موقعي"

**Logic:**
- Real-time GPS tracking
- حساب المسافة والوقت المتبقي باستمرار
- تحديث Route تلقائياً
- Sound/Vibration عند الوصول (optional)

---

### 7. OrderDetailsScreen
**Features:**
- **Header**:
  - Order ID
  - Status Badge (كبير وملون)
  - Back button

- **Timeline Card** (visual):
  - كل خطوة مع:
    - Icon
    - Label
    - Timestamp
    - خط يربط بين الخطوات

- **Cards Sections**:

  **1. Store Card**:
  - صورة + اسم المحل
  - رقم الموبايل (clickable)
  - العنوان
  - زر "فتح الموقع"

  **2. Customer Card**:
  - الاسم
  - رقم الموبايل (clickable)
  - العنوان
  - ملاحظات (إن وجدت)
  - زر "فتح الموقع"

  **3. Order Items Card**:
  - قائمة المنتجات:
    - صورة صغيرة
    - الاسم
    - الكمية
    - السعر

  **4. Financial Summary Card**:
  - قيمة الطلب
  - رسوم التوصيل
  - المجموع الكلي
  - طريقة الدفع
  - **أرباحك** (highlighted)

- **Action Buttons** (حسب الحالة):
  - "اتصل بالمحل"
  - "اتصل بالعميل"
  - "إبلاغ عن مشكلة"

**Logic:**
- Fetch order details: `GET /api/driver/orders/{orderId}`
- عرض كل التفاصيل بشكل منظم
- Timeline يعرض التقدم الفعلي

---

### 8. OrderHistoryScreen (Main Tab)
**Features:**
- **Header**:
  - "سجل الطلبات"
  - Date Filter Dropdown:
    - اليوم
    - الأسبوع
    - الشهر
    - الكل

- **Statistics Cards** (في الأعلى):
  - عدد الطلبات
  - إجمالي الأرباح
  - متوسط التقييم

- **Orders List**:
  - Grouped by date (Today, Yesterday, This Week, etc.)
  - كل Order Card:
    - Order ID
    - التاريخ والوقت
    - المحل → العميل (مع icons)
    - المسافة الكلية
    - رسوم التوصيل (أرباحك)
    - التقييم ⭐ (إذا موجود)
    - Status Badge
  - Pull to Refresh
  - Pagination

**Logic:**
- Fetch order history: `GET /api/driver/orders/history?period={period}&page={page}`
- فلترة حسب الفترة المختارة
- Pagination للـ performance

---

### 9. EarningsScreen
**Features:**
- **Header**:
  - "أرباحي"
  - Period Selector (Tabs):
    - اليوم
    - الأسبوع
    - الشهر
    - السنة

- **Big Number Display**:
  - **إجمالي الأرباح** (رقم كبير جداً وملون)
  - نسبة التغيير عن الفترة السابقة

- **Breakdown Cards**:
  - عدد الطلبات
  - متوسط الربح لكل طلب
  - أعلى طلب (قيمة)
  - أقل طلب (قيمة)

- **Chart Section**:
  - Bar Chart للأرباح اليومية (آخر 7 أيام)
  - أو Line Chart للـ trends

- **Top Earnings List**:
  - قائمة الطلبات مرتبة حسب القيمة
  - أعلى 10 طلبات

**Logic:**
- Fetch earnings: `GET /api/driver/earnings?period={period}`
- عرض البيانات في charts
- حساب الإحصائيات

---

### 10. ProfileScreen (Main Tab)
**Features:**
- **Profile Header**:
  - صورة السائق (كبيرة، circular)
  - زر "تغيير الصورة"
  - الاسم
  - رقم الموبايل
  - Verification Badge:
    - ✅ Approved
    - ⏳ Pending
    - ❌ Rejected

- **Rating Section**:
  - التقييم ⭐ (كبير)
  - عدد التقييمات
  - Progress bars لكل نجمة (5-1)

- **Vehicle Info Card**:
  - نوع المركبة (مع icon)
  - رقم اللوحة
  - زر "تعديل"

- **Statistics Grid**:
  - إجمالي الطلبات
  - معدل القبول
  - معدل الإنجاز
  - معدل الإلغاء

- **Options List**:
  - تعديل الملف الشخصي
  - المستندات (عرض)
  - الإعدادات
  - المساعدة والدعم
  - الشروط والأحكام
  - تسجيل الخروج

**Logic:**
- Fetch profile: `GET /api/driver/profile`
- Update profile: `PUT /api/driver/profile`
- Logout: مسح Token + الرجوع للـ Login

---

### 11. SettingsScreen
**Features:**
- **Tabs/Sections**:

  **1. Notifications:**
  - طلبات جديدة (toggle)
  - رسائل من الدعم (toggle)
  - تحديثات الأرباح (toggle)
  - الصوت (toggle)
  - الاهتزاز (toggle)

  **2. Location:**
  - تتبع الموقع دائماً (toggle)
  - دقة الموقع (High/Medium/Low)
  - تحديث الموقع في الخلفية

  **3. App:**
  - اللغة (العربية/English)
  - الوضع الليلي (toggle - optional)

  **4. Account:**
  - تغيير كلمة المرور
  - حذف الحساب

**Logic:**
- حفظ الإعدادات في AsyncStorage
- Update FCM token عند تغيير إعدادات الإشعارات

---

### 12. DocumentsScreen (Optional)
**Features:**
- عرض المستندات المرفوعة:
  - البطاقة الشخصية
  - رخصة القيادة
- زر "تحديث المستندات"
- حالة المراجعة
- إذا مرفوض، عرض السبب

**Logic:**
- عرض الصور من الـ API
- إمكانية تحديثها

---
- Pagination

**Logic:**
- عرض الطلبات المكتملة فقط
- فلترة حسب التاريخ
- حساب الإحصائيات

---

### 9. EarningsScreen
**Features:**
- Header "أرباحي"
- Period Selector (اليوم، الأسبوع، الشهر، السنة)
- Big Number Display:
  - **إجمالي الأرباح** (رقم كبير جداً)
- Breakdown Cards:
  - عدد الطلبات
  - متوسط الربح لكل طلب
  - أعلى طلب
  - أقل طلب
- Simple Chart (Bar/Line) للأرباح اليومية
- قائمة الطلبات المكتملة (مرتبة حسب القيمة)

**Logic:**
- حساب الأرباح من orders
- فلترة حسب الفترة
- عرض Chart بسيط

---

### 10. ProfileScreen (Main Tab)
**Features:**
- صورة السائق (كبيرة)
- الاسم + رقم الموبايل
- التقييم ⭐ (كبير)
- معلومات المركبة:
  - النوع
  - رقم اللوحة
- Statistics:
  - إجمالي الطلبات
  - معدل الإلغاء
  - معدل القبول
- Options List:
  - تعديل الملف الشخصي
  - المستندات
  - الإعدادات
  - المساعدة والدعم
  - تسجيل الخروج

---

### 11. SettingsScreen
**Features:**
- Notifications Settings:
  - طلبات جديدة
  - رسائل من الدعم
- Location Settings:
  - تتبع الموقع دائماً
  - دقة الموقع
- App Settings:
  - اللغة
  - الوضع الليلي (optional)
- Account:
  - تغيير كلمة المرور
  - حذف الحساب

---

## 🗄️ Mock Data Structure

### drivers.js
```javascript
export const DRIVERS = [
  {
    id: 'driver1',
    name: 'محمد السائق',
    phone: '01011112222',
    password: '123456',
    avatar: 'https://via.placeholder.com/200?text=Driver1',
    rating: 4.8,
    totalOrders: 145,
    totalEarnings: 4350.00,
    vehicleType: 'motorcycle', // motorcycle, car, tuktuk
    vehicleNumber: 'أ ب ج 1234',
    isAvailable: true,
    isActive: true,
    coordinates: { lat: 31.1110, lng: 30.9390 },
    documents: {
      nationalId: 'url_here',
      drivingLicense: 'url_here',
      isVerified: true
    },
    createdAt: '2024-12-01T10:00:00',
  },
  {
    id: 'driver2',
    name: 'أحمد المندوب',
    phone: '01022223333',
    password: '123456',
    avatar: 'https://via.placeholder.com/200?text=Driver2',
    rating: 4.6,
    totalOrders: 98,
    totalEarnings: 2940.00,
    vehicleType: 'tuktuk',
    vehicleNumber: 'د ه و 5678',
    isAvailable: false,
    isActive: true,
    coordinates: { lat: 31.1115, lng: 30.9395 },
    documents: {
      nationalId: 'url_here',
      drivingLicense: 'url_here',
      isVerified: true
    },
    createdAt: '2024-12-05T14:00:00',
  },
  // ... 3-5 سائقين
];
```

### orders.js (تحديث)
```javascript
// إضافة حقول للسائقين
export const ORDERS = [
  {
    // ... all existing fields
    driverId: 'driver1',
    driverName: 'محمد السائق',
    driverPhone: '01011112222',
    deliveryFee: 10.00, // أرباح السائق
    driverRating: 5, // تقييم من العميل
    pickupTime: '2025-01-15T09:15:00', // وقت استلام من المحل
    deliveryTime: '2025-01-15T09:35:00', // وقت التوصيل
    distance: 3.5, // كم
    
    // Order Status Flow for Driver:
    // pending → accepted (السائق قبل) → picked_up (استلم من المحل) → on_way (في الطريق) → delivered (تم التوصيل)
  },
  // ...
];
```

---

## 🎭 Animations & UX

### Animations المطلوبة:
1. **Toggle Availability**: Scale + Color transition
2. **Accept Order**: Success animation
3. **Map Markers**: Bounce animation
4. **Status Updates**: Slide animation
5. **Pull to Refresh**: Smooth loading
6. **Tab Bar**: Active indicator
7. **Empty States**: Fade in

### UX Details:
- **Large Touch Targets** (60px minimum)
- **Haptic Feedback** للإجراءات الهامة
- **Confirmation Dialogs** قبل الإلغاء
- **Toast Messages** واضحة
- **Real-time Location Updates** كل 5-10 ثواني
- **Sound Notification** للطلبات الجديدة
- **Vibration** عند وصول طلب جديد

---

## 🔧 Context APIs

### DriverContext
```javascript
// State:
- currentDriver
- isAvailable
- currentLocation
- stats

// Functions:
- toggleAvailability()
- updateLocation(coordinates)
- updateProfile(data)
- getDriverStats()
```

### OrdersContext
```javascript
// State:
- availableOrders
- activeOrder
- orderHistory
- loading

// Functions:
- getAvailableOrders()
- acceptOrder(orderId)
- updateOrderStatus(orderId, status)
- getOrderHistory(period)
```

### LocationContext
```javascript
// State:
- currentLocation
- isTracking
- locationPermission

// Functions:
- startTracking()
- stopTracking()
- requestPermission()
- calculateDistance(lat1, lng1, lat2, lng2)
```

---

## 📦 Dependencies (package.json)
```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "react-native-screens": "~3.29.0",
    "react-native-safe-area-context": "4.8.2",
    "@react-native-async-storage/async-storage": "1.21.0",
    "expo-location": "~16.5.5",
    "react-native-maps": "1.10.0",
    "expo-notifications": "~0.27.6",
    "expo-linking": "~6.2.2",
    "expo-font": "~11.10.2",
    "@expo/vector-icons": "^14.0.0"
  }
}
```

---

## ✅ Acceptance Criteria

### Functionality:
- [ ] Login/Register يعمل
- [ ] Toggle availability يعمل
- [ ] عرض الطلبات المتاحة
- [ ] قبول الطلب يعمل
- [ ] تحديث حالة الطلب يعمل
- [ ] Real-time location tracking يعمل
- [ ] Map view يعرض المواقع صح
- [ ] الاتصال بالعميل/المحل يعمل
- [ ] حساب الأرباح صحيح
- [ ] Order history يعمل
- [ ] RTL كامل

### UI/UX:
- [ ] التصميم professional ونظيف
- [ ] Touch targets كبيرة وواضحة
- [ ] Animations سلسة
- [ ] Map responsive
- [ ] Empty States جذابة
- [ ] Loading States واضحة
- [ ] Notifications تعمل

### Safety:
- [ ] Location permissions تُطلب بشكل صحيح
- [ ] Background location (إذا لزم)
- [ ] Battery optimization tips

---

## 🚀 Deliverables

1. **كامل كود المشروع**
2. **README.md** يشرح:
   - Setup
   - Features
   - Mock Credentials:
     ```
     السائق 1:
     Phone: 01011112222
     Password: 123456
     
     السائق 2:
     Phone: 01022223333
     Password: 123456
     ```
3. **Mock Data** جاهزة
4. **كود جاهز للتشغيل**

---

## 💡 Important Notes

### Location Tracking:
- استخدم `expo-location` للـ GPS
- طلب permissions بشكل واضح
- Background tracking (optional لـ MVP)
- Update location كل 5-10 ثواني عند القيادة

### Maps:
- استخدم `react-native-maps`
- Custom markers للسائق/محل/عميل
- Route drawing بين النقاط
- Auto-zoom ليشمل كل المواقع

### Notifications:
- Local notifications للطلبات الجديدة
- Sound + Vibration
- Badge على الـ tab

### Safety First:
- Large buttons للاستخدام أثناء القيادة
- High contrast colors
- Voice feedback (optional)
- تحذير "لا تستخدم الهاتف أثناء القيادة"

**ابدأ بإنشاء تطبيق السائقين الآن! 🚀**