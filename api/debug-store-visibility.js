const mongoose = require('mongoose');
const StoreOwner = require('./src/models/StoreOwner');
const Store = require('./src/models/Store');
require('dotenv').config();

// Debug script to check store visibility issues
async function debugStoreVisibility() {
  try {
    console.log('=== STORE VISIBILITY DEBUG SCRIPT ===\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soug-elwahah');
    console.log('✅ Connected to database\n');
    
    // Get all StoreOwners
    const storeOwners = await StoreOwner.find({}).populate('stores');
    console.log(`📊 Found ${storeOwners.length} StoreOwners\n`);
    
    for (const owner of storeOwners) {
      console.log(`\n--- StoreOwner: ${owner.name} (${owner._id}) ---`);
      console.log(`Verification Status: ${owner.verificationStatus}`);
      console.log(`Is Active: ${owner.isActive}`);
      console.log(`Phone: ${owner.phone}`);
      console.log(`Stores in array: ${owner.stores ? owner.stores.length : 0}`);
      
      if (owner.stores && owner.stores.length > 0) {
        console.log('\nStore Details:');
        owner.stores.forEach((store, index) => {
          console.log(`  ${index + 1}. ${store.name}`);
          console.log(`     - Verification Status: ${store.verificationStatus}`);
          console.log(`     - Is Active: ${store.isActive}`);
          console.log(`     - Is Open: ${store.isOpen}`);
          console.log(`     - Store ID: ${store._id}`);
          console.log(`     - Owner ID: ${store.ownerId}`);
        });
      }
      
      // Check what the middleware would find
      const approvedStores = owner.stores ? 
        owner.stores.filter(store => store.verificationStatus === "approved") : [];
      
      console.log(`\n🔍 Approved stores found: ${approvedStores.length}`);
      if (approvedStores.length > 0) {
        approvedStores.forEach(store => {
          console.log(`  ✅ ${store.name} (Status: ${store.verificationStatus})`);
        });
      } else {
        console.log('  ❌ No approved stores found');
      }
      
      // Test the exact query that statistics controller uses
      const directStoreQuery = await Store.findOne({
        ownerId: owner._id,
        verificationStatus: "approved"
      });
      
      console.log(`\n🔎 Direct query result: ${directStoreQuery ? 'SUCCESS' : 'FAILED'}`);
      if (directStoreQuery) {
        console.log(`  Store: ${directStoreQuery.name}`);
        console.log(`  Status: ${directStoreQuery.verificationStatus}`);
      }
    }
    
    // Check all stores and their statuses
    console.log('\n\n=== ALL STORES IN DATABASE ===\n');
    const allStores = await Store.find({});
    console.log(`Total stores in database: ${allStores.length}\n`);
    
    const statusCounts = {};
    allStores.forEach(store => {
      const status = store.verificationStatus;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    console.log('Store status distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} stores`);
    });
    
    console.log('\n=== DEBUG COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Debug script failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the debug script
debugStoreVisibility();