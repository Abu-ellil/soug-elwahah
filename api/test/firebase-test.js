require("dotenv").config(); // Load environment variables
const admin = require("../src/config/firebase");

// Test script to verify Firebase configuration
async function testFirebaseConfig() {
  try {
    console.log("Testing Firebase configuration...");

    // Check if Firebase Admin SDK is initialized
    if (admin.apps.length > 0) {
      console.log("✓ Firebase Admin SDK is initialized");

      // Try to access the default app
      const app = admin.app();
      console.log("✓ Firebase app is accessible");

      // Try to get project ID
      const projectId = app.options.projectId;
      console.log(`✓ Project ID: ${projectId}`);

      // Additional Firebase configuration details
      console.log(
        `✓ Credential type: ${
          app.options.credential ? "Service Account" : "Application Default"
        }`
      );

      // Try to access messaging service
      const messaging = admin.messaging();
      console.log("✓ Firebase Messaging service is accessible");

      // Try to access auth service
      const auth = admin.auth();
      console.log("✓ Firebase Auth service is accessible");

      // Try to access Firestore service (if needed)
      try {
        const firestore = admin.firestore();
        console.log("✓ Firebase Firestore service is accessible");
      } catch (err) {
        console.log(
          "⚠ Firestore service not accessible (may be expected):",
          err.message
        );
      }

      console.log("\n✓ Firebase configuration test completed successfully");
      return true;
    } else {
      console.log("⚠ Firebase Admin SDK is not initialized");
      console.log(
        "This might be because Firebase credentials are not properly configured."
      );
      console.log("Please check your environment variables.");
      return false;
    }
  } catch (error) {
    console.error("✗ Firebase configuration test failed:", error.message);
    return false;
  }
}

// Run the test
if (require.main === module) {
  testFirebaseConfig()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("Test script error:", error);
      process.exit(1);
    });
}

module.exports = testFirebaseConfig;
