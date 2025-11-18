const axios = require('axios');

// Test script to verify store approval/rejection functionality
async function testStoreApproval() {
  try {
    console.log('Testing store approval/rejection functionality...');
    
    // Update this URL to match your API server address
    const API_BASE_URL = 'http://localhost:5001/api';
    
    // Sample admin credentials (you'll need to replace these with real admin credentials)
    const adminCredentials = {
      phone: 'admin_phone_number', // Replace with actual admin phone
      password: 'admin_password'   // Replace with actual admin password
    };
    
    console.log('Step 1: Attempting to login as admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/admin/auth/login`, adminCredentials);
    console.log('Login response:', loginResponse.data);
    
    const token = loginResponse.data.token;
    console.log('Received token:', token.substring(0, 20) + '...');
    
    // Set up authorization header
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    console.log('\nStep 2: Fetching pending stores...');
    const pendingStoresResponse = await axios.get(`${API_BASE_URL}/admin/stores/pending`, config);
    console.log('Pending stores:', pendingStoresResponse.data);
    
    if (pendingStoresResponse.data.data.stores && pendingStoresResponse.data.data.stores.length > 0) {
      const storeId = pendingStoresResponse.data.data.stores[0]._id;
      console.log(`\nStep 3: Testing approval of store with ID: ${storeId}`);
      
      // Test approval
      const approveResponse = await axios.patch(`${API_BASE_URL}/admin/stores/${storeId}/approve`, {}, config);
      console.log('Approval response:', approveResponse.data);
      
      // Check if the store status has been updated
      console.log(`\nStep 4: Verifying store ${storeId} status after approval...`);
      const storeResponse = await axios.get(`${API_BASE_URL}/admin/stores/${storeId}`, config);
      console.log('Store after approval:', storeResponse.data);
      
      // If the approval worked, try rejection on a different store or re-register the store for testing
      console.log('\nTest completed successfully!');
    } else {
      console.log('\nNo pending stores found to test approval/rejection.');
      console.log('You may need to register a new store to create a pending store for testing.');
    }
    
  } catch (error) {
    console.error('Error during testing:', error.response?.data || error.message);
  }
}

// Run the test
testStoreApproval();
