// Test script to identify serverless function issues
const serverless = require("serverless-http");

console.log("🔍 Testing serverless function imports...");

try {
  console.log("1. Testing serverless-http import...");
  console.log("✅ serverless-http imported successfully");
  
  console.log("2. Testing server.js import...");
  const app = require("./server.js");
  console.log("✅ server.js imported successfully");
  
  console.log("3. Creating serverless handler...");
  const handler = serverless(app);
  console.log("✅ Serverless handler created successfully");
  
  console.log("4. Testing handler export...");
  console.log("✅ Handler exported:", typeof handler);
  
  console.log("🎉 All tests passed! The serverless function should work.");
  
} catch (error) {
  console.error("❌ Error found:", error.message);
  console.error("Stack trace:", error.stack);
}