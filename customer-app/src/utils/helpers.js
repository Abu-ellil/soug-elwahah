// دوال مساعدة عامة

// تنسيق السعر
export const formatPrice = (price) => {
  return `${price.toFixed(2)} ج.م`;
};

// تنسيق التاريخ
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// تنسيق الوقت
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// الحصول على لون الحالة
export const getStatusColor = (status) => {
  const colors = {
    pending: '#FFA726',
    confirmed: '#2196F3',
    delivering: '#FF9800',
    delivered: '#4CAF50',
    cancelled: '#F44336',
  };
  return colors[status] || '#9E9E9E';
};

// الحصول على نص الحالة بالعربية
export const getStatusText = (status) => {
  const texts = {
    pending: 'في الانتظار',
    confirmed: 'مؤكد',
    delivering: 'قيد التوصيل',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
  };
  return texts[status] || 'غير معروف';
};

// توليد ID فريد
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// التحقق من صحة رقم الموبايل المصري
export const validatePhone = (phone) => {
  const phoneRegex = /^01[0-2,5]\d{8}$/;
  return phoneRegex.test(phone);
};

// التحقق من صحة كلمة المرور
export const validatePassword = (password) => {
  return password.length >= 6;
};
