// Network connectivity utilities
import NetInfo from '@react-native-community/netinfo';

class NetworkManager {
  constructor() {
    this.isConnected = true;
    this.connectionType = 'unknown';
    this.listeners = new Set();
  }

  // Initialize network monitoring
  async initialize() {
    try {
      // Get initial network state
      const initialState = await NetInfo.fetch();
      this.updateConnectionState(initialState);

      // Subscribe to network state changes
      this.unsubscribe = NetInfo.addEventListener(state => {
        this.updateConnectionState(state);
      });

      console.log('Network monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize network monitoring:', error);
    }
  }

  // Update connection state and notify listeners
  updateConnectionState(state) {
    const wasConnected = this.isConnected;
    this.isConnected = state.isConnected && state.isInternetReachable;
    this.connectionType = state.type;

    // Notify listeners if connection status changed
    if (wasConnected !== this.isConnected) {
      this.listeners.forEach(callback => {
        try {
          callback(this.isConnected, this.connectionType);
        } catch (error) {
          console.error('Error in network listener:', error);
        }
      });
    }
  }

  // Check if device is connected to internet
  isInternetReachable() {
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
    if (this.unsubscribe) {
      this.unsubscribe();
    }
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
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
        details: state.details,
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