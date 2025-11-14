export const VILLAGES = [
  {
    id: 'v1',
    name: 'كفر الشيخ',
    coordinates: { lat: 31.1107, lng: 30.9388 },
    deliveryRadius: 15, // kilometers
    deliveryFee: 10,
    deliveryTime: '20-30 دقيقة',
    region: 'محافظة كفر الشيخ',
    isActive: true,
    landmarks: ['مركز المحافظة', 'المستشفى العام', 'السوق الرئيسي'],
  },
  {
    id: 'v2',
    name: 'دسوق',
    coordinates: { lat: 31.1336, lng: 30.6439 },
    deliveryRadius: 12,
    deliveryFee: 10,
    deliveryTime: '15-25 دقيقة',
    region: 'محافظة كفر الشيخ',
    isActive: true,
    landmarks: ['المركز الطبي', 'سوق السمك', 'محطة القطار'],
  },
  {
    id: 'v3',
    name: 'فوه',
    coordinates: { lat: 30.55, lng: 30.9833 },
    deliveryRadius: 10,
    deliveryFee: 15,
    deliveryTime: '25-35 دقيقة',
    region: 'محافظة كفر الشيخ',
    isActive: true,
    landmarks: ['الوحدة المحلية', 'المركز الصحي', 'السوق الأسبوعي'],
  },
  {
    id: 'v4',
    name: 'مطوبس',
    coordinates: { lat: 30.6167, lng: 30.9667 },
    deliveryRadius: 8,
    deliveryFee: 12,
    deliveryTime: '20-30 دقيقة',
    region: 'محافظة كفر الشيخ',
    isActive: true,
    landmarks: ['المركز الطبي', 'السوق الجديد', 'مدرسة مطوبس'],
  },
  {
    id: 'v5',
    name: 'بيلا',
    coordinates: { lat: 30.4167, lng: 31.0167 },
    deliveryRadius: 14,
    deliveryFee: 18,
    deliveryTime: '30-40 دقيقة',
    region: 'محافظة كفر الشيخ',
    isActive: true,
    landmarks: ['مركز المدينة', 'المستشفى التعليمي', 'نادي بيلا الرياضي'],
  },
  {
    id: 'v6',
    name: 'سيدي سالم',
    coordinates: { lat: 31.2833, lng: 30.7833 },
    deliveryRadius: 11,
    deliveryFee: 14,
    deliveryTime: '25-35 دقيقة',
    region: 'محافظة كفر الشيخ',
    isActive: true,
    landmarks: ['مركز شباب سيدي سالم', 'البنك الأهلي', 'محطة أتوبيس'],
  },
  {
    id: 'v7',
    name: 'قلين',
    coordinates: { lat: 30.8333, lng: 31.0833 },
    deliveryRadius: 9,
    deliveryFee: 13,
    deliveryTime: '22-32 دقيقة',
    region: 'محافظة كفر الشيخ',
    isActive: true,
    landmarks: ['الوحدة المحلية', 'مدرسة قلين', 'مسجد نور الإسلام'],
  },
  {
    id: 'v8',
    name: 'الرياض',
    coordinates: { lat: 30.7833, lng: 31.0167 },
    deliveryRadius: 7,
    deliveryFee: 11,
    deliveryTime: '18-28 دقيقة',
    region: 'محافظة كفر الشيخ',
    isActive: true,
    landmarks: ['مركز طبي الرياض', 'السوق التجاري', 'محطة بنزين الرياض'],
  },
  {
    id: 'v9',
    name: 'الحامول',
    coordinates: { lat: 30.8667, lng: 31.0833 },
    deliveryRadius: 10,
    deliveryFee: 12,
    deliveryTime: '20-30 دقيقة',
    region: 'محافظة كفر الشيخ',
    isActive: true,
    landmarks: ['مجلس قروي الحامول', 'العيادة البيطرية', 'حظيرة جمهور'],
  },
  {
    id: 'v10',
    name: 'برج البرلس',
    coordinates: { lat: 31.4167, lng: 30.4167 },
    deliveryRadius: 13,
    deliveryFee: 16,
    deliveryTime: '28-38 دقيقة',
    region: 'محافظة كفر الشيخ',
    isActive: true,
    landmarks: ['مركز الشرطة', 'المركز الطبي المطور', 'ميناء الصيد'],
  },
  // Additional villages for expanded coverage
  {
    id: 'v11',
    name: 'بلطيم',
    coordinates: { lat: 31.3167, lng: 30.2667 },
    deliveryRadius: 8,
    deliveryFee: 20,
    deliveryTime: '35-45 دقيقة',
    region: 'محافظة كفر الشيخ',
    isActive: false, // Future expansion
    landmarks: ['ميناء بلطيم', 'شاطئ البلطيم', 'فندق سياحي'],
  },
  {
    id: 'v12',
    name: 'الريّس',
    coordinates: { lat: 31.2167, lng: 30.1333 },
    deliveryRadius: 6,
    deliveryFee: 25,
    deliveryTime: '40-50 دقيقة',
    region: 'محافظة كفر الشيخ',
    isActive: false, // Future expansion
    landmarks: ['شاطئ الريّس', 'قرية سياحية', 'فندق عائلي'],
  },
];

// Delivery time slots
export const DELIVERY_SLOTS = [
  { id: 'morning', name: 'الصباح (9:00 - 12:00)', timeRange: '09:00-12:00', isAvailable: true },
  { id: 'noon', name: 'الظهيرة (12:00 - 15:00)', timeRange: '12:00-15:00', isAvailable: true },
  { id: 'evening', name: 'المساء (15:00 - 18:00)', timeRange: '15:00-18:00', isAvailable: true },
  { id: 'night', name: 'الليل (18:00 - 21:00)', timeRange: '18:00-21:00', isAvailable: true },
];

// Get delivery information for a village
export const getDeliveryInfo = (villageId) => {
  const village = VILLAGES.find((v) => v.id === villageId);
  if (!village) return null;

  return {
    village,
    deliveryTime: village.deliveryTime,
    deliveryFee: village.deliveryFee,
    deliveryRadius: village.deliveryRadius,
    availableSlots: DELIVERY_SLOTS.filter((slot) => slot.isAvailable),
  };
};
