const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/v1';

// Test credentials - these should match a real user in the database
const TEST_USER = {
  email: 'aboellil.me@gmail.com',
  password: 'password123' // Assuming this is the password for the test user
};

// The specific order ID from the task description
const ORDER_ID = '690423349e067584cd9e324d';

async function testNotification() {
  try {
    console.log('Testing order status change notification...');
    
    // First, login to get authentication token
    console.log('Logging in as test user...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    
    console.log('Login response:', loginResponse.data);
    
    const token = loginResponse.data.token;
    
    if (!token) {
      console.log('No token received, cannot test order status update');
      return;
    }
    
    // Set up authorization header
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    // Get the order to verify it exists
    console.log('\\nFetching order details...');
    const orderResponse = await axios.get(`${API_BASE_URL}/orders/${ORDER_ID}`, {
      headers
    });
    
    console.log('Fetched order:', orderResponse.data);
    
    // Test changing order status to 'confirmed'
    console.log('\\nUpdating order status to confirmed...');
    const statusUpdateResponse = await axios.put(`${API_BASE_URL}/orders/${ORDER_ID}/status`, {
      status: 'confirmed'
    }, {
      headers
    });
    
    console.log('Status update response:', statusUpdateResponse.data);
    
    // Get user's notifications to verify notification was created
    console.log('\\nFetching user notifications...');
    const notificationsResponse = await axios.get(`${API_BASE_URL}/notifications`, {
      headers
    });
    
    console.log('User notifications:', notificationsResponse.data);
    
    // Test changing order status to other states to verify notifications work
    console.log('\\nUpdating order status to preparing...');
    const preparingResponse = await axios.put(`${API_BASE_URL}/orders/${ORDER_ID}/status`, {
      status: 'preparing'
    }, {
      headers
    });
    
    console.log('Preparing status update response:', preparingResponse.data);
    
    // Get notifications again
    console.log('\\nFetching notifications after preparing status...');
    const notificationsAfterPreparing = await axios.get(`${API_BASE_URL}/notifications`, {
      headers
    });
    
    console.log('Notifications after preparing:', notificationsAfterPreparing.data);
    
    // Test changing to delivered
    console.log('\\nUpdating order status to delivered...');
    const deliveredResponse = await axios.put(`${API_BASE_URL}/orders/${ORDER_ID}/status`, {
      status: 'delivered'
    }, {
      headers
    });
    
    console.log('Delivered status update response:', deliveredResponse.data);
    
    // Get final notifications
    console.log('\\nFetching final notifications...');
    const finalNotifications = await axios.get(`${API_BASE_URL}/notifications`, {
      headers
    });
    
    console.log('Final notifications:', finalNotifications.data);
    
  } catch (error) {
    console.log('\\nError occurred during testing:');
    if (error.response) {
      console.log('Error response data:', error.response.data);
      console.log('Error status:', error.response.status);
      console.log('Error headers:', error.response.headers);
    } else {
      console.log('Error message:', error.message);
    }
 }
}

// Run the test
testNotification();