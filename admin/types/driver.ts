export interface Driver {
  id: string;
  name: string;
  email?: string;
  phone: string;
  avatar?: string;
  vehicleType: string;
 vehicleNumber: string;
  rating: number;
  totalOrders: number;
  totalEarnings: number;
  status: 'available' | 'busy' | 'offline';
  verificationStatus: 'pending' | 'approved' | 'rejected';
  documents?: DriverDocument[];
  acceptanceRate: number;
  completionRate: number;
  createdAt: string; // ISO date string
}

export interface DriverDocument {
  id: string;
  driverId: string;
  type: 'national_id' | 'driving_license';
  fileName: string;
  filePath: string;
  uploadedAt: string; // ISO date string
}

export interface Village {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  totalStores: number;
  totalUsers: number;
  totalDrivers: number;
}