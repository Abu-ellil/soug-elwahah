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
    status: 'delivered', // pending, confirmed, delivering, delivered, cancelled
    address: '15 شارع المدرسة، كفر الشيخ',
    paymentMethod: 'cash',
    notes: 'رجاء الاتصال عند الوصول',
    createdAt: '2025-01-15T10:30:00',
    timeline: [
      { status: 'pending', time: '2025-01-15T10:30:00' },
      { status: 'confirmed', time: '2025-01-15T10:35:00' },
      { status: 'delivering', time: '2025-01-15T11:00:00' },
      { status: 'delivered', time: '2025-01-15T11:30:00' }
    ]
  },
  {
    id: 'ord2',
    userId: 'user1',
    storeId: 's2',
    items: [
      { productId: 'p6', quantity: 1, price: 12.00 },
      { productId: 'p7', quantity: 1, price: 25.00 }
    ],
    subtotal: 37.00,
    deliveryFee: 10.00,
    total: 47.00,
    status: 'delivering',
    address: '15 شارع المدرسة، كفر الشيخ',
    paymentMethod: 'cash',
    notes: '',
    createdAt: '2025-01-16T14:20:00',
    timeline: [
      { status: 'pending', time: '2025-01-16T14:20:00' },
      { status: 'confirmed', time: '2025-01-16T14:25:00' },
      { status: 'delivering', time: '2025-01-16T15:00:00' }
    ]
  },
  {
    id: 'ord3',
    userId: 'user2',
    storeId: 's3',
    items: [
      { productId: 'p9', quantity: 1, price: 30.00 },
      { productId: 'p10', quantity: 1, price: 15.00 }
    ],
    subtotal: 45.00,
    deliveryFee: 10.00,
    total: 55.00,
    status: 'confirmed',
    address: '25 شارع النيل، دسوق',
    paymentMethod: 'cash',
    notes: 'بدون بصل',
    createdAt: '2025-01-17T12:15:00',
    timeline: [
      { status: 'pending', time: '2025-01-17T12:15:00' },
      { status: 'confirmed', time: '2025-01-17T12:20:00' }
    ]
  },
  {
    id: 'ord4',
    userId: 'user1',
    storeId: 's4',
    items: [
      { productId: 'p12', quantity: 2, price: 8.00 },
      { productId: 'p13', quantity: 3, price: 6.00 }
    ],
    subtotal: 46.00,
    deliveryFee: 10.00,
    total: 56.00,
    status: 'pending',
    address: '15 شارع المدرسة، كفر الشيخ',
    paymentMethod: 'cash',
    notes: '',
    createdAt: '2025-01-18T09:45:00',
    timeline: [
      { status: 'pending', time: '2025-01-18T09:45:00' }
    ]
  },
  {
    id: 'ord5',
    userId: 'user3',
    storeId: 's8',
    items: [
      { productId: 'p22', quantity: 5, price: 2.00 },
      { productId: 'p23', quantity: 2, price: 5.00 }
    ],
    subtotal: 20.00,
    deliveryFee: 10.00,
    total: 30.00,
    status: 'cancelled',
    address: '10 شارع التحرير، فوه',
    paymentMethod: 'cash',
    notes: 'تم الإلغاء بسبب عدم توفر الخبز',
    createdAt: '2025-01-17T08:30:00',
    timeline: [
      { status: 'pending', time: '2025-01-17T08:30:00' },
      { status: 'cancelled', time: '2025-01-17T09:00:00' }
    ]
  }
];