// Test script to verify the driver statistics endpoint
const request = require("supertest");
const app = require("../server");

// Mock token for testing (you would need a real JWT token with a driver user)
const testToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MjQxYjQ0OTQ0ZjI2YzQ5MjQxYjQ0OSIsImlhdCI6MTYzNjM2MzYzNiwiZXhwIjoxNjM2MzcxNjM2fQ.test_token";

describe("Driver Statistics API", () => {
  it("should return driver statistics", async () => {
    const response = await request(app)
      .get("/api/v1/drivers/statistics?period=day")
      .set("Authorization", `Bearer ${testToken}`)
      .expect(200);

    console.log("Response:", response.body);
  });
});

console.log("Testing driver statistics endpoint...");
