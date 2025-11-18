// Test basic internet connectivity
export const testConnectivity = async () => {
  try {
    // Try to fetch from a reliable endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('Network connectivity test failed:', error);
    return false;
  }
};

// Test API connectivity specifically
export const testApiConnectivity = async (baseUrl) => {
  try {
    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    console.warn('API connectivity test failed:', error);
    return false;
  }
};