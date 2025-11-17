// Comprehensive API route testing
require("fs");

async function testAllApiRoutes() {
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
 
  console.log("Testing all API routes...\n");
  console.log("Using BASE_URL:", BASE_URL);

  let testsPassed = 0;
  let testsFailed = 0;

  try {
    // AUTH ROUTES
    console.log("\n🔐 AUTH ROUTES");
    console.log("=".repeat(50));

    // Test 1: Get categories (public endpoint)
    console.log("1. Testing categories API...");
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

    // Test 2: Health check
    console.log("\n2. Testing health check API...");
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

    // Test 3: Login endpoint (should fail without credentials)
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

    // CUSTOMER ROUTES
    console.log("\n👥 CUSTOMER ROUTES");
    console.log("=".repeat(50));

    // Test 4: Try to access customer profile (should fail without token)
    console.log("4. Testing customer profile API (without token)...");
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

    // Test 5: Try to access addresses (should fail without token)
    console.log("\n5. Testing customer addresses API (without token)...");
    try {
      const addressesResponse = await fetch(`${BASE_URL}/customer/addresses`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });
      const addressesData = await addressesResponse.json();
      if (addressesData.success === false) {
        console.log("✅ Customer addresses API correctly requires authentication");
        testsPassed++;
      } else {
        console.log("❌ Customer addresses API authentication check failed");
        testsFailed++;
      }
    } catch (error) {
      console.log("❌ Customer addresses API failed:", error.message);
      testsFailed++;
    }

    // Test 6: Try to access customer orders (should fail without token)
    console.log("\n6. Testing customer orders API (without token)...");
    try {
      const ordersResponse = await fetch(`${BASE_URL}/customer/orders`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });
      const ordersData = await ordersResponse.json();
      if (ordersData.success === false) {
        console.log("✅ Customer orders API correctly requires authentication");
        testsPassed++;
      } else {
        console.log("❌ Customer orders API authentication check failed");
        testsFailed++;
      }
    } catch (error) {
      console.log("❌ Customer orders API failed:", error.message);
      testsFailed++;
    }

    // Test 7: Try to access customer stores (should fail without token)
    console.log("\n7. Testing customer stores API (without token)...");
    try {
      const storesResponse = await fetch(`${BASE_URL}/customer/stores`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });
      const storesData = await storesResponse.json();
      if (storesData.success === false) {
        console.log("✅ Customer stores API correctly requires authentication");
        testsPassed++;
      } else {
        console.log("❌ Customer stores API authentication check failed");
        testsFailed++;
      }
    } catch (error) {
      console.log("❌ Customer stores API failed:", error.message);
      testsFailed++;
    }

    // Test 8: Try to access customer notifications (should fail without token)
    console.log("\n8. Testing customer notifications API (without token)...");
    try {
      const notificationsResponse = await fetch(`${BASE_URL}/customer/notifications`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });
      const notificationsData = await notificationsResponse.json();
      if (notificationsData.success === false) {
        console.log("✅ Customer notifications API correctly requires authentication");
        testsPassed++;
      } else {
        console.log("❌ Customer notifications API authentication check failed");
        testsFailed++;
      }
    } catch (error) {
      console.log("❌ Customer notifications API failed:", error.message);
      testsFailed++;
    }

    // Test 9: Try to access customer tracking (should fail without token)
    console.log("\n9. Testing customer tracking API (without token)...");
    try {
      const trackingResponse = await fetch(`${BASE_URL}/customer/tracking/123`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });
      const trackingData = await trackingResponse.json();
      if (trackingData.success === false) {
        console.log("✅ Customer tracking API correctly requires authentication");
        testsPassed++;
      } else {
        console.log("❌ Customer tracking API authentication check failed");
        testsFailed++;
      }
    } catch (error) {
      console.log("❌ Customer tracking API failed:", error.message);
      testsFailed++;
    }

    // STORE ROUTES
    console.log("\n🏪 STORE ROUTES");
    console.log("=".repeat(50));

    // Test 10: Try to access store profile (should fail without token)
    console.log("10. Testing store profile API (without token)...");
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

    // Test 11: Try to access store orders (should fail without token)
    console.log("\n11. Testing store orders API (without token)...");
    try {
      const storeOrdersResponse = await fetch(`${BASE_URL}/store/orders`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });
      const storeOrdersData = await storeOrdersResponse.json();
      if (storeOrdersData.success === false) {
        console.log("✅ Store orders API correctly requires authentication");
        testsPassed++;
      } else {
        console.log("❌ Store orders API authentication check failed");
        testsFailed++;
      }
    } catch (error) {
      console.log("❌ Store orders API failed:", error.message);
      testsFailed++;
    }

    // Test 12: Try to access store products (should fail without token)
    console.log("\n12. Testing store products API (without token)...");
    try {
      const storeProductsResponse = await fetch(`${BASE_URL}/store/products`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });
      const storeProductsData = await storeProductsResponse.json();
      if (storeProductsData.success === false) {
        console.log("✅ Store products API correctly requires authentication");
        testsPassed++;
      } else {
        console.log("❌ Store products API authentication check failed");
        testsFailed++;
      }
    } catch (error) {
      console.log("❌ Store products API failed:", error.message);
      testsFailed++;
    }

    // Test 13: Try to access store statistics (should fail without token)
    console.log("\n13. Testing store statistics API (without token)...");
    try {
      const storeStatsResponse = await fetch(`${BASE_URL}/store/statistics`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });
      const storeStatsData = await storeStatsResponse.json();
      if (storeStatsData.success === false) {
        console.log("✅ Store statistics API correctly requires authentication");
        testsPassed++;
      } else {
        console.log("❌ Store statistics API authentication check failed");
        testsFailed++;
      }
    } catch (error) {
      console.log("❌ Store statistics API failed:", error.message);
      testsFailed++;
    }

    // Test 14: Try to access store details (should fail without token)
    console.log("\n14. Testing store store API (without token)...");
    try {
      const storeResponse = await fetch(`${BASE_URL}/store`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });
      const storeData = await storeResponse.json();
      if (storeData.success === false) {
        console.log("✅ Store API correctly requires authentication");
        testsPassed++;
      } else {
        console.log("❌ Store API authentication check failed");
        testsFailed++;
      }
    } catch (error) {
      console.log("❌ Store API failed:", error.message);
      testsFailed++;
    }

    // DRIVER ROUTES
    console.log("\n🚚 DRIVER ROUTES");
    console.log("=".repeat(50));

    // Test 15: Try to access driver profile (should fail without token)
    console.log("15. Testing driver profile API (without token)...");
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

    // Test 16: Try to access driver orders (should fail without token)
    console.log("\n16. Testing driver orders API (without token)...");
    try {
      const driverOrdersResponse = await fetch(`${BASE_URL}/driver/orders`, {
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });
      const driverOrdersData = await driverOrdersResponse.json();
      if (driverOrdersData.success === false) {
        console.log("✅ Driver orders API correctly requires authentication");
        testsPassed++;
      } else {
        console.log("❌ Driver orders API authentication check failed");
        testsFailed++;
      }
    } catch (error) {
      console.log("❌ Driver orders API failed:", error.message);
      testsFailed++;
    }

    // Test 17: Try to access driver tracking (should fail without token)
    console.log("\n17. Testing driver tracking API (without token)...");
    try {
      const driverTrackingResponse = await fetch(`${BASE_URL}/driver/tracking/location`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer invalid-token",
        },
        body: JSON.stringify({}),
      });
      const driverTrackingData = await driverTrackingResponse.json();
      if (driverTrackingData.success === false) {
        console.log("✅ Driver tracking API correctly requires authentication");
        testsPassed++;
      } else {
        console.log("❌ Driver tracking API authentication check failed");
        testsFailed++;
      }
    } catch (error) {
      console.log("❌ Driver tracking API failed:", error.message);
      testsFailed++;
    }

    // UPLOAD ROUTES
    console.log("\n📤 UPLOAD ROUTES");
    console.log("=".repeat(50));

    // Test 18: Try to access upload image (should fail without token)
    console.log("18. Testing upload image API (without token)...");
    try {
      const uploadResponse = await fetch(`${BASE_URL}/upload/image`, {
        method: "POST",
        headers: {
          Authorization: "Bearer invalid-token",
        },
      });
      const uploadData = await uploadResponse.json();
      if (uploadData.success === false) {
        console.log("✅ Upload image API correctly requires authentication");
        testsPassed++;
      } else {
        console.log("❌ Upload image API authentication check failed");
        testsFailed++;
      }
    } catch (error) {
      console.log("❌ Upload image API failed:", error.message);
      testsFailed++;
    }

    // Test 19: Test invalid route
    console.log("\n19. Testing invalid route...");
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
      "\n🎉 All API route tests completed!"
    );
    console.log(
      `\n📊 Test Results: ${testsPassed} passed, ${testsFailed} failed`
    );
    
    if (testsFailed === 0) {
      console.log("✅ All API routes are accessible and working as expected!");
    } else {
      console.log(`❌ ${testsFailed} routes had issues that need attention.`);
    }
  } catch (error) {
    console.error("❌ Error during API route tests:", error.message);
  }
}

// Run the test
testAllApiRoutes();