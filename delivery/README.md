# تطبيق السائقين - توصيل القرى المصرية

تطبيق موبايل للسائقين/مناديب التوصيل في منصة توصيل القرى المصرية، مبني باستخدام React Native وExpo.

## المميزات

- تسجيل دخول وتسجيل للسائقين
- عرض الطلبات المتاحة وقبولها
- تتبع الموقع في الوقت الفعلي
- إدارة الطلبات النشطة
- عرض سجل الطلبات والأرباح
- ملف شخصي للسائق
- دعم اللغة العربية بالكامل (RTL)

## التقنية المستخدمة

- React Native + Expo
- React Navigation v6
- Context API + useReducer
- AsyncStorage
- Expo Location
- React Native Maps
- Expo Notifications
- Expo Linking

## إعداد المشروع

1. تأكد من تثبيت Node.js وnpm على جهازك
2. Clone المستودع
3. انتقل إلى مجلد المشروع: `cd driver-app`
4. نفذ: `npm install`
5. شغل التطبيق: `npx expo start`

## بيانات تسجيل الدخول التجريبية

السائق 1:
- الهاتف: 01011112222
- كلمة المرور: 123456

السائق 2:
- الهاتف: 010222333
- كلمة المرور: 123456

## الملفات والمجلدات

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
│   │   │   └── OrderHistoryScreen.js
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
│   └── constants/
│       └── colors.js
```

## ملاحظات

- التطبيق يستخدم بيانات تجريبية (Mock Data) في البداية
- التكامل مع الـ API سيتم لاحقاً
- التطبيق مصمم ليدعم اللغة العربية بالكامل مع اتجاه RTL
- واجهات المستخدم مصممة لتكون مناسبة للاستخدام أثناء القيادة

## الترخيص

[MIT](LICENSE)
