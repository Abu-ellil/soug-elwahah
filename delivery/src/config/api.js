import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// For React Native, we typically use 10.0.2.2 for Android emulator or localhost for iOS simulator
// Since Expo can run on both, we'll use the tunnel URL or localhost
const API_BASE_URL = 'http://10.0.2.2:5000/api'; // Use this for Android emulator
// For iOS simulator, you might need to use: const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // Increased timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken'); // Changed from 'token' to 'userToken' to match the store
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Remove authorization header if no token is present
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

export default api;