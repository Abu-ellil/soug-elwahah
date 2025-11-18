const axios = require("axios");

// Test the store registration endpoint with a completely new phone number
async function testStoreRegistration() {
  try {
    console.log(
      "Testing store registration endpoint with completely new phone..."
    );

    const response = await axios.post(
      "http://localhost:5001/api/auth/store/register",
      {
        name: "Test Store Owner Final",
        email: "teststorefinal@example.com",
        phone: "01122334455", // Completely new phone number
        password: "password123",
        storeName: "Test Store Final",
        storeDescription: "Final test store for verification",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Store registration response:", response.data);
    console.log("Store registration successful!");
  } catch (error) {
    console.error(
      "Store registration failed:",
      error.response?.data || error.message
    );
  }
}

testStoreRegistration();
