// API Service for Customer App
import { BASE_URL } from '../config/api';
import { getToken, removeToken } from '../utils/storage';

// Create a base API request function with retry mechanism
const apiRequest = async (endpoint, options = {}) => {
  // Check network status before making a request
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('Network request failed: Device is offline.');
  }

  const {
    method = 'GET',
    body,
    headers = {},
    timeout = 30000,
    retries = 3,
    ...restOptions
  } = options; // Increased timeout from 1000 to 30000, added retries

  const config = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...restOptions,
  };

  if (body && typeof body === 'object') {
    config.body = JSON.stringify(body);
  }

  // Retry mechanism
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Adding timeout functionality using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle different response status codes
        const errorData = await response.json().catch(() => ({}));

        // If token is invalid or expired (401), log out the user
        if (response.status === 401) {
          // Check if the error is related to token
          if (
            errorData.message &&
            (errorData.message.includes('Token') ||
              errorData.message.toLowerCase().includes('token') ||
              errorData.message.includes('jwt') ||
              errorData.message.toLowerCase().includes('invalid') ||
              errorData.message.toLowerCase().includes('expired'))
          ) {
            // Remove the invalid token from storage
            await removeToken();
            // Re-throw the error so the calling function can handle it
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
          }
        }

        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request error (attempt ${attempt + 1}/${retries + 1}):`, error);
      lastError = error; // Store the original error

      if (error.name === 'AbortError') {
        lastError = new Error(`Request timed out after ${timeout / 1000} seconds.`);
      } else if (error.name === 'TypeError' && error.message === 'Network request failed') {
        lastError = new Error('Network request failed. Please check your internet connection.');
      }

      // If this was the last attempt, or it's an error we don't want to retry, throw the error
      // For now, we retry all network-related errors.
      if (attempt === retries) {
        break;
      }

      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  // If all retries failed, throw the last error
  throw lastError;
};

// Authentication API
export const authAPI = {
  login: (credentials) =>
    apiRequest('/auth/customer/login', {
      method: 'POST',
      body: credentials,
    }),

  registerCustomer: (userData) =>
    apiRequest('/auth/customer/register', {
      method: 'POST',
      body: userData,
    }),

  getMe: (token) =>
    apiRequest('/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// Categories API
export const categoriesAPI = {
  getCategories: () => apiRequest('/categories'),
};

// Stores API
export const storesAPI = {
  getNearbyStores: (params) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/customer/stores/nearby${queryParams ? `?${queryParams}` : ''}`, {
      method: 'GET',
      timeout: 60000, // Specific timeout for location-based requests (increased to 60 seconds)
      retries: 3,
    });
  },

  searchStores: (query, villageId) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (villageId) params.append('villageId', villageId);
    const queryParams = params.toString();
    return apiRequest(`/customer/stores/search${queryParams ? `?${queryParams}` : ''}`);
  },

  getStoreDetails: (storeId) => apiRequest(`/customer/stores/${storeId}`),

  getStoreProducts: (storeId, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(
      `/customer/stores/${storeId}/products${queryParams ? `?${queryParams}` : ''}`
    );
  },
};

// Products API
export const productsAPI = {
  getProductDetails: (productId) => apiRequest(`/customer/products/${productId}`),
};

// Orders API
export const ordersAPI = {
  createOrder: (orderData, token) =>
    apiRequest('/customer/orders', {
      method: 'POST',
      body: orderData,
      headers: { Authorization: `Bearer ${token}` },
    }),

  getMyOrders: (token, params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    return apiRequest(`/customer/orders${queryParams ? `?${queryParams}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  getOrderDetails: (orderId, token) =>
    apiRequest(`/customer/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  cancelOrder: (orderId, cancelReason, token) =>
    apiRequest(`/customer/orders/${orderId}/cancel`, {
      method: 'PATCH',
      body: { cancelReason },
      headers: { Authorization: `Bearer ${token}` },
    }),

  reorder: (orderId, token) =>
    apiRequest(`/customer/orders/${orderId}/reorder`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// Addresses API
export const addressesAPI = {
  getMyAddresses: (token) =>
    apiRequest('/customer/addresses', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  addAddress: (addressData, token) =>
    apiRequest('/customer/addresses', {
      method: 'POST',
      body: addressData,
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateAddress: (addressId, addressData, token) =>
    apiRequest(`/customer/addresses/${addressId}`, {
      method: 'PUT',
      body: addressData,
      headers: { Authorization: `Bearer ${token}` },
    }),

  deleteAddress: (addressId, token) =>
    apiRequest(`/customer/addresses/${addressId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// Customer Profile API
export const profileAPI = {
  getProfile: (token) =>
    apiRequest('/customer/profile', {
      headers: { Authorization: `Bearer ${token}` },
    }),

  updateProfile: (profileData, token) =>
    apiRequest('/customer/profile', {
      method: 'PUT',
      body: profileData,
      headers: { Authorization: `Bearer ${token}` },
    }),
};

// Export all APIs as a single object
export const API = {
  authAPI,
  categoriesAPI,
  storesAPI,
  productsAPI,
  ordersAPI,
  addressesAPI,
  profileAPI,
};

export default API;
