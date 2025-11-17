const axios = require("axios");

// Test the analytics endpoint
async function testAnalyticsEndpoint() {
  try {
    console.log("Testing analytics endpoint...");

    // This test assumes you have a valid admin token
    // You'll need to replace 'YOUR_ADMIN_TOKEN' with an actual token
    const response = await axios.get(
      "http://localhost:5000/api/admin/analytics/dashboard",
      {
        headers: {
          Authorization: "Bearer YOUR_ADMIN_TOKEN", // Replace with actual token
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response:", response.data);
  } catch (error) {
    if (error.response) {
      console.log(
        "Error response:",
        error.response.status,
        error.response.data
      );
    } else {
      console.log("Error:", error.message);
    }
  }
}

testAnalyticsEndpoint();
