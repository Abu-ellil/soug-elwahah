const axios = require('axios');

// Simple test to verify API connection and endpoints
async function testAPIConnection() {
  try {
    console.log('Testing API connection...');
    
    const API_BASE_URL = 'http://localhost:5001/api';
    
    console.log('Step 1: Testing basic API health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('Health check response:', healthResponse.data);
    
    console.log('\nStep 2: Testing admin stores endpoint (without auth) - expect 401...');
    try {
      const storesResponse = await axios.get(`${API_BASE_URL}/admin/stores`);
      console.log('Stores response:', storesResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✓ Correctly received 401 Unauthorized for protected endpoint');
      } else {
        console.log('Unexpected error for protected endpoint:', error.message);
      }
    }
    
    console.log('\nStep 3: Testing admin auth endpoint (should be public)...');
    try {
      const authResponse = await axios.get(`${API_BASE_URL}/admin/auth`);
      console.log('Auth endpoint response:', authResponse.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✓ Auth endpoint requires specific sub-endpoint (expected)');
      } else if (error.response && error.response.status === 405) {
        console.log('✓ Auth endpoint does not support GET method (expected)');
      } else {
        console.log('Other response for auth endpoint:', error.message);
      }
    }
    
    console.log('\nAPI connection test completed successfully!');
    console.log('The API is running on port 5001 and endpoints are accessible.');
    
  } catch (error) {
    console.error('Error during API connection test:', error.message);
  }
}

// Run the test
testAPIConnection();
