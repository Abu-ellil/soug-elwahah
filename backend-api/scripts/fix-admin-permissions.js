const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });
if (!process.env.MONGODB_URI) {
  dotenv.config(); // Load default .env as fallback
}

// Import User model
const User = require('../models/User');

// Connect to database
const connectDB = require('../config/database');
connectDB();

const fixAdminPermissions = async () => {
  try {
    console.log('Fixing admin permissions and roles...');

    // Find all users with admin role but without admin permissions
    const adminUsers = await User.find({
      roles: { $in: ['admin', 'superadmin'] }
    });

    console.log(`Found ${adminUsers.length} admin users to check`);

    let updatedCount = 0;
    
    for (const user of adminUsers) {
      let needsUpdate = false;
      
      // Check if user has correct admin permissions
      if (!user.permissions.includes('admin:all')) {
        console.log(`Updating permissions for user: ${user._id} (${user.name})`);
        user.permissions = ['admin:all'];
        needsUpdate = true;
      }
      
      // Check if user has correct active role
      if (user.roles.includes('admin') && user.activeRole !== 'admin') {
        console.log(`Updating active role for user: ${user._id} (${user.name})`);
        user.activeRole = 'admin';
        needsUpdate = true;
      } else if (user.roles.includes('superadmin') && user.activeRole !== 'superadmin') {
        console.log(`Updating active role for user: ${user._id} (${user.name})`);
        user.activeRole = 'superadmin';
        needsUpdate = true;
      }
      
      // Always update rolesChangedAt to invalidate existing tokens
      user.rolesChangedAt = new Date();
      needsUpdate = true;
      
      if (needsUpdate) {
        await user.save();
        updatedCount++;
      }
    }

    console.log(`Updated ${updatedCount} users`);
    
    // Also check for any user with roles that include admin/superadmin but incorrect permissions
    const allUsers = await User.find({});
    let additionalFixed = 0;
    
    for (const user of allUsers) {
      let needsUpdate = false;
      
      if ((user.roles.includes('admin') || user.roles.includes('superadmin')) &&
          !user.permissions.includes('admin:all')) {
        console.log(`Updating permissions for user: ${user._id} (${user.name})`);
        user.permissions = ['admin:all'];
        needsUpdate = true;
      }
      
      if (user.roles.includes('admin') && user.activeRole !== 'admin') {
        console.log(`Updating active role for user: ${user._id} (${user.name})`);
        user.activeRole = 'admin';
        needsUpdate = true;
      } else if (user.roles.includes('superadmin') && user.activeRole !== 'superadmin') {
        console.log(`Updating active role for user: ${user._id} (${user.name})`);
        user.activeRole = 'superadmin';
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await user.save();
        additionalFixed++;
      }
    }
    
    console.log(`Fixed additional ${additionalFixed} users`);
    
    console.log('Admin permissions and roles fix completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error fixing admin permissions and roles:', error);
    process.exit(1);
  }
};

fixAdminPermissions();