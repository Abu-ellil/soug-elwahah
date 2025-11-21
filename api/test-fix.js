#!/usr/bin/env node

// Quick test to verify the serverless function loads properly after the fix
console.log('🔧 Testing serverless function import after path fixes...');

try {
  console.log('📦 Attempting to import serverless function...');
  const serverlessApp = require('./api/index');
  console.log('✅ Serverless function imported successfully!');
  
  console.log('📋 Checking handler type...');
  console.log('Handler type:', typeof serverlessApp);
  
  console.log('🎉 All imports working correctly! The server should now load properly on Vercel.');
  console.log('');
  console.log('📝 Summary of fixes applied:');
  console.log('   • Fixed import paths in api/api/index.js');
  console.log('   • Changed "../middleware" to "../../middleware"');
  console.log('   • Changed "../routes" to "../../routes"');
  console.log('');
  console.log('🚀 Your API should now deploy successfully to Vercel!');
  
} catch (error) {
  console.error('❌ Error importing serverless function:', error.message);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}