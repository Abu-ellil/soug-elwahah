// Network connectivity utilities for Expo

class NetworkManager {
  constructor() {
    this.isConnected = true;
    this.connectionType = 'unknown';
    this.listeners = new Set();
    this.initialized = false;
  }

  // Initialize network monitoring
  async initialize() {
    try {
      // For Expo, we'll use a simple connectivity test approach
      // since NetInfo might not work properly in all Expo environments
      this.initialized = true;
      console.log('Network monitoring initialized (Expo mode)');
    } catch (error) {
      console.error('Failed to initialize network monitoring:', error);
    }
  }

  // Check if device is connected to internet
  isInternetReachable() {
    // Simple approach: try to detect if we're in browser/web or mobile
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return this.isConnected;
  }

  // Get current connection type
  getConnectionType() {
    return this.connectionType;
  }

  // Add listener for network changes
  addListener(callback) {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  // Remove all listeners
  removeAllListeners() {
    this.listeners.clear();
  }

  // Test connectivity by making a request to a reliable endpoint
  async testConnectivity(endpoint = 'https://www.google.com/favicon.ico') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(endpoint, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('Connectivity test failed:', error);
      return false;
    }
  }

  // Get detailed network information
  async getNetworkInfo() {
    try {
      // Simple network info for Expo apps
      return {
        isConnected: this.isInternetReachable(),
        isInternetReachable: this.isInternetReachable(),
        type: 'unknown',
        details: null,
      };
    } catch (error) {
      console.error('Failed to get network info:', error);
      return null;
    }
  }
}

// Create singleton instance
export const networkManager = new NetworkManager();

// Helper functions for common use cases
export const isConnected = () => networkManager.isInternetReachable();

export const getConnectionType = () => networkManager.getConnectionType();

export const testConnectivity = (endpoint) => networkManager.testConnectivity(endpoint);

export const getNetworkInfo = () => networkManager.getNetworkInfo();

// Initialize network monitoring when module is imported
networkManager.initialize();