// Network connectivity utilities for React Native/Expo
import * as Network from 'expo-network';

class NetworkManager {
  constructor() {
    this.isConnected = true;
    this.connectionType = 'unknown';
    this.listeners = new Set();
    this.initialized = false;
    this.checkInterval = null;
  }

  // Initialize network monitoring
  async initialize() {
    try {
      // Get initial state
      const networkState = await Network.getNetworkStateAsync();
      this.isConnected = networkState.isConnected && networkState.isInternetReachable;
      this.connectionType = networkState.type;

      // Start periodic checking (every 5 seconds)
      this.startPeriodicCheck();

      this.initialized = true;
      console.log('Network monitoring initialized:', {
        isConnected: this.isConnected,
        type: this.connectionType,
      });
    } catch (error) {
      console.error('Failed to initialize network monitoring:', error);
      // Fallback to assuming connected
      this.isConnected = true;
    }
  }

  // Start periodic network checking
  startPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        const wasConnected = this.isConnected;
        this.isConnected = networkState.isConnected && networkState.isInternetReachable;
        this.connectionType = networkState.type;

        // Notify listeners if connection state changed
        if (wasConnected !== this.isConnected) {
          console.log(`Network state changed: ${this.isConnected ? 'Online' : 'Offline'}`);
          this.notifyListeners(this.isConnected);
        }
      } catch (error) {
        console.error('Error checking network state:', error);
      }
    }, 5000); // Check every 5 seconds
  }

  // Stop periodic checking
  stopPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  // Notify all listeners of network state change
  notifyListeners(isConnected) {
    this.listeners.forEach((callback) => {
      try {
        callback(isConnected);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
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
    this.stopPeriodicCheck();
  }

  // Refresh network state
  async refresh() {
    try {
      const networkState = await Network.getNetworkStateAsync();
      this.isConnected = networkState.isConnected && networkState.isInternetReachable;
      this.connectionType = networkState.type;
      return this.isConnected;
    } catch (error) {
      console.error('Failed to refresh network state:', error);
      return this.isConnected;
    }
  }

  // Test connectivity by making a request to a reliable endpoint
  async testConnectivity(endpoint = 'https://www.google.com/favicon.ico') {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // Increased timeout to 8 seconds

      const response = await fetch(endpoint, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('Connectivity test failed:', error);
      // Check if it's a timeout/abort error specifically
      if (error.name === 'AbortError') {
        console.log('Connectivity test timed out - device may have slow connection');
      }
      return false;
    }
  }

  // Get detailed network information
  async getNetworkInfo() {
    try {
      const networkState = await Network.getNetworkStateAsync();
      return {
        isConnected: networkState.isConnected,
        isInternetReachable: networkState.isInternetReachable,
        type: networkState.type,
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
