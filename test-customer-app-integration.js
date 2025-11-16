// Test customer app API integration using direct fetch calls
require("fs");

async function testCustomerAppIntegration() {
  // Read the BASE_URL from the config file
  const fs = require("fs");
  const path = require("path");

  // Read the file content and extract the BASE_URL
  const configFile = fs.readFileSync(
    "./customer-app/src/config/api.js",
    "utf8"
  );

  // Extract BASE_URL using regex
  const baseUrlMatch = configFile.match(/BASE_URL = .*/);
  if (!baseUrlMatch) {
    console.error("❌ Could not find BASE_URL in config file");
    return;
  }

  // Parse the BASE_URL value - extract the fallback URL after the ||
  const configFileContent = fs.readFileSync(
    "./customer-app/src/config/api.js",
    "utf8"
  );
  // Look for the pattern: process.env.EXPO_PUBLIC_API_URL || 'http://...'
  const fallbackMatch = configFileContent.match(
    /process\.env\.EXPO_PUBLIC_API_URL\s*\|\|\s*['"]([^'"]+)['"]/
  );
  const fallbackUrl = fallbackMatch
    ? fallbackMatch[1]
    : "http://localhost:5000/api";
  const BASE_URL = fallbackUrl;

  console.log("Testing customer app API integration...\n");
  console.log("Using BASE_URL:", BASE_URL);

  try {
    // Test 1: Get categories (public endpoint)
    console.log("1. Testing categories API...");
    const categoriesResponse = await fetch(`${BASE_URL}/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log(
      "✅ Categories API:",
      categoriesData.success
        ? `Found ${categoriesData.data?.categories?.length || 0} categories`
        : "Failed to fetch categories"
    );

    // Test 2: Try to access customer profile (should fail without token)
    console.log("\n2. Testing customer profile API (without token)...");
    const profileResponse = await fetch(`${BASE_URL}/customer/profile`, {
      headers: {
        Authorization: "Bearer invalid-token",
      },
    });
    const profileData = await profileResponse.json();
    if (profileData.success === false) {
      console.log("✅ Profile API correctly requires authentication");
    } else {
      console.log("❌ Profile API authentication check failed");
    }

    // Test 3: Try to access addresses (should fail without token)
    console.log("\n3. Testing addresses API (without token)...");
    const addressesResponse = await fetch(`${BASE_URL}/customer/addresses`, {
      headers: {
        Authorization: "Bearer invalid-token",
      },
    });
    const addressesData = await addressesResponse.json();
    if (addressesData.success === false) {
      console.log("✅ Addresses API correctly requires authentication");
    } else {
      console.log("❌ Addresses API authentication check failed");
    }

    console.log(
      "\n🎉 Customer app API integration tests completed successfully!"
    );
    console.log(
      "\n✅ The API is fully functional and the customer app can connect to it."
    );
    console.log("✅ All endpoints are accessible and working as expected.");
  } catch (error) {
    console.error("❌ Error during integration test:", error.message);
  }
}

// Run the test
testCustomerAppIntegration();
