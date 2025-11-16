// Comprehensive test for API endpoints

async function testAPIEndpoints() {
  const BASE_URL = "http://localhost:5000/api";

  console.log("Testing API endpoints...\n");

  // Test 1: Health check
  try {
    console.log("1. Testing health endpoint...");
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health:", healthData);
  } catch (error) {
    console.log("❌ Health check failed:", error.message);
  }

  // Test 2: Categories
  try {
    console.log("\n2. Testing categories endpoint...");
    const categoriesResponse = await fetch(`${BASE_URL}/categories`);
    const categoriesData = await categoriesResponse.json();
    console.log(
      "✅ Categories:",
      categoriesData.success
        ? `Found ${categoriesData.data?.categories?.length || 0} categories`
        : categoriesData
    );
  } catch (error) {
    console.log("❌ Categories failed:", error.message);
  }

  // Test 3: Auth endpoints (these should return specific error messages for missing data)
  try {
    console.log("\n3. Testing auth endpoint (login with invalid data)...");
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: "invalid",
        password: "invalid",
        role: "customer",
      }),
    });
    const loginData = await loginResponse.json();
    console.log(
      "✅ Auth endpoint reachable (expected validation error):",
      loginData.message || "Error occurred as expected"
    );
  } catch (error) {
    console.log("❌ Auth endpoint failed:", error.message);
  }

  console.log("\n🎉 API testing completed!");
}

// Run the test
testAPIEndpoints();
