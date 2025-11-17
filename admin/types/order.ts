export interface Order {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  storeId: string;
  storeName: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'cash' | 'card' | 'wallet';
  deliveryAddress: string;
  deliveryCoordinates: {
    lat: number;
    lng: number;
  };
  notes?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  completedAt?: string; // ISO date string
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export type OrderStatus = 
  | 'pending'          // طلب جديد
  | 'accepted'         // تمت الموافقة من المتجر
  | 'confirmed'        // تمت تأكيد الطلب من السائق
  | 'picked_up'        // تم استلام الطلب من المتجر
  | 'in_transit'       // في الطريق
  | 'delivered'        // تم التوصيل
  | 'cancelled'        // تم الإلغاء
 | 'refunded';        // تم استرداد الأموال

export interface Product {
  id: string;
  storeId: string;
  name: string;
  description: string;
  image?: string;
  price: number;
  category: string;
  availability: 'available' | 'out_of_stock';
  totalSold: number;
  createdAt: string; // ISO date string
}