const axios = require("axios");

// Test the store registration endpoint
async function testStoreRegistration() {
  try {
    console.log("Testing store registration endpoint...");

    const response = await axios.post(
      "http://localhost:5001/api/auth/store/register",
      {
        name: "Test Store Owner",
        email: "teststore@example.com",
        phone: "01012345679",
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
