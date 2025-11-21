export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'disputed'
  | 'refunded';

export interface OrderItem {
  id?: string;
  productId?: string;
  quantity: number;
  product?: {
    name: string;
    price: number;
  };
}

export interface Order {
  id: string;
  orderNumber?: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
  estimatedDeliveryTime?: string;
  items: OrderItem[];
  payment?: {
    status: string;
  };
  isSynced?: boolean;
  statusHistory?: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  driverLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
    speed?: number;
  };
}
