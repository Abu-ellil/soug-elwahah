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
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add authorization header if token exists
    const token = await this.getToken();
    if (token) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

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
  login(credentials: { phone: string; password: string; role: string }) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  register(merchantData: { email: string; phone: string; password: string; name: string; storeName: string; storeDescription?: string; storeImage?: string; coordinates?: { lat: number; lng: number } }) {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('email', merchantData.email);
    formData.append('phone', merchantData.phone);
    formData.append('password', merchantData.password);
    formData.append('name', merchantData.name);
    formData.append('storeName', merchantData.storeName);
    
    if (merchantData.storeDescription) {
      formData.append('storeDescription', merchantData.storeDescription);
    }
    
    // Add coordinates if provided
    if (merchantData.coordinates) {
      formData.append('coordinates[lat]', merchantData.coordinates.lat.toString());
      formData.append('coordinates[lng]', merchantData.coordinates.lng.toString());
    }
    
    // Add image as file if it exists and is not just a URL
    if (merchantData.storeImage) {
      if (merchantData.storeImage.startsWith('http')) {
        // If it's a URL, send as string
        formData.append('storeImage', merchantData.storeImage);
      } else {
        // If it's a local file URI, add as a file
        formData.append('storeImage', {
          uri: merchantData.storeImage,
          type: 'image/jpeg', // Could be improved to detect type
          name: 'store_image.jpg' // Could be improved to extract filename
        } as any);
      }
    }

    return this.request('/auth/store/register', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type header for FormData (it will be set automatically)
      },
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

  // Update store coordinates
  updateStoreCoordinates(coordinates: { lat: number; lng: number }) {
    return this.request('/store/coordinates', {
      method: 'PUT',
      body: JSON.stringify({ coordinates }),
    });
  }
}

export default new ApiService();