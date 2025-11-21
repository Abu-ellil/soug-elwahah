const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/v1';

async function testCreateOrder() {
  try {
    // First, register a test user
    console.log('Registering test user...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'Order',
      email: 'testorder@example.com',
      password: 'password123',
      phone: '+201234567891', // Egyptian phone number format
      coordinates: [31.2357, 30.0444] // Cairo coordinates as an example
    });

    console.log('Registration response:', registerResponse.data.message);
    
    const token = registerResponse.data.token;
    
    if (token) {
      console.log('Successfully registered user, now testing order creation...');
      
      // Test creating an order
      const orderData = {
        items: [
          {
            product: "690410b02398e1df4ad7fc4b", // This might not exist, but let's test the schema handling
            quantity: 2,
            price: 100
          }
        ],
        totalAmount: 200,
        deliveryInfo: {
          type: "delivery",
          address: {
            street: "Test Street",
            buildingNumber: "123"
          }
        },
        payment: {
          method: "cash",
          status: "pending"
        },
        status: "pending"
      };
      
      try {
        const createOrderResponse = await axios.post(`${API_BASE_URL}/orders`, orderData, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Order creation response:', createOrderResponse.data);
      } catch (orderError) {
        console.log('Order creation failed (expected if product ID does not exist):', orderError.response?.data?.message || orderError.message);
      }
      
      // Now test the orders endpoint again
      console.log('Testing orders endpoint again...');
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
testCreateOrder();