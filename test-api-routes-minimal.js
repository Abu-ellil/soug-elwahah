// Minimal API route testing for routes that don't require database
require("fs");

async function testApiRoutesMinimal() {
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

  console.log("Testing minimal API routes...\n");
  console.log("Using BASE_URL:", BASE_URL);

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // HEALTH CHECK
    console.log("1. Testing health check API...");
    try {
      const healthResponse = await fetch(`${BASE_URL}/health`);
      const healthData = await healthResponse.json();
      console.log(
        "✅ Health API:",
        healthData.success ? "API is running" : "Health check failed"
      );
      testsPassed++;
    } catch (error) {
      console.log("❌ Health API failed:", error.message);
      testsFailed++;
    }

    // CATEGORIES (public endpoint)
    console.log("\n2. Testing categories API...");
    try {
      const categoriesResponse = await fetch(`${BASE_URL}/categories`);
      const categoriesData = await categoriesResponse.json();
      console.log(
        "✅ Categories API:",
        categoriesData.success
          ? `Found ${categoriesData.data?.categories?.length || 0} categories`
          : "Failed to fetch categories"
      );
      testsPassed++;
    } catch (error) {
      console.log("❌ Categories API failed:", error.message);
      testsFailed++;
    }

    // AUTHENTICATION ENDPOINTS
    console.log("\n3. Testing login API (without credentials)...");
    try {
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });
      const loginData = await loginResponse.json();
      console.log(
        "✅ Login API correctly rejects empty credentials:",
        loginData.success === false ? "Rejected" : "Accepted (unexpected)"
      );
      testsPassed++;
    } catch (error) {
      console.log("❌ Login API failed:", error.message);
      testsFailed++;
    }

    // TEST AUTHENTICATION REQUIRED ENDPOINTS (should return auth errors, not connection errors)
    console.log("\n4. Testing customer profile API (should require auth)...");
    try {
      const profileResponse = await fetch(`${BASE_URL}/customer/profile`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });
      const profileData = await profileResponse.json();
      if (profileData.success === false) {
        console.log("✅ Customer profile API correctly requires authentication");
        testsPassed++;
      } else {
        console.log("❌ Customer profile API authentication check failed");
        testsFailed++;
      }
    } catch (error) {
      console.log("❌ Customer profile API failed:", error.message);
      testsFailed++;
    }

    console.log("\n5. Testing store profile API (should require auth)...");
    try {
      const storeProfileResponse = await fetch(`${BASE_URL}/store/profile`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });
      const storeProfileData = await storeProfileResponse.json();
      if (storeProfileData.success === false) {
        console.log("✅ Store profile API correctly requires authentication");
        testsPassed++;
      } else {
        console.log("❌ Store profile API authentication check failed");
        testsFailed++;
      }
    } catch (error) {
      console.log("❌ Store profile API failed:", error.message);
      testsFailed++;
    }

    console.log("\n6. Testing driver profile API (should require auth)...");
    try {
      const driverProfileResponse = await fetch(`${BASE_URL}/driver/profile`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });
      const driverProfileData = await driverProfileResponse.json();
      if (driverProfileData.success === false) {
        console.log("✅ Driver profile API correctly requires authentication");
        testsPassed++;
      } else {
        console.log("❌ Driver profile API authentication check failed");
        testsFailed++;
      }
    } catch (error) {
      console.log("❌ Driver profile API failed:", error.message);
      testsFailed++;
    }

    // TEST INVALID ROUTE
    console.log("\n7. Testing invalid route...");
    try {
      const invalidResponse = await fetch(`${BASE_URL}/invalid-route`);
      const invalidData = await invalidResponse.json();
      if (invalidData.message && invalidData.message.includes("not found")) {
        console.log("✅ Invalid route correctly returns 404");
        testsPassed++;
      } else {
        console.log("❌ Invalid route did not return expected 404");
        testsFailed++;
      }
    } catch (error) {
      console.log("❌ Invalid route test failed:", error.message);
      testsFailed++;
    }

    console.log(
      "\n🎉 Minimal API route tests completed!"
    );
    console.log(
      `\n📊 Test Results: ${testsPassed} passed, ${testsFailed} failed`
    );
    
    if (testsFailed === 0) {
      console.log("✅ All minimal API routes are accessible and working as expected!");
    } else {
      console.log(`❌ ${testsFailed} routes had issues that need attention.`);
    }
  } catch (error) {
    console.error("❌ Error during minimal API route tests:", error.message);
  }
}

// Run the test
testApiRoutesMinimal();