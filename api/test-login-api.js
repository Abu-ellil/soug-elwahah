const axios = require('axios');

async function testLogin() {
  try {
    console.log('Testing login API...');
    
    // Test login with email
    const loginResponse = await axios.post('http://localhost:5000/api/admin/auth/login', {
      email: 'admin@soug-elwahah.com',
      password: 'admin123'
    });
    
    console.log('Login response:', loginResponse.data);
    
    if (loginResponse.data.success && loginResponse.data.token) {
      console.log('Login successful! Testing /me endpoint...');
      
      // Test /me endpoint
      const meResponse = await axios.get('http://localhost:5000/api/admin/auth/me', {
        headers: {
          Authorization: `Bearer ${loginResponse.data.token}`
        }
      });
      
      console.log('/me response:', meResponse.data);
    }
  } catch (error) {
    if (error.response) {
      console.log('Error response:', error.response.data);
      console.log('Status:', error.response.status);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testLogin();