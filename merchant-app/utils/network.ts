// Network connectivity utilities for Merchant App
class NetworkManager {
  // Test connectivity by making a request to a reliable endpoint
  async testConnectivity(endpoint: string = 'https://www.google.com/favicon.ico'): Promise<boolean> {
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

  // Test API connectivity
  async testApiConnectivity(baseUrl: string): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error('API connectivity test failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const networkManager = new NetworkManager();

// Helper functions for common use cases
export const testConnectivity = (endpoint?: string) => networkManager.testConnectivity(endpoint);

export const testApiConnectivity = (baseUrl: string) => networkManager.testApiConnectivity(baseUrl);

export default networkManager;