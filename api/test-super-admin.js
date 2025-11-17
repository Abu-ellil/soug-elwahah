const axios = require('axios');

async function testSuperAdminLogin() {
  try {
    console.log('Testing super admin login...');
    
    const response = await axios.post('http://localhost:5000/api/super-admin/login', {
      email: 'admin@soug-elwahah.com',
      password: 'admin123'
    });
    
    console.log('Login successful!');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('Login failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testSuperAdminLogin();