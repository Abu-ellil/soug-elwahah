export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  registeredAt: string; // ISO date string
  addresses?: Address[];
}

export interface Address {
  id: string;
  userId: string;
  name: string; // e.g., "المنزل", "العمل"
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  isDefault: boolean;
}