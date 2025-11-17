const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

// Test the registration endpoint with form data (similar to how the merchant app sends it)
async function testRegistrationFormData() {
  try {
    console.log("Testing registration endpoint with form data...");

    const formData = new FormData();
    formData.append("email", "test@example.com");
    formData.append("phone", "01012345678");
    formData.append("password", "password123");
    formData.append("name", "Test Merchant");
    formData.append("storeName", "Test Store");
    formData.append("storeDescription", "A test store for verification");

    // Don't include an image file to test the scenario without image upload

    const response = await axios.post(
      "https://soug-elwahah.vercel.app/api/auth/store/register",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
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
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Headers:", error.response.headers);
    }
  }
}

testRegistrationFormData();
