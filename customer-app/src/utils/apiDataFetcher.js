// API Data Fetcher - Fetch all available API data and log it with names
import { API } from '../services/api';
import { networkManager } from './network';
import { getToken } from './storage';

// Utility function to safely log data with names
const safeLog = (name, data, error = null) => {
  console.log('\n'.repeat(2));
  console.log('='.repeat(60));
  console.log(`📊 API DATA: ${name}`);
  console.log('='.repeat(60));
  
  if (error) {
    console.error(`❌ Error fetching ${name}:`, error.message || error);
    console.log('Error details:', error);
  } else {
    console.log(`✅ Successfully fetched ${name}`);
    console.log('Data:', JSON.stringify(data, null, 2));
  }
  
  console.log('='.repeat(60));
};

// Utility function to add delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Main function to fetch all API data
export const fetchAllAPIData = async () => {
  console.log('🚀 Starting API Data Collection...');
  console.log('📅 Timestamp:', new Date().toISOString());
  
  // Check network connectivity first
  const isOnline = networkManager.isInternetReachable();
  console.log(`🌐 Network Status: ${isOnline ? 'Online' : 'Offline'}`);
  
  if (!isOnline) {
    console.warn('⚠️  Device is offline. Some API calls may fail.');
  }
  
  const results = {
    timestamp: new Date().toISOString(),
    networkStatus: isOnline ? 'online' : 'offline',
    data: {},
    errors: {}
  };

  try {
    // 1. Fetch Categories
    console.log('\n🔄 Fetching Categories...');
    try {
      const categoriesData = await API.categoriesAPI.getCategories();
      safeLog('Categories', categoriesData);
      results.data.categories = categoriesData;
    } catch (error) {
      safeLog('Categories', null, error);
      results.errors.categories = error.message || error;
    }
    
    await delay(500); // Small delay between requests

    // 2. Fetch All Stores
    console.log('\n🔄 Fetching All Stores...');
    try {
      const storesData = await API.storesAPI.getAllStores();
      safeLog('All Stores', storesData);
      results.data.allStores = storesData;
      
      // If stores are available, try to get details for first few stores
      if (storesData && storesData.length > 0) {
        console.log('\n🔄 Fetching Store Details (first 3 stores)...');
        const sampleStores = storesData.slice(0, 3);
        
        for (let i = 0; i < sampleStores.length; i++) {
          const store = sampleStores[i];
          try {
            const storeDetails = await API.storesAPI.getStoreDetails(store.id || store._id);
            safeLog(`Store Details: ${store.name || store.storeName || 'Unknown'}`, storeDetails);
            results.data[`storeDetails_${i}`] = storeDetails;
          } catch (error) {
            safeLog(`Store Details: ${store.name || store.storeName || 'Unknown'}`, null, error);
            results.errors[`storeDetails_${i}`] = error.message || error;
          }
          await delay(300);
        }
      }
    } catch (error) {
      safeLog('All Stores', null, error);
      results.errors.allStores = error.message || error;
    }
    
    await delay(500);

    // 3. Fetch Nearby Stores (with default parameters)
    console.log('\n🔄 Fetching Nearby Stores...');
    try {
      const nearbyStoresParams = {
        latitude: 30.0444, // Cairo coordinates as example
        longitude: 31.2357,
        radius: 10 // 10km radius
      };
      const nearbyStoresData = await API.storesAPI.getNearbyStores(nearbyStoresParams);
      safeLog('Nearby Stores', nearbyStoresData);
      results.data.nearbyStores = nearbyStoresData;
    } catch (error) {
      safeLog('Nearby Stores', null, error);
      results.errors.nearbyStores = error.message || error;
    }
    
    await delay(500);

    // 4. Search Stores (if no auth required)
    console.log('\n🔄 Searching Stores...');
    try {
      const searchData = await API.storesAPI.searchStores('test');
      safeLog('Store Search', searchData);
      results.data.storeSearch = searchData;
    } catch (error) {
      safeLog('Store Search', null, error);
      results.errors.storeSearch = error.message || error;
    }
    
    await delay(500);

    // 5. Try to get authenticated data if token exists
    const token = await getToken();
    if (token) {
      console.log('\n🔑 Authentication token found. Fetching authenticated data...');
      
      // Fetch User Profile
      try {
        const profileData = await API.profileAPI.getProfile(token);
        safeLog('User Profile', profileData);
        results.data.userProfile = profileData;
      } catch (error) {
        safeLog('User Profile', null, error);
        results.errors.userProfile = error.message || error;
      }
      
      await delay(500);

      // Fetch User Addresses
      try {
        const addressesData = await API.addressesAPI.getMyAddresses(token);
        safeLog('User Addresses', addressesData);
        results.data.userAddresses = addressesData;
      } catch (error) {
        safeLog('User Addresses', null, error);
        results.errors.userAddresses = error.message || error;
      }
      
      await delay(500);

      // Fetch User Orders
      try {
        const ordersData = await API.ordersAPI.getMyOrders(token);
        safeLog('User Orders', ordersData);
        results.data.userOrders = ordersData;
      } catch (error) {
        safeLog('User Orders', null, error);
        results.errors.userOrders = error.message || error;
      }
      
      await delay(500);

      // Fetch User Info (/auth/me)
      try {
        const meData = await API.authAPI.getMe(token);
        safeLog('User Info (/auth/me)', meData);
        results.data.userInfo = meData;
      } catch (error) {
        safeLog('User Info (/auth/me)', null, error);
        results.errors.userInfo = error.message || error;
      }
    } else {
      console.log('\n🔓 No authentication token found. Skipping authenticated endpoints.');
      results.authenticated = false;
      results.data.authenticated = false;
    }

    // 6. Try to get a sample product if stores are available
    if (results.data.allStores && results.data.allStores.length > 0) {
      console.log('\n🔄 Fetching Store Products (first store)...');
      try {
        const firstStore = results.data.allStores[0];
        const storeId = firstStore.id || firstStore._id;
        if (storeId) {
          const productsData = await API.storesAPI.getStoreProducts(storeId);
          safeLog(`Products for Store: ${firstStore.name || firstStore.storeName || 'Unknown'}`, productsData);
          results.data.storeProducts = productsData;
          
          // Try to get a sample product details if products are available
          if (productsData && productsData.length > 0) {
            const firstProduct = productsData[0];
            const productId = firstProduct.id || firstProduct._id;
            if (productId) {
              try {
                const productDetails = await API.productsAPI.getProductDetails(productId);
                safeLog(`Product Details: ${firstProduct.name || firstProduct.title || 'Unknown'}`, productDetails);
                results.data.productDetails = productDetails;
              } catch (error) {
                safeLog('Product Details', null, error);
                results.errors.productDetails = error.message || error;
              }
            }
          }
        }
      } catch (error) {
        safeLog('Store Products', null, error);
        results.errors.storeProducts = error.message || error;
      }
    }

  } catch (generalError) {
    console.error('❌ General error during API data collection:', generalError);
    results.errors.general = generalError.message || generalError;
  }

  // Final summary
  console.log('\n\n🎯 API DATA COLLECTION SUMMARY');
  console.log('='.repeat(60));
  console.log(`📅 Collection Time: ${results.timestamp}`);
  console.log(`🌐 Network Status: ${results.networkStatus}`);
  console.log(`✅ Successful Requests: ${Object.keys(results.data).length}`);
  console.log(`❌ Failed Requests: ${Object.keys(results.errors).length}`);
  console.log(`🔑 Authenticated: ${results.authenticated ? 'Yes' : 'No'}`);
  
  if (Object.keys(results.data).length > 0) {
    console.log('\n📊 Successfully Fetched Data Types:');
    Object.keys(results.data).forEach(key => {
      const data = results.data[key];
      const count = Array.isArray(data) ? data.length : (data && typeof data === 'object') ? Object.keys(data).length : 'N/A';
      console.log(`  • ${key}: ${count} items`);
    });
  }
  
  if (Object.keys(results.errors).length > 0) {
    console.log('\n❌ Failed Requests:');
    Object.keys(results.errors).forEach(key => {
      console.log(`  • ${key}: ${results.errors[key]}`);
    });
  }
  
  console.log('='.repeat(60));
  console.log('🎉 API Data Collection Complete!');
  
  return results;
};

// Export for use in components or scripts
export default fetchAllAPIData;