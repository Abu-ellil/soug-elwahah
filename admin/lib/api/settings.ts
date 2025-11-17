import { apiClient } from './client';

interface SettingsResponse {
  success: boolean;
  message: string;
 data: {
    settings: Settings;
 };
}

interface Settings {
  appName: string;
  logo: string;
  supportEmail: string;
  supportPhone: string;
  defaultDeliveryFee: number;
  maxDeliveryRadius: number;
  deliveryTimeEstimates: {
    min: number;
    max: number;
  };
  enableCash: boolean;
 enableCard: boolean;
  enableWallet: boolean;
  commissionRate: number;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  maintenanceMode: boolean;
  apiRateLimit: number;
}

interface UpdateSettingsPayload {
  appName?: string;
  logo?: string;
  supportEmail?: string;
  supportPhone?: string;
  defaultDeliveryFee?: number;
  maxDeliveryRadius?: number;
  deliveryTimeEstimates?: {
    min: number;
    max: number;
  };
  enableCash?: boolean;
  enableCard?: boolean;
  enableWallet?: boolean;
  commissionRate?: number;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
  maintenanceMode?: boolean;
  apiRateLimit?: number;
}

export const settingsAPI = {
  getSettings: async () => {
    return apiClient.get<SettingsResponse>('/admin/settings');
  },

  updateSettings: async (payload: UpdateSettingsPayload) => {
    return apiClient.patch<SettingsResponse>('/admin/settings', payload);
  },
};