import apiService from '../services/api';

// Test function to verify API connectivity
export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    
    // Try to make a simple request to check if the API is reachable
    // For now we'll try to get all stores (public endpoint)
    const response = await apiService.request('/store');
    console.log('API connection successful:', response);
    return { success: true, data: response };
  } catch (error: any) {
    console.error('API connection failed:', error);
    return { success: false, error: error.message };
  }
};

// Test login functionality
export const testLogin = async (credentials: { email: string; password: string }) => {
  try {
    console.log('Testing login...');
    const response = await apiService.login(credentials);
    console.log('Login successful:', response);
    
    // Store the token for future requests
    if (response.token) {
      await apiService.setToken(response.token);
    }
    
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Login failed:', error);
    return { success: false, error: error.message };
  }
};

// Test getting store profile (requires authentication)
export const testGetProfile = async () => {
  try {
    console.log('Testing get profile...');
    const response = await apiService.getProfile();
    console.log('Get profile successful:', response);
    return { success: true, data: response };
  } catch (error: any) {
    console.error('Get profile failed:', error);
    return { success: false, error: error.message };
  }
};