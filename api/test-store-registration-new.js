const axios = require("axios");

// Test the store registration endpoint with a new phone number
async function testStoreRegistration() {
  try {
    console.log("Testing store registration endpoint with new phone...");

    const response = await axios.post(
      "http://localhost:5001/api/auth/store/register",
      {
        name: "Test Store Owner 2",
        email: "teststore2@example.com",
        phone: "01098765432", // Different phone number
        password: "password123",
        storeName: "Test Store 2",
        storeDescription: "Another test store for verification",
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
