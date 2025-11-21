// Test script to verify Vercel deployment
const request = require('supertest');

// Simple test to check if the serverless function loads properly
async function testDeployment() {
  try {
    console.log('Testing Vercel deployment...');
    
    // Try to load the serverless function
    const serverlessApp = require('./api/index');
    
    // Test the root endpoint (status should be 200, not 20)
    const response = await request(serverlessApp)
      .get('/')
      .set('Accept', 'application/json');
    
    console.log('Response status:', response.status);
    console.log('Response body:', JSON.stringify(response.body, null, 2));
    
    if (response.status === 200 && response.body.success) {
      console.log('✅ Vercel deployment test passed!');
      return true;
    } else {
      console.log('❌ Vercel deployment test failed!');
      return false;
    }
  } catch (error) {
    console.error('❌ Error during deployment test:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run the test
testDeployment().then(success => {
  if (success) {
    console.log('Deployment is ready for Vercel!');
    process.exit(0);
  } else {
    console.log('Deployment needs fixes!');
    process.exit(1);
  }
});
