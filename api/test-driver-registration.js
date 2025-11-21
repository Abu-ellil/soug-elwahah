const axios = require('axios');

async function testDriverRegistration() {
  try {
    console.log('Testing driver registration...');
    
    const driverData = {
      "name": "سائق تجريبي",
      "email": "driver_new@example.com",  // Changed to avoid duplicate email error
      "password": "123456",
      "phone": "01234567891",  // Changed to avoid duplicate phone error
      "vehicle": {
        "type": "car",
        "model": "Toyota",
        "plateNumber": "ABC1234"
      }
    };

    // Make a request to the driver registration endpoint
    const response = await axios.post('http://localhost:5000/api/auth/driver/register', driverData);
    
    console.log('Registration response:', response.data);
    console.log('Success:', response.data.success);
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
  }
}

// Run the test
testDriverRegistration();
