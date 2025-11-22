const mongoose = require('mongoose');
const StoreOwner = require('./src/models/StoreOwner');
const Store = require('./src/models/Store');
require('dotenv').config();

// Script to synchronize StoreOwner.stores array with actual Store documents
async function syncStoreRelationships() {
  try {
    console.log('=== STORE RELATIONSHIPS SYNCHRONIZATION ===\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/soug-elwahah');
    console.log('✅ Connected to database\n');
    
    // Get all StoreOwners
    const storeOwners = await StoreOwner.find({});
    console.log(`📊 Found ${storeOwners.length} StoreOwners\n`);
    
    let fixedOwners = 0;
    let orphanedStores = 0;
    
    for (const owner of storeOwners) {
      console.log(`\n--- Processing StoreOwner: ${owner.name} (${owner._id}) ---`);
      
      // Get all stores owned by this user from the Store collection
      const actualStores = await Store.find({ ownerId: owner._id });
      console.log(`Actual stores in Store collection: ${actualStores.length}`);
      
      // Get current stores array from StoreOwner
      const currentStoreIds = owner.stores ? owner.stores.map(id => id.toString()) : [];
      console.log(`Stores in StoreOwner.stores array: ${currentStoreIds.length}`);
      
      // Find mismatches
      const actualStoreIds = actualStores.map(store => store._id.toString());
      const orphanedStoreIds = actualStoreIds.filter(id => !currentStoreIds.includes(id));
      const missingStoreIds = currentStoreIds.filter(id => !actualStoreIds.includes(id));
      
      console.log(`Orphaned stores (in DB but not in array): ${orphanedStoreIds.length}`);
      console.log(`Missing stores (in array but not in DB): ${missingStoreIds.length}`);
      
      // Fix the relationship
      let needsUpdate = false;
      const updates = {};
      
      if (orphanedStoreIds.length > 0) {
        console.log(`Adding orphaned stores to StoreOwner.stores array: ${orphanedStoreIds.join(', ')}`);
        const newStores = [...new Set([...currentStoreIds, ...orphanedStoreIds])];
        updates.stores = newStores;
        needsUpdate = true;
        orphanedStores += orphanedStoreIds.length;
      }
      
      if (missingStoreIds.length > 0) {
        console.log(`Removing missing stores from StoreOwner.stores array: ${missingStoreIds.join(', ')}`);
        const cleanStores = currentStoreIds.filter(id => actualStoreIds.includes(id));
        updates.stores = cleanStores;
        needsUpdate = true;
      }
      
      // If we have updates, apply them
      if (needsUpdate) {
        await StoreOwner.findByIdAndUpdate(owner._id, updates);
        console.log(`✅ Updated StoreOwner.stores array`);
        fixedOwners++;
      } else {
        console.log(`✅ StoreOwner.stores array is correct`);
      }
      
      // Display store details
      if (actualStores.length > 0) {
        console.log(`\nStore Details:`);
        actualStores.forEach((store, index) => {
          console.log(`  ${index + 1}. ${store.name} (${store._id})`);
          console.log(`     - Status: ${store.verificationStatus}`);
          console.log(`     - Active: ${store.isActive}`);
          console.log(`     - Open: ${store.isOpen}`);
        });
      }
    }
    
    // Clean up orphaned stores (stores without valid owners)
    console.log('\n\n=== CLEANING ORPHANED STORES ===\n');
    
    const allStores = await Store.find({});
    const validOwnerIds = storeOwners.map(owner => owner._id.toString());
    
    for (const store of allStores) {
      if (!validOwnerIds.includes(store.ownerId.toString())) {
        console.log(`Found orphaned store: ${store.name} (Owner: ${store.ownerId})`);
        console.log(`Deleting orphaned store...`);
        await Store.findByIdAndDelete(store._id);
        console.log(`✅ Deleted orphaned store: ${store.name}`);
        orphanedStores++;
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log(`Total StoreOwners processed: ${storeOwners.length}`);
    console.log(`StoreOwners fixed: ${fixedOwners}`);
    console.log(`Orphaned stores cleaned up: ${orphanedStores}`);
    
    // Final verification
    console.log('\n=== FINAL VERIFICATION ===\n');
    
    const finalOwners = await StoreOwner.find({}).populate('stores');
    let correctlyLinked = 0;
    
    for (const owner of finalOwners) {
      const stores = await Store.find({ ownerId: owner._id });
      const storesArray = owner.stores || [];
      
      if (stores.length === storesArray.length && 
          stores.every(store => storesArray.includes(store._id))) {
        correctlyLinked++;
      }
    }
    
    console.log(`✅ Correctly linked StoreOwners: ${correctlyLinked}/${finalOwners.length}`);
    
    console.log('\n=== SYNCHRONIZATION COMPLETE ===');
    
  } catch (error) {
    console.error('❌ Synchronization failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from database');
  }
}

// Run the synchronization script
syncStoreRelationships();