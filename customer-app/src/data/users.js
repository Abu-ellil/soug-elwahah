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
        coordinates: { lat: 31.1107, lng: 30.9388 },
      },
      {
        id: 'addr2',
        type: 'work',
        details: 'مكتب البريد، كفر الشيخ',
        coordinates: { lat: 31.112, lng: 30.94 },
      },
    ],
  },
  {
    id: 'user2',
    name: 'فاطمة علي',
    phone: '01098765432',
    password: '123456',
    addresses: [
      {
        id: 'addr3',
        type: 'home',
        details: '25 شارع النيل، دسوق',
        coordinates: { lat: 31.1336, lng: 30.6439 },
      },
    ],
  },
  {
    id: 'user3',
    name: 'محمد حسن',
    phone: '01156789012',
    password: '123456',
    addresses: [
      {
        id: 'addr4',
        type: 'home',
        details: '10 شارع التحرير، فوه',
        coordinates: { lat: 30.55, lng: 30.9833 },
      },
    ],
  },
];

// مصفوفة طلبات تسجيل التجار - Merchant applications array
export const MERCHANT_APPLICATIONS = [
  {
    id: 'merchant1',
    name: 'متجر تجريبي',
    phone: '01000000',
    password: '123456',
    storeName: 'متجر تجريبي',
    storeDescription: 'هذا متجر تجريبي لعرض المنتجات',
    storeImage: 'https://via.placeholder.com/400x300?text=Store',
    status: 'pending', // pending, approved, rejected
    createdAt: '2025-01-01T00:00:00.000Z',
    role: 'merchant',
  },
];
