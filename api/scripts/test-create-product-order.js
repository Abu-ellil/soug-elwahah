const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/v1';

async function testCreateProductAndOrder() {
  try {
    // First, register a test seller
    console.log('Registering test seller...');
    const sellerRegisterResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      firstName: 'Test',
      lastName: 'Seller',
      email: 'testseller@example.com',
      password: 'password123',
      phone: '+201234567892', // Egyptian phone number format
      coordinates: [31.2357, 30.0444] // Cairo coordinates as an example
    });

    console.log('Seller registration response:', sellerRegisterResponse.data.message);
    
    const sellerToken = sellerRegisterResponse.data.token;
    
    if (sellerToken) {
      console.log('Successfully registered seller, now creating a test product...');
      
      // Create a test product
      const productData = {
        title: "Test Product",
        description: "A test product for testing orders",
        price: 150,
        category: "690410b02398e1df4ad7fc4c", // This might not exist, but we'll handle the error gracefully
        condition: "new",
        stock: 10,
        location: {
          type: "Point",
          coordinates: [31.2357, 30.0444]
        }
      };
      
      try {
        const createProductResponse = await axios.post(`${API_BASE_URL}/products`, productData, {
          headers: {
            'Authorization': `Bearer ${sellerToken}`
          }
        });
        
        console.log('Product creation response:', createProductResponse.data);
      } catch (productError) {
        console.log('Product creation failed (we will continue with order test anyway):', productError.response?.data?.message || productError.message);
      }
      
      // Now register a test buyer
      console.log('Registering test buyer...');
      const buyerRegisterResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
        firstName: 'Test',
        lastName: 'Buyer',
        email: 'testbuyer@example.com',
        password: 'password123',
        phone: '+201234567893', // Egyptian phone number format
        coordinates: [31.2357, 30.0444] // Cairo coordinates as an example
      });

      console.log('Buyer registration response:', buyerRegisterResponse.data.message);
      
      const buyerToken = buyerRegisterResponse.data.token;
      
      if (buyerToken) {
        console.log('Successfully registered buyer, now testing order creation...');
        
        // Test creating an order with a dummy product ID to see if the schema issue is fixed
        const orderData = {
          items: [
            {
              product: "690410b02398e1df4ad7fc4d", // Non-existent product ID
              quantity: 1,
              price: 100
            }
          ],
          totalAmount: 100,
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
              'Authorization': `Bearer ${buyerToken}`
            }
          });
          
          console.log('Order creation response:', createOrderResponse.data);
        } catch (orderError) {
          console.log('Order creation failed as expected (product does not exist):', orderError.response?.data?.message || orderError.message);
        }
        
        // Test the orders endpoint for the buyer
        console.log('Testing orders endpoint for buyer...');
        const buyerOrdersResponse = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${buyerToken}`
          }
        });
        
        console.log('Buyer orders response:', buyerOrdersResponse.data);
        
        // Test the orders endpoint for the seller
        console.log('Testing orders endpoint for seller...');
        const sellerOrdersResponse = await axios.get(`${API_BASE_URL}/orders/my-orders`, {
          headers: {
            'Authorization': `Bearer ${sellerToken}`
          }
        });
        
        console.log('Seller orders response:', sellerOrdersResponse.data);
      }
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
testCreateProductAndOrder();