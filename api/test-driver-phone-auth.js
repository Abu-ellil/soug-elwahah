/**
 * @file test-driver-phone-auth.js - Driver Phone Authentication Test
 * @description Test script to verify driver authentication works with phone numbers
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testDriverPhoneAuth() {
  console.log('📱 Testing Driver Phone Authentication...\n');

  // Test data
  const testDriver = {
    name: 'سالم أحمد السائق',
    email: 'salem.driver@test.com',
    phone: '01234567890',
    password: '123456',
    vehicle: {
      type: 'motorcycle',
      model: 'Honda',
      make: 'CB150R',
      plateNumber: 'MOT5678'
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
        phone: registerResponse.data.data?.phone,
        vehicleType: registerResponse.data.data?.vehicle?.vehicleType
      });
      
      // Test 2: Driver Login with Phone Number (THE MAIN TEST)
      console.log('\n2️⃣ Testing Driver Login with Phone Number...');
      const phoneLoginResponse = await axios.post(`${BASE_URL}/auth/driver/login`, {
        phone: testDriver.phone,
        password: testDriver.password
      });
      
      if (phoneLoginResponse.data.success) {
        console.log('✅ Driver phone login successful!');
        console.log('📊 Response:', {
          success: phoneLoginResponse.data.success,
          userId: phoneLoginResponse.data.data?.id,
          email: phoneLoginResponse.data.data?.email,
          phone: phoneLoginResponse.data.data?.phone,
          isOnline: phoneLoginResponse.data.data?.isOnline
        });
        
        const loginToken = phoneLoginResponse.data.token;
        console.log('🔑 Login token received:', loginToken ? 'Yes' : 'No');
        
        // Test 3: Also test email login to ensure both work
        console.log('\n3️⃣ Testing Driver Login with Email (Cross-check)...');
        const emailLoginResponse = await axios.post(`${BASE_URL}/auth/driver/login`, {
          email: testDriver.email,
          password: testDriver.password
        });
        
        if (emailLoginResponse.data.success) {
          console.log('✅ Driver email login successful!');
          console.log('📊 Response:', {
            success: emailLoginResponse.data.success,
            userId: emailLoginResponse.data.data?.id,
            email: emailLoginResponse.data.data?.email,
            phone: emailLoginResponse.data.data?.phone
          });
          
          // Test 4: Get Driver Profile with phone login token
          console.log('\n4️⃣ Testing Driver Profile with Phone Auth Token...');
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
            
            console.log('\n🎉 ALL TESTS PASSED! Phone-based authentication is working correctly.');
            
          } else {
            console.log('❌ Failed to get driver profile');
            console.log('📊 Error:', profileResponse.data);
          }
          
        } else {
          console.log('❌ Driver email login failed');
          console.log('📊 Error:', emailLoginResponse.data);
        }
        
      } else {
        console.log('❌ Driver phone login failed');
        console.log('📊 Error:', phoneLoginResponse.data);
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
  
  console.log('\n🏁 Driver Phone Authentication Test Complete!');
}

// Run the test
if (require.main === module) {
  testDriverPhoneAuth();
}

module.exports = testDriverPhoneAuth;