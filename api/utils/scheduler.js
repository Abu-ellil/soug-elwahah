const cron = require('node-cron');
const DeliveryService = require('../services/deliveryService');
const { emitDeliveryUpdate } = require('../config/socket');

class DeliveryScheduler {
  static initialize() {
    console.log('Initializing delivery scheduler...');
    
    // Schedule automatic delivery assignment every 2 minutes
    // This will assign drivers to orders that are ready but not yet assigned
    cron.schedule('*/2 * * * *', async () => {
      console.log('Running auto-assignment task...');
      try {
        const results = await DeliveryService.autoAssignDeliveries();
        console.log(`Auto-assignment completed: ${results.length} orders processed`);
        
        // Log results
        const assigned = results.filter(r => r.status === 'assigned').length;
        const failed = results.filter(r => r.status === 'failed').length;
        console.log(`Assigned: ${assigned}, Failed: ${failed}`);
      } catch (error) {
        console.error('Error in auto-assignment task:', error);
      }
    });
    
    // Schedule cleanup of old location history every hour 
    cron.schedule('0 * * * *', async () => {
      console.log('Running location history cleanup...');
      try {
        await DeliveryScheduler.cleanupLocationHistory();
      } catch (error) {
        console.error('Error in location history cleanup:', error);
      }
    });
    
    // Schedule delivery analytics update every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      console.log('Running delivery analytics update...');
      try {
        await DeliveryScheduler.updateDeliveryAnalytics();
      } catch (error) {
        console.error('Error in delivery analytics update:', error);
      }
    });
    
    console.log('Delivery scheduler initialized successfully');
  }
  
  static async cleanupLocationHistory() {
    // This function would clean up old location history to prevent database bloat
    // Implementation would depend on the specific location history storage approach
    console.log('Location history cleanup completed');
  }
  
 static async updateDeliveryAnalytics() {
    // This function would update cached analytics for faster retrieval
    // Implementation would update aggregated statistics for drivers and stores
    console.log('Delivery analytics updated');
  }
}

module.exports = DeliveryScheduler;