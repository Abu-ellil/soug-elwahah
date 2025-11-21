/**
 * @file test-driver-app-integration.js - Driver App Integration Test
 * @description Test script to verify the driver app can register and login successfully
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testDriverApp() {
  console.log('🚗 Testing Driver App Integration...\n');

  // Test data
  const testDriver = {
    name: 'أحمد محمد السائق',
    email: 'ahmed.driver@test.com',
    phone: '01234567891',
    password: '123456',
    vehicle: {
      type: 'car',
      model: 'Toyota',
      make: 'Camry',
      plateNumber: 'ABC1234'
    }
  };

  try {
    // Test 1: Driver Registration
    console.log('1️⃣ Testing Driver Registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/driver/register`, testDriver);
    
    if (registerResponse.data.success) {
      console.log('✅ Driver registration successful!');
      console.log('📊 Response:', {
        success: registerResponse.data.success,
        userId: registerResponse.data.data?.id,
        email: registerResponse.data.data?.email,
        vehicleType: registerResponse.data.data?.vehicle?.vehicleType
      });
      
      const token = registerResponse.data.token;
      console.log('🔑 Token received:', token ? 'Yes' : 'No');
      
      // Test 2: Driver Login with same credentials
      console.log('\n2️⃣ Testing Driver Login...');
      const loginResponse = await axios.post(`${BASE_URL}/auth/driver/login`, {
        email: testDriver.email,
        password: testDriver.password
      });
      
      if (loginResponse.data.success) {
        console.log('✅ Driver login successful!');
        console.log('📊 Response:', {
          success: loginResponse.data.success,
          userId: loginResponse.data.data?.id,
          email: loginResponse.data.data?.email,
          isOnline: loginResponse.data.data?.isOnline
        });
        
        const loginToken = loginResponse.data.token;
        console.log('🔑 Login token received:', loginToken ? 'Yes' : 'No');
        
        // Test 3: Get Driver Profile
        console.log('\n3️⃣ Testing Driver Profile...');
        const profileResponse = await axios.get(`${BASE_URL}/auth/driver/me`, {
          headers: {
            'Authorization': `Bearer ${loginToken}`
          }
        });
        
        if (profileResponse.data.success) {
          console.log('✅ Driver profile retrieval successful!');
          console.log('📊 Profile Data:', {
            name: profileResponse.data.data?.name,
            email: profileResponse.data.data?.email,
            phone: profileResponse.data.data?.phone,
            vehicle: profileResponse.data.data?.vehicle,
            isVerified: profileResponse.data.data?.isVerified
          });
        } else {
          console.log('❌ Failed to get driver profile');
        }
        
      } else {
        console.log('❌ Driver login failed');
        console.log('📊 Error:', loginResponse.data);
      }
      
    } else {
      console.log('❌ Driver registration failed');
      console.log('📊 Error:', registerResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    if (error.response) {
      console.error('📊 Server response:', error.response.data);
      console.error('📊 Status code:', error.response.status);
    }
  }
  
  console.log('\n🏁 Driver App Integration Test Complete!');
}

// Run the test
if (require.main === module) {
  testDriverApp();
}

module.exports = testDriverApp;