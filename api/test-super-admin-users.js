const axios = require('axios');

async function testSuperAdminUsers() {
  try {
    console.log('Testing super admin login...');
    
    // First, login to get the token
    const loginResponse = await axios.post('http://localhost:5000/api/super-admin/login', {
      email: 'admin@soug-elwahah.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful! Token received.');
    
    // Now test getting all users with the token
    console.log('Testing get all users endpoint...');
    const usersResponse = await axios.get('http://localhost:5000/api/super-admin/users', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('Get users successful!');
    console.log('Number of users:', usersResponse.data.data.users.length);
    console.log('Sample user:', usersResponse.data.data.users[0]);
  } catch (error) {
    console.log('Request failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testSuperAdminUsers();