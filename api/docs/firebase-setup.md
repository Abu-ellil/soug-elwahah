# Firebase Setup Guide

This document explains how to properly configure Firebase for the application.

## Environment Variables

The application uses the following Firebase-related environment variables:

```env
# Firebase Configuration (for Firebase Admin SDK)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_CERT_URL=your_certificate_url
```

## Authentication Methods

The application supports two Firebase authentication methods:

### 1. Application Default Credentials (Current Setup)

This is the current configuration used in the application. It works well for:

- Google Cloud Platform environments
- Development environments with Google Cloud SDK installed

The project ID is explicitly set from the environment variable.

### 2. Service Account Authentication

To use service account authentication, you need to:

1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key" and download the JSON file
3. Copy the values from the JSON file to the environment variables

## Testing Firebase Configuration

To test the Firebase configuration, run:

```bash
node test/firebase-test.js
```

## Troubleshooting

- If you see "Project ID: undefined", make sure `FIREBASE_PROJECT_ID` is set in your environment variables
- If you get authentication errors, verify your service account credentials
- For development, ensure you have Google Cloud SDK installed and authenticated
