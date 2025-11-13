# Prompt للتطبيق الأول: تطبيق العملاء (Customer App)

## 🎯 Project Overview
أنت Senior React Native Expo Developer. مطلوب منك تطوير تطبيق توصيل طلبات من المحلات للقرى المصرية باستخدام React Native Expo. التطبيق يعتمد على Mock Data بالكامل.

---

## 📋 Technical Requirements

### Core Technologies:
- **Framework**: React Native + Expo SDK (latest stable)
- **Navigation**: React Navigation v6+ (Native Stack, Bottom Tabs)
- **State Management**: React Context API + useReducer
- **Storage**: AsyncStorage for cart and user data
- **Location**: Expo Location API
- **Language**: Arabic RTL full support
- **Icons**: @expo/vector-icons (Ionicons, MaterialCommunityIcons)
- **UI Components**: Custom components (no external UI libraries)



commands to use 

npx create-expo-app@latest
npx rn-new --nativewind --yarn
yarn add nativewind react-native-reanimated@~3.17.4 react-native-safe-area-context@5.4.0
yarn add --dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11

### Project Structure:
```
customer-app/
├── App.js
├── app.json
├── package.json
├── src/
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   ├── MainTabNavigator.js
│   │   └── AuthNavigator.js
│   ├── screens/
│   │   ├── Home/
│   │   │   ├── HomeScreen.js
│   │   │   └── StoreDetailsScreen.js
│   │   ├── Categories/
│   │   │   └── CategoryStoresScreen.js
│   │   ├── Cart/
│   │   │   ├── CartScreen.js
│   │   │   └── CheckoutScreen.js
│   │   ├── Orders/
│   │   │   ├── OrdersScreen.js
│   │   │   └── OrderDetailsScreen.js
│   │   ├── Profile/
│   │   │   ├── ProfileScreen.js
│   │   │   └── AddressesScreen.js
│   │   └── Auth/
│   │       ├── LoginScreen.js
│   │       └── RegisterScreen.js
│   ├── components/
│   │   ├── StoreCard.js
│   │   ├── ProductCard.js
│   │   ├── CategoryCard.js
│   │   ├── CartItem.js
│   │   ├── OrderCard.js
│   │   ├── Header.js
│   │   ├── SearchBar.js
│   │   ├── EmptyState.js
│   │   └── LoadingSpinner.js
│   ├── context/
│   │   ├── CartContext.js
│   │   ├── AuthContext.js
│   │   └── LocationContext.js
│   ├── data/
│   │   ├── stores.js
│   │   ├── products.js
│   │   ├── categories.js
│   │   ├── orders.js
│   │   ├── users.js
│   │   └── villages.js
│   ├── utils/
│   │   ├── storage.js
│   │   ├── distance.js
│   │   └── helpers.js
│   ├── constants/
│   │   ├── colors.js
│   │   └── sizes.js
│   └── assets/
│       └── images/
```

---

## 🎨 Design System

### Color Palette (Vibrant & Colorful):
```javascript
const COLORS = {
  primary: '#FF6B35',      // برتقالي نابض
  secondary: '#4ECDC4',    // تركواز
  accent: '#FFE66D',       // أصفر مشرق
  success: '#06D6A0',      // أخضر
  danger: '#EF476F',       // أحمر وردي
  warning: '#FFA726',      // برتقالي فاتح
  
  background: '#F8F9FA',   // رمادي فاتح جداً
  card: '#FFFFFF',         
  text: '#2D3436',         // رمادي غامق
  textSecondary: '#636E72',
  border: '#DFE6E9',
  
  gradientStart: '#FF6B35',
  gradientEnd: '#F7931E',
};
```

### Typography:
- استخدم خطوط Tajawal أو Cairo (عبر expo-font)
- Sizes: 12, 14, 16, 18, 20, 24, 32

### UI Guidelines:
- Border Radius: 12px للكاردات، 8px للأزرار
- Shadows: elevation 2-4
- Spacing: 8, 12, 16, 20, 24
- Bottom Tab Bar: ارتفاع 65px مع icons كبيرة
- RTL Support كامل

---

## 📱 Screens Detailed Specifications

### 1. HomeScreen
**Features:**
- Header مع اسم القرية الحالية (من GPS) + أيقونة تغيير الموقع
- Search Bar للبحث في المحلات والمنتجات
- Categories Row (Horizontal Scroll)
- "المحلات القريبة منك" Section
- عرض المحلات مع:
  - صورة المحل
  - اسم المحل
  - التقييم (⭐)
  - المسافة (كم)
  - وقت التوصيل المتوقع
  - حالة المحل (مفتوح/مغلق)
- Pull to Refresh

**Logic:**
- حساب المسافة بين موقع المستخدم والمحلات
- ترتيب المحلات حسب القرب
- فلترة المحلات المغلقة (optional)

---

### 2. StoreDetailsScreen
**Features:**
- Header مع صورة المحل كبيرة + Gradient Overlay
- معلومات المحل (اسم، تقييم، مسافة، وقت توصيل)
- Categories Tabs للمنتجات
- قائمة المنتجات مع:
  - صورة المنتج
  - الاسم
  - السعر
  - زر "أضف للسلة" مع animation
  - Badge "غير متوفر" للمنتجات غير المتاحة
- Floating Cart Button (إذا كانت السلة بها منتجات)

**Logic:**
- فلترة المنتجات حسب الفئة المختارة
- إضافة/إزالة من السلة مع animation
- تحديث عداد السلة في الـ Tab Bar

---

### 3. CategoryStoresScreen
**Features:**
- عرض جميع المحلات في فئة معينة
- نفس تصميم الـ Store Cards من الـ Home
- إمكانية الفلترة والترتيب

---

### 4. CartScreen
**Features:**
- قائمة المنتجات في السلة
- كل منتج يحتوي على:
  - صورة
  - اسم
  - سعر
  - زر زيادة/نقصان الكمية
  - زر حذف
- ملخص السلة:
  - المجموع الفرعي
  - رسوم التوصيل
  - المجموع النهائي
- زر "إتمام الطلب"
- Empty State إذا كانت السلة فارغة

**Logic:**
- حساب المجموع تلقائياً
- حفظ السلة في AsyncStorage
- مسح السلة بعد إتمام الطلب

---

### 5. CheckoutScreen
**Features:**
- اختيار العنوان (من العناوين المحفوظة أو إضافة جديد)
- اختيار طريقة الدفع:
  - كاش عند الاستلام
  - فودافون كاش
  - Visa (قريباً)
- ملاحظات على الطلب (textarea)
- ملخص الطلب
- زر "تأكيد الطلب"

**Logic:**
- التحقق من اختيار العنوان وطريقة الدفع
- إنشاء طلب جديد مع Order ID فريد
- الانتقال لشاشة Order Success
- حفظ الطلب في Mock Orders

---

### 6. OrdersScreen
**Features:**
- Tabs للطلبات:
  - الحالية (Pending, Confirmed, Delivering)
  - المكتملة (Delivered)
  - الملغية (Cancelled)
- كل طلب يحتوي على:
  - Order ID
  - اسم المحل
  - عدد المنتجات
  - الإجمالي
  - الحالة مع لون مميز
  - تاريخ ووقت الطلب
- Tap للذهاب لتفاصيل الطلب

---

### 7. OrderDetailsScreen
**Features:**
- Order ID + حالة الطلب (مع Timeline)
- معلومات المحل
- قائمة المنتجات في الطلب
- العنوان
- طريقة الدفع
- الملخص المالي
- زر "إلغاء الطلب" (للطلبات Pending فقط)
- زر "إعادة الطلب"

**Logic:**
- عرض Timeline للطلب حسب الحالة
- تحديث حالة الطلب (simulation)

---

### 8. ProfileScreen
**Features:**
- صورة ومعلومات المستخدم
- Options List:
  - عناويني
  - طلباتي
  - الإشعارات
  - اللغة
  - تواصل معنا
  - الشروط والأحكام
  - تسجيل الخروج

---

### 9. AddressesScreen
**Features:**
- قائمة العناوين المحفوظة
- كل عنوان يحتوي على:
  - نوع (منزل، عمل، أخرى)
  - العنوان التفصيلي
  - أيقونة تعديل وحذف
- زر "إضافة عنوان جديد"
- Modal/Screen لإضافة عنوان (مع حقول الإدخال)

---

### 10. Auth Screens (Simple)
**LoginScreen:**
- رقم الموبايل + كلمة المرور
- زر "تسجيل الدخول"
- رابط "مستخدم جديد؟ سجل الآن"

**RegisterScreen:**
- الاسم
- رقم الموبايل
- كلمة المرور
- تأكيد كلمة المرور
- زر "تسجيل"

**Logic:**
- Mock Authentication (تخزين في Context + AsyncStorage)
- التحقق من البيانات المدخلة

---

## 🗄️ Mock Data Structure

### villages.js
```javascript
export const VILLAGES = [
  {
    id: 'v1',
    name: 'كفر الشيخ',
    coordinates: { lat: 31.1107, lng: 30.9388 }
  },
  {
    id: 'v2',
    name: 'دسوق',
    coordinates: { lat: 31.1336, lng: 30.6439 }
  },
  // ... المزيد
];
```

### categories.js
```javascript
export const CATEGORIES = [
  { id: 'cat1', name: 'بقالة', icon: 'storefront', color: '#FF6B35' },
  { id: 'cat2', name: 'صيدلية', icon: 'medical', color: '#4ECDC4' },
  { id: 'cat3', name: 'مطاعم', icon: 'restaurant', color: '#FFE66D' },
  { id: 'cat4', name: 'خضار وفاكهة', icon: 'leaf', color: '#06D6A0' },
  { id: 'cat5', name: 'ملابس', icon: 'shirt', color: '#EF476F' },
  // ... المزيد
];
```

### stores.js
```javascript
export const STORES = [
  {
    id: 's1',
    name: 'بقالة الرحمة',
    categoryId: 'cat1',
    image: 'https://via.placeholder.com/400x300?text=Store',
    rating: 4.5,
    deliveryTime: '20-30 دقيقة',
    isOpen: true,
    coordinates: { lat: 31.1120, lng: 30.9400 },
    villageId: 'v1',
  },
  // ... 15-20 محل على الأقل
];
```

### products.js
```javascript
export const PRODUCTS = [
  {
    id: 'p1',
    storeId: 's1',
    name: 'أرز أمريكاني - 1 كيلو',
    price: 25.50,
    image: 'https://via.placeholder.com/200?text=Rice',
    categoryId: 'cat1',
    isAvailable: true,
    description: 'أرز أمريكاني درجة أولى',
  },
  // ... 50-100 منتج على الأقل (موزعين على المحلات)
];
```

### orders.js
```javascript
export const MOCK_ORDERS = [
  {
    id: 'ord1',
    userId: 'user1',
    storeId: 's1',
    items: [
      { productId: 'p1', quantity: 2, price: 25.50 },
      { productId: 'p2', quantity: 1, price: 15.00 }
    ],
    subtotal: 66.00,
    deliveryFee: 10.00,
    total: 76.00,
    status: 'pending', // pending, confirmed, delivering, delivered, cancelled
    address: '15 شارع المدرسة، كفر الشيخ',
    paymentMethod: 'cash',
    notes: 'رجاء الاتصال عند الوصول',
    createdAt: '2025-01-15T10:30:00',
    timeline: [
      { status: 'pending', time: '2025-01-15T10:30:00' }
    ]
  },
  // ... المزيد
];
```

### users.js
```javascript
export const MOCK_USERS = [
  {
    id: 'user1',
    name: 'أحمد محمد',
    phone: '01012345678',
    password: '123456', // للتجربة فقط
    addresses: [
      {
        id: 'addr1',
        type: 'home', // home, work, other
        details: '15 شارع المدرسة، كفر الشيخ',
        coordinates: { lat: 31.1107, lng: 30.9388 }
      }
    ]
  }
];
```

---

## 🎭 Animations & UX

### Animations المطلوبة:
1. **Add to Cart**: Scale + Fade animation
2. **Cart Badge**: Bounce عند التحديث
3. **Pull to Refresh**: Loading indicator
4. **Screen Transitions**: Smooth slide transitions
5. **Tab Bar**: Active tab indicator animation
6. **Empty States**: Fade in animation
7. **Skeleton Loaders**: للبيانات أثناء التحميل

### UX Details:
- Haptic Feedback عند الضغط على الأزرار
- Toast Messages للنجاح/الفشل
- Loading States واضحة
- Error Handling احترافي
- Offline State (رسالة "لا يوجد اتصال")

---

## 🔧 Context APIs

### CartContext
```javascript
// Functions needed:
- addToCart(product, quantity)
- removeFromCart(productId)
- updateQuantity(productId, quantity)
- clearCart()
- getCartTotal()
- getCartItemsCount()
```

### AuthContext
```javascript
// Functions needed:
- login(phone, password)
- register(userData)
- logout()
- isAuthenticated
- currentUser
```

### LocationContext
```javascript
// Functions needed:
- getCurrentLocation()
- updateLocation(coordinates)
- currentVillage
- nearbyStores
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
    "expo-font": "~11.10.2",
    "@expo/vector-icons": "^14.0.0"
  }
}
```

---

## ✅ Acceptance Criteria

### Functionality:
- [ ] جميع الشاشات تعمل بدون أخطاء
- [ ] Navigation سلس بين الشاشات
- [ ] Cart يحفظ البيانات في AsyncStorage
- [ ] GPS يعمل ويحسب المسافات بشكل صحيح
- [ ] Authentication يعمل مع Mock Data
- [ ] Orders تُنشأ وتُحفظ بشكل صحيح
- [ ] RTL يعمل بشكل كامل

### UI/UX:
- [ ] التصميم colorful وحيوي
- [ ] الـ Icons كبيرة وواضحة
- [ ] Animations سلسة وجذابة
- [ ] Empty States موجودة
- [ ] Loading States موجودة
- [ ] Error Handling واضح

### Code Quality:
- [ ] Component Structure منظمة
- [ ] Mock Data منفصلة في مجلد data/
- [ ] Context APIs مستخدمة بشكل صحيح
- [ ] Code نظيف ومنظم
- [ ] Comments بالعربية على الأجزاء المهمة

---

## 🚀 Deliverables

1. **كامل كود المشروع** مع الـ Structure المذكور
2. **README.md** بالعربية يشرح:
   - كيفية التشغيل
   - الـ Features
   - الـ Mock Data Structure
   - Screenshots للشاشات
3. **جميع الـ Mock Data** جاهزة ومنطقية
4. **كود جاهز للتشغيل** مباشرة بـ `expo start`

---

## 💡 Notes للـ AI
- استخدم أفضل الممارسات في React Native
- اجعل الكود قابل للتوسع
- ركز على الـ Performance
- استخدم Functional Components + Hooks فقط
- اجعل الـ Mock Data واقعية قدر الإمكان
- اهتم بالتفاصيل في الـ UI
- استخدم comments بالعربية للأكواد المعقدة

**ابدأ بإنشاء المشروع الكامل الآن! 🚀**