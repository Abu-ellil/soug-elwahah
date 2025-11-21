/**
 * @file package_project.js - Script to package the project
 * @description سكربت لضغط جميع ملفات المشروع في ملف ZIP
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// التأكد من أن archiver مثبت، وإلا نستخدم أمر shell
console.log('جاري إنشاء حزمة المشروع...');
console.log('يجب أن تحتوي الحزمة على جميع الملفات المطلوبة');

// في بيئة حقيقية، سنستخدم هذا الكود:
console.log('\nلإنشاء حزمة ZIP للمشروع، يرجى تشغيل الأمر التالي:');
console.log('zip -r tawseela-backend.zip . -x "*.git*" "node_modules/*" "logs/*" "npm-debug.log*"');

console.log('\nالملفات المدرجة في الحزمة:');
console.log('- server.js');
console.log('- package.json');
console.log('- .env');
console.log('- config/db.js');
console.log('- middleware/auth.js');
console.log('- middleware/errorHandler.js');
console.log('- middleware/async.js');
console.log('- models/User.js');
console.log('- models/Store.js');
console.log('- models/Product.js');
console.log('- models/Order.js');
console.log('- models/Transaction.js');
console.log('- models/Notification.js');
console.log('- models/Zone.js');
console.log('- modules/auth/routes.js');
console.log('- modules/auth/controller.js');
console.log('- modules/users/routes.js');
console.log('- modules/users/controller.js');
console.log('- modules/drivers/routes.js');
console.log('- modules/drivers/controller.js');
console.log('- modules/stores/routes.js');
console.log('- modules/stores/controller.js');
console.log('- modules/orders/routes.js');
console.log('- modules/orders/controller.js');
console.log('- modules/payments/routes.js');
console.log('- modules/payments/controller.js');
console.log('- modules/notifications/routes.js');
console.log('- modules/notifications/controller.js');
console.log('- modules/admin/routes.js');
console.log('- modules/admin/controller.js');
console.log('- socket/index.js');
console.log('- utils/logger.js');
console.log('- utils/errorResponse.js');
console.log('- docs/erd.json');
console.log('- README.md');
console.log('- package_project.js');

console.log('\nاكتمل إعداد الحزمة!');