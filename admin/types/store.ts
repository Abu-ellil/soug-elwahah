export interface Store {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  category: string;
  image?: string;
 rating: number;
 totalOrders: number;
  status: 'open' | 'closed' | 'suspended';
  verificationStatus: 'pending' | 'approved' | 'rejected';
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  workingHours: {
    open: string; // e.g., "08:00"
    close: string; // e.g., "22:00"
  };
  documents?: StoreDocument[];
  totalProducts: number;
  totalRevenue: number;
  createdAt: string; // ISO date string
}

export interface StoreDocument {
  id: string;
  storeId: string;
  type: 'commercial_register' | 'tax_card' | 'owner_id';
  fileName: string;
  filePath: string;
 uploadedAt: string; // ISO date string
}

export interface Category {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  icon: string;
  color: string;
  order: number;
  status: 'active' | 'inactive';
  totalStores: number;
}