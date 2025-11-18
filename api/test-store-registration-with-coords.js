const axios = require("axios");

// Test the store registration endpoint with coordinates
async function testStoreRegistrationWithCoords() {
  try {
    console.log("Testing store registration endpoint with coordinates...");

    const response = await axios.post(
      "http://localhost:5001/api/auth/store/register",
      {
        name: "Test Store Owner With Coords",
        email: "testcoords@example.com",
        phone: "01199887766", // New phone number
        password: "password123",
        storeName: "Test Store With Coords",
        storeDescription: "Test store with coordinates",
        coordinates: { lat: 30.0444, lng: 31.2357 }, // Cairo coordinates
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

testStoreRegistrationWithCoords();
