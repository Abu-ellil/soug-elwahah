// Test script to verify serverless function imports
console.log('Testing serverless function imports...');

try {
  // Test if the main entry point works
  console.log('1. Testing main serverless handler import...');
  const serverlessHandler = require('./index.js');
  console.log('✅ Main serverless handler imported successfully');
  
  // Test if server.js can be imported independently
  console.log('2. Testing server.js import...');
  const app = require('./server.js');
  console.log('✅ Server.js imported successfully');
  
  // Test database connection (just the import)
  console.log('3. Testing database config import...');
  const connectDB = require('./config/database');
  console.log('✅ Database config imported successfully');
  
  // Test key middleware imports
  console.log('4. Testing middleware imports...');
  const errorHandler = require('./middleware/errorHandler');
  const notFound = require('./middleware/notFound');
  console.log('✅ Middleware imported successfully');
  
  // Test utility imports
  console.log('5. Testing utility imports...');
  const ApiResponse = require('./utils/apiResponse');
  const AppError = require('./utils/appError');
  console.log('✅ Utilities imported successfully');
  
  // Test config imports
  console.log('6. Testing config imports...');
  const { initializeSocket } = require('./config/socket');
  const { specs, swaggerUi, swaggerOptions } = require('./config/swagger');
  console.log('✅ Config files imported successfully');
  
  console.log('\n🎉 All imports successful! Serverless function should work now.');
  console.log('Handler type:', typeof serverlessHandler);
  
} catch (error) {
  console.error('❌ Import error:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}