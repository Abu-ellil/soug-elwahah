// Simple test script to run API data fetcher
// This can be run from the customer-app directory

import fetchAllAPIData from './src/utils/apiDataFetcher.js';

// Main execution
const runAPITest = async () => {
  console.log('🧪 Starting API Data Test...\n');
  
  try {
    const results = await fetchAllAPIData();
    
    console.log('\n\n🎯 FINAL RESULTS SUMMARY');
    console.log('='.repeat(50));
    console.log('Total data types fetched:', Object.keys(results.data).length);
    console.log('Total errors:', Object.keys(results.errors).length);
    console.log('Network status:', results.networkStatus);
    
    // Log each successful data type with name
    console.log('\n📊 SUCCESSFUL API CALLS:');
    Object.entries(results.data).forEach(([key, value]) => {
      if (key !== 'authenticated') { // Skip the boolean flag
        const count = Array.isArray(value) ? `${value.length} items` : 
                     (value && typeof value === 'object') ? `${Object.keys(value).length} properties` : 'data';
        console.log(`  ✅ ${key}: ${count}`);
      }
    });
    
    // Log errors if any
    if (Object.keys(results.errors).length > 0) {
      console.log('\n❌ FAILED API CALLS:');
      Object.entries(results.errors).forEach(([key, error]) => {
        console.log(`  ❌ ${key}: ${error}`);
      });
    }
    
    console.log('\n🎉 Test completed! Check the console output above for detailed data.');
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
};

// Export for potential use as module
export { runAPITest };

// Auto-run if this script is executed directly
if (typeof window === 'undefined' && typeof process !== 'undefined') {
  // Node.js environment
  runAPITest().catch(console.error);
} else {
  // Browser/React Native environment - don't auto-run
  console.log('📱 API Data Fetcher loaded. Call runAPITest() to execute.');
}