// Firebase Admin SDK for server-side operations
const admin = require("firebase-admin");

// Check if Firebase Admin SDK is already initialized to avoid re-initialization
if (!admin.apps.length) {
  try {
    // Initialize Firebase Admin using service account if available
    if (
      process.env.FIREBASE_PRIVATE_KEY &&
      process.env.FIREBASE_PRIVATE_KEY !==
        "-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
    ) {
      const serviceAccount = { 
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
          : undefined,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CERT_URL || undefined,
      };

      // Initialize Firebase Admin with service account credentials
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // Initialize Firebase Admin with default credentials (for development/production environments)
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID, // Explicitly set project ID
      });
    }
  } catch (error) {
    console.warn("Firebase Admin initialization failed:", error.message);
    console.info(
      "Running without Firebase Admin SDK. Set FIREBASE_PRIVATE_KEY in environment variables for full functionality."
    );
    // Still allow the app to run even if Firebase Admin fails to initialize
  }
}

module.exports = admin;
