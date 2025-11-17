const axios = require("axios");

// Test the registration endpoint
async function testRegistration() {
  try {
    console.log("Testing registration endpoint...");

    const response = await axios.post(
      "https://soug-elwahah.vercel.app/api/auth/store/register",
      {
        name: "Test Merchant",
        email: "test@example.com",
        phone: "01012345678",
        password: "password123",
        storeName: "Test Store",
        storeDescription: "A test store for verification",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Registration response:", response.data);
    console.log("Registration successful!");
  } catch (error) {
    console.error(
      "Registration failed:",
      error.response?.data || error.message
    );
  }
}

testRegistration();
