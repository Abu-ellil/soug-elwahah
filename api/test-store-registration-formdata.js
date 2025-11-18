const axios = require("axios");
const FormData = require("form-data");

// Test the store registration endpoint with form data (like the merchant app does)
async function testStoreRegistrationFormData() {
  try {
    console.log("Testing store registration endpoint with form data...");

    const formData = new FormData();
    formData.append("name", "Test Store Owner Form Data");
    formData.append("email", "testdata@example.com");
    formData.append("phone", "01098765432"); // New phone number
    formData.append("password", "password123");
    formData.append("storeName", "Test Store Form Data");
    formData.append("storeDescription", "Test store with form data");

    const response = await axios.post(
      "http://192.168.1.4:5002/api/auth/store/register",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
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
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Headers:", error.response.headers);
    }
  }
}

testStoreRegistrationFormData();
