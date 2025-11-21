const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/v1';

async function testOrdersEndpoint() {
  try {
    // First, register a test user with all required fields
    console.log('Registering test user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123',
      phone: '+201234567890', // Egyptian phone number format
      coordinates: [31.2357, 30.0444] // Cairo coordinates as an example
    });

    console.log('Registration response:', registerResponse.data);
    
    const token = registerResponse.data.token;
    
    if (token) {
      console.log('Successfully registered user, now testing orders endpoint...');
      
      // Test the orders endpoint
      const ordersResponse = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Orders response:', ordersResponse.data);
    } else {
      console.log('No token received, cannot test orders endpoint');
    }
  } catch (error) {
    if (error.response) {
      console.log('Error response:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

// Run the test
testOrdersEndpoint();