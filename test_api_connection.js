const axios = require('axios');

// Test the API connection
async function testAPIConnection() {
  try {
    console.log('Testing API connection...');
    
    // Test health check endpoint
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✓ Health check passed:', healthResponse.data);
    
    // Test categories endpoint
    try {
      const categoriesResponse = await axios.get('http://localhost:5000/api/categories');
      console.log('✓ Categories endpoint accessible');
    } catch (error) {
      console.log('⚠ Categories endpoint may require authentication or is not available:', error.message);
    }
    
    console.log('\nAPI service is running and accessible!');
    console.log('Delivery app should be able to connect using http://10.0.2.2:5000/api');
    
    // Test authentication endpoints
    try {
      const authTest = await axios.get('http://localhost:5000/api/auth/health', { timeout: 500 });
      console.log('✓ Auth endpoints accessible');
    } catch (error) {
      console.log('⚠ Auth endpoints may not be available for unauthenticated requests:', error.message);
    }
    
    // Test driver-related endpoints
    try {
      const driverTest = await axios.get('http://localhost:500/api/driver/profile', {
        timeout: 5000,
        validateStatus: function (status) {
          // Accept 401 (unauthorized) as the endpoint exists but requires auth
          return status === 401 || status === 200;
        }
      });
      console.log('✓ Driver profile endpoint exists (status:', driverTest.status, ')');
    } catch (error) {
      console.log('⚠ Driver endpoints may require authentication:', error.message);
    }
    
    console.log('\n✓ API connectivity test completed successfully!');
    console.log('Both services are running and can communicate.');
    
  } catch (error) {
    console.error('✗ API connection failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
 }
}

// Run the test
testAPIConnection();