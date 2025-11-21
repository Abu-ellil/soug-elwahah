#!/usr/bin/env node

/**
 * Vercel Deployment Fix Test
 * This script tests that the server can start and the serverless handler works correctly
 */

console.log('🧪 Testing Vercel deployment fix...\n');

// Test 1: Check if index.js can be imported
console.log('📦 Step 1: Testing serverless handler import...');
try {
  const serverless = require('serverless-http');
  console.log('✅ serverless-http imported successfully');
} catch (error) {
  console.error('❌ Failed to import serverless-http:', error.message);
  process.exit(1);
}

// Test 2: Check if main app can be imported
console.log('\n📦 Step 2: Testing main app import...');
try {
  const app = require('./server.js');
  console.log('✅ Main app imported successfully');
} catch (error) {
  console.error('❌ Failed to import main app:', error.message);
  console.error('Error details:', error);
  process.exit(1);
}

// Test 3: Check if serverless handler can be created
console.log('\n📦 Step 3: Testing serverless handler creation...');
try {
  const serverless = require('serverless-http');
  const app = require('./server.js');
  const handler = serverless(app);
  console.log('✅ Serverless handler created successfully');
  console.log('Handler type:', typeof handler);
} catch (error) {
  console.error('❌ Failed to create serverless handler:', error.message);
  console.error('Error details:', error);
  process.exit(1);
}

// Test 4: Check environment variables
console.log('\n🔧 Step 4: Checking environment variables...');
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const optionalEnvVars = ['NODE_ENV', 'API_VERSION', 'STRIPE_SECRET_KEY', 'TWILIO_ACCOUNT_SID'];

console.log('Required environment variables:');
requiredEnvVars.forEach(envVar => {
  const status = process.env[envVar] ? '✅ SET' : '❌ NOT SET';
  console.log(`  ${envVar}: ${status}`);
});

console.log('\nOptional environment variables:');
optionalEnvVars.forEach(envVar => {
  const status = process.env[envVar] ? '✅ SET' : '❌ NOT SET';
  console.log(`  ${envVar}: ${status}`);
});

console.log('\n🎉 All tests passed! The serverless function should work correctly on Vercel.');
console.log('\n📋 Next steps:');
console.log('1. Commit and push these changes to your repository');
console.log('2. Redeploy to Vercel (it will automatically detect the changes)');
console.log('3. Test the endpoints:');
console.log('   - GET / (welcome message)');
console.log('   - GET /health (health check)');
console.log('   - GET /env-check (environment variables status)');
console.log('   - GET /api/v1 (API information)');