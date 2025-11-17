import { BASE_URL } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Service for Merchant App
class ApiService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = BASE_URL;
  }

  // Set authentication token
  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem('merchant_token', token);
  }

  // Get authentication token
  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await AsyncStorage.getItem('merchant_token');
    }
    return this.token;
  }

  // Remove authentication token
  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem('merchant_token');
  }

  // Generic API request method
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    const token = await this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle different response status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  }

  // Authentication methods
  login(credentials: { email: string; password: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  register(merchantData: { email: string; password: string; name: string; storeName: string }) {
    return this.request('/auth/store/register', {
      method: 'POST',
      body: JSON.stringify(merchantData),
    });
  }

  // Store profile methods
  getProfile() {
    return this.request('/store/profile');
  }

  updateProfile(profileData: any) {
    return this.request('/store/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // Products methods
  getProducts() {
    return this.request('/store/products');
  }

  addProduct(productData: any) {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      formData.append(key, productData[key]);
    });

    return this.request('/store/products', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't include Content-Type header for FormData (it will be set automatically)
        // 'Content-Type': 'multipart/form-data' // This is handled automatically by fetch
      },
    });
  }

  updateProduct(productId: string, productData: any) {
    return this.request(`/store/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  deleteProduct(productId: string) {
    return this.request(`/store/products/${productId}`, {
      method: 'DELETE',
    });
  }

  toggleProductAvailability(productId: string) {
    return this.request(`/store/products/${productId}/toggle-availability`, {
      method: 'PATCH',
    });
  }

  // Orders methods
  getOrders() {
    return this.request('/store/orders');
  }

  getOrder(orderId: string) {
    return this.request(`/store/orders/${orderId}`);
  }

  updateOrderStatus(orderId: string, status: string) {
    return this.request(`/store/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Statistics methods
  getStatistics() {
    return this.request('/store/statistics');
  }
}

export default new ApiService();