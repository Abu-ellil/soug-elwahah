const axios = require("axios");

// Test the customer registration endpoint
async function testCustomerRegistration() {
  try {
    console.log("Testing customer registration endpoint...");

    const response = await axios.post(
      "http://localhost:5001/api/auth/customer/register",
      {
        name: "Test Customer",
        phone: "01012345678",
        password: "password123",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Customer registration response:", response.data);
    console.log("Customer registration successful!");
  } catch (error) {
    console.error(
      "Customer registration failed:",
      error.response?.data || error.message
    );
  }
}

testCustomerRegistration();
