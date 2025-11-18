require("dotenv").config();
const app = require("./src/app.js");
const request = require("supertest")(app);

// Debug store registration with more detailed error output
async function debugStoreRegistration() {
  console.log("Debugging store registration endpoint...");

  try {
    const response = await request
      .post("/api/auth/store/register")
      .send({
        name: "Test Store Owner Debug",
        email: "testdebug@example.com",
        phone: "01199887766", // New phone number
        password: "password123",
        storeName: "Test Store Debug",
        storeDescription: "Debug test store",
      })
      .set("Content-Type", "application/json")
      .set("Accept", "application/json");

    console.log("Response status:", response.status);
    console.log("Response body:", response.body);
  } catch (error) {
    console.error("Request error:", error);
    if (error.response) {
      console.error("Response error body:", error.response.body);
    }
  }
}

debugStoreRegistration();
