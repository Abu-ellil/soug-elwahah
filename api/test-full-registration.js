const axios = require("axios");
const FormData = require("form-data");

// Test the store registration endpoint with all possible data fields
async function testFullRegistration() {
  try {
    console.log("Testing store registration with all data fields...");

    const formData = new FormData();
    formData.append("name", "Test Store Owner Full Data");
    formData.append("email", "fulldata@example.com");
    formData.append("phone", "01234567890"); // New phone number
    formData.append("password", "password123");
    formData.append("storeName", "Test Store Full Data");
    formData.append("storeDescription", "Test store with all data fields");
    formData.append("coordinates", JSON.stringify({ lat: 30.0444, lng: 31.2357 })); // Cairo coordinates

    const response = await axios.post(
      "http://192.168.1.4:5002/api/auth/store/register",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
      }
    );

    console.log("Full registration response:", response.data);
    console.log("Full registration successful!");
  } catch (error) {
    console.error(
      "Full registration failed:",
      error.response?.data || error.message
    );
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Headers:", error.response.headers);
    }
  }
}

testFullRegistration();
