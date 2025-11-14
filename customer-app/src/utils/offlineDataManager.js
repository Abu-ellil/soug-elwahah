// Offline Storage and Sync Service for Egyptian Delivery App

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, NetInfo, Platform } from 'react-native';

// Storage keys
const STORAGE_KEYS = {
  STORES: 'cached_stores',
  PRODUCTS: 'cached_products',
  VILLAGES: 'cached_villages',
  CATEGORIES: 'cached_categories',
  USER_CART: 'user_cart',
  OFFLINE_ORDERS: 'offline_orders',
  PENDING_ACTIONS: 'pending_actions',
  LAST_SYNC: 'last_sync',
  USER_LOCATION: 'user_location',
  APP_SETTINGS: 'app_settings',
};

// Data Models for Caching
export class OfflineDataManager {
  constructor() {
    this.isOnline = true;
    this.syncQueue = [];
    this.listeners = [];

    this.initializeNetworkListener();
  }

  // Network status monitoring
  initializeNetworkListener() {
    // Only initialize network listener on mobile platforms
    if (Platform.OS !== 'web' && NetInfo) {
      NetInfo.addEventListener((state) => {
        const wasOnline = this.isOnline;
        this.isOnline = state.isConnected;

        if (wasOnline !== this.isOnline) {
          this.notifyListeners('network_changed', { isOnline: this.isOnline });

          if (this.isOnline) {
            this.handleReconnection();
          }
        }
      });
    }
  }

  // Cache management for stores
  async cacheStores(stores) {
    try {
      const storeData = {
        data: stores,
        timestamp: Date.now(),
        version: '1.0',
      };
      await AsyncStorage.setItem(STORAGE_KEYS.STORES, JSON.stringify(storeData));
      return true;
    } catch (error) {
      console.error('Error caching stores:', error);
      return false;
    }
  }

  async getCachedStores() {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.STORES);
      if (cached) {
        const { data, timestamp, version } = JSON.parse(cached);
        // Check if data is not too old (24 hours)
        const isValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;
        if (isValid) {
          return { data, timestamp, version };
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached stores:', error);
      return null;
    }
  }

  // Cache management for products
  async cacheProducts(products) {
    try {
      const productData = {
        data: products,
        timestamp: Date.now(),
        version: '1.0',
      };
      await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(productData));
      return true;
    } catch (error) {
      console.error('Error caching products:', error);
      return false;
    }
  }

  async getCachedProducts() {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (cached) {
        const { data, timestamp, version } = JSON.parse(cached);
        const isValid = Date.now() - timestamp < 24 * 60 * 60 * 1000;
        if (isValid) {
          return { data, timestamp, version };
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached products:', error);
      return null;
    }
  }

  // Cache management for villages
  async cacheVillages(villages) {
    try {
      const villageData = {
        data: villages,
        timestamp: Date.now(),
        version: '1.0',
      };
      await AsyncStorage.setItem(STORAGE_KEYS.VILLAGES, JSON.stringify(villageData));
      return true;
    } catch (error) {
      console.error('Error caching villages:', error);
      return false;
    }
  }

  async getCachedVillages() {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.VILLAGES);
      if (cached) {
        const { data, timestamp, version } = JSON.parse(cached);
        const isValid = Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000; // 7 days for villages
        if (isValid) {
          return { data, timestamp, version };
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting cached villages:', error);
      return null;
    }
  }

  // Offline cart management
  async saveOfflineCart(cartItems) {
    try {
      const cartData = {
        items: cartItems,
        lastModified: Date.now(),
        version: '1.0',
      };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_CART, JSON.stringify(cartData));
      return true;
    } catch (error) {
      console.error('Error saving offline cart:', error);
      return false;
    }
  }

  async getOfflineCart() {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.USER_CART);
      if (cached) {
        return JSON.parse(cached);
      }
      return { items: [], lastModified: 0, version: '1.0' };
    } catch (error) {
      console.error('Error getting offline cart:', error);
      return { items: [], lastModified: 0, version: '1.0' };
    }
  }

  // Offline orders management
  async saveOfflineOrder(order) {
    try {
      // Clean the order data to ensure no React elements are included
      const cleanOrder = JSON.parse(JSON.stringify(order));
      
      const offlineOrders = await this.getOfflineOrders();
      const newOrder = {
        ...cleanOrder,
        id: cleanOrder.id || this.generateOrderId(),
        status: 'pending_sync',
        offline: true,
        createdOffline: true,
        timestamp: Date.now(),
      };

      offlineOrders.push(newOrder);
      await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_ORDERS, JSON.stringify(offlineOrders));

      // Add to sync queue
      this.addToSyncQueue('create_order', newOrder);

      return newOrder;
    } catch (error) {
      console.error('Error saving offline order:', error);
      throw error;
    }
  }

  async getOfflineOrders() {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_ORDERS);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error getting offline orders:', error);
      return [];
    }
  }

  // Pending actions queue
  async addToSyncQueue(action, data) {
    try {
      console.log(`📝 Adding ${action} to sync queue...`);
      
      // Clean the data before adding to queue
      const cleanData = JSON.parse(JSON.stringify(data));
      console.log('✅ Data cleaned for sync queue');
      
      const queue = await this.getSyncQueue();
      const queueItem = {
        id: this.generateSyncId(),
        action,
        data: cleanData,
        timestamp: Date.now(),
        retryCount: 0,
      };

      queue.push(queueItem);
      await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(queue));
      
      console.log(`✅ ${action} added to sync queue successfully`);

      if (this.isOnline) {
        console.log('🌐 Online - processing sync queue immediately');
        this.processSyncQueue();
      }

      return queueItem;
    } catch (error) {
      console.error('❌ Error adding to sync queue:', error);
      throw error;
    }
  }

  async getSyncQueue() {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_ACTIONS);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error getting sync queue:', error);
      return [];
    }
  }

  // Handle network reconnection
  async handleReconnection() {
    // Only show alert on mobile platforms
    if (Platform.OS !== 'web') {
      Alert.alert('تم الاتصال بالإنترنت', 'جاري مزامنة البيانات...', [
        {
          text: 'موافق',
          onPress: () => this.syncAllData().catch(console.error),
        },
      ]);
    } else {
      // On web, just sync without alert
      this.syncAllData().catch(console.error);
    }
  }

  // Data synchronization
  async syncAllData() {
    if (!this.isOnline) {
      throw new Error('No internet connection');
    }

    try {
      await this.processSyncQueue();

      // Update last sync timestamp
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());

      // Notify success
      this.notifyListeners('sync_completed', { timestamp: Date.now() });

      return true;
    } catch (error) {
      console.error('Error during data sync:', error);
      this.notifyListeners('sync_failed', { error: error.message });
      throw error;
    }
  }

  async getLastSyncTime() {
    try {
      const timestamp = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return timestamp ? parseInt(timestamp, 10) : 0;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return 0;
    }
  }

  // Mock sync operations (replace with real API calls)
  async processSyncQueue() {
    if (!this.isOnline) return;

    try {
      const queue = await this.getSyncQueue();

      for (const item of queue) {
        if (item.retryCount >= 3) {
          // Mark as failed after 3 retries
          item.failed = true;
          item.failedAt = Date.now();
          continue;
        }

        try {
          await this.processSyncItem(item);
          // Remove successfully processed item
          const updatedQueue = queue.filter((q) => q.id !== item.id);
          await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(updatedQueue));
        } catch (error) {
          // Increment retry count
          item.retryCount += 1;
          await this.updateSyncItem(item);
          console.error(`Sync item failed (attempt ${item.retryCount}):`, error);
        }
      }
    } catch (error) {
      console.error('Error processing sync queue:', error);
    }
  }

  async processSyncItem(item) {
    switch (item.action) {
      case 'create_order':
        console.log('🔄 Syncing order creation...');
        console.log('📋 Sync item data:', JSON.stringify(item.data, null, 2));
        
        // Ensure data is clean before processing
        const cleanData = JSON.parse(JSON.stringify(item.data));
        console.log('✅ Sync data cleaned successfully');
        
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return { success: true, syncedOrder: { ...cleanData, synced: true } };
      default:
        throw new Error(`Unknown sync action: ${item.action}`);
    }
  }

  async updateSyncItem(updatedItem) {
    try {
      const queue = await this.getSyncQueue();
      const index = queue.findIndex((item) => item.id === updatedItem.id);
      if (index >= 0) {
        queue[index] = updatedItem;
        await AsyncStorage.setItem(STORAGE_KEYS.PENDING_ACTIONS, JSON.stringify(queue));
      }
    } catch (error) {
      console.error('Error updating sync queue item:', error);
    }
  }

  // Utility methods
  generateOrderId() {
    return `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSyncId() {
    return `SYNC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Event listeners
  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter((listener) => listener !== callback);
  }

  notifyListeners(event, data) {
    this.listeners.forEach((listener) => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in offline data listener:', error);
      }
    });
  }

  // Network status
  isConnected() {
    // On web, assume always online for now
    if (Platform.OS === 'web') {
      return true;
    }
    return this.isOnline;
  }

  // Storage stats
  async getStorageStats() {
    try {
      const keys = Object.values(STORAGE_KEYS);
      const stats = {};

      for (const key of keys) {
        const data = await AsyncStorage.getItem(key);
        stats[key] = data ? data.length : 0;
      }

      return stats;
    } catch (error) {
      console.error('Error getting storage stats:', error);
      return {};
    }
  }
}

// Export singleton instance
export const offlineDataManager = new OfflineDataManager();

// Export utility functions
export const isOnline = () => offlineDataManager.isConnected();

export const withOfflineHandling = (operation) => {
  return async (...args) => {
    if (offlineDataManager.isConnected()) {
      return await operation(...args);
    } else {
      // Return cached data or mock response
      throw new Error('No internet connection');
    }
  };
};

export default offlineDataManager;
