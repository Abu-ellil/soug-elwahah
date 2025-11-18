const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login with sample credentials...');
    
    // Test customer login
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      phone: '0101111',  // From seed.js file
      password: '123456',
      role: 'customer'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Login successful!');
    console.log('Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Login failed!');
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin();