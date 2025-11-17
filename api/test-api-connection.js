// Test script to verify API connection
const { BASE_URL } = require("../customer-app/src/config/api");

async function testAPI() {
  try {
    console.log("Testing API connection to:", BASE_URL);

    // Test health endpoint
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();

    console.log("API Health Check Response:", data);

    if (data.success) {
      console.log("✅ API is running and accessible!");
    } else {
      console.log("❌ API health check failed:", data.message);
    }
  } catch (error) {
    console.error("❌ Error connecting to API:", error.message);
    console.log(
      "Make sure the API server is running with: cd api && npm run dev"
    );
  }
}

// Run the test
testAPI();
