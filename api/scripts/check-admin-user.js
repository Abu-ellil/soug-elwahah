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

const checkAdminUser = async () => {
  try {
    console.log('Checking admin user account...');

    // Find the specific admin user
    const user = await User.findOne({ email: 'admin@elsoug.com' });
    
    if (!user) {
      console.log('Admin user with email admin@elsoug.com not found');
      
      // Check if there's any user with the name "admin" or similar
      const users = await User.find({ 
        $or: [
          { name: /admin/i },
          { email: /admin/i }
        ]
      });
      
      console.log(`Found ${users.length} potential admin users:`);
      users.forEach(u => {
        console.log(`- ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Roles: [${u.roles.join(', ')}], Permissions: [${u.permissions.join(', ')}]`);
      });
    } else {
      console.log('Admin user found:');
      console.log(`- ID: ${user._id}`);
      console.log(`- Name: ${user.name}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Phone: ${user.phone}`);
      console.log(`- Roles: [${user.roles.join(', ')}]`);
      console.log(`- Active Role: ${user.activeRole}`);
      console.log(`- Permissions: [${user.permissions.join(', ')}]`);
      console.log(`- Role (legacy): ${user.role}`);
      console.log(`- Is Active: ${user.isActive}`);
      console.log(`- Is Verified: ${user.isVerified}`);
      console.log(`- Is Phone Verified: ${user.isPhoneVerified}`);
      console.log(`- Roles Changed At: ${user.rolesChangedAt}`);
      console.log(`- Password Changed At: ${user.passwordChangedAt}`);
    }
    
    // Also check if there are any users with admin role
    const allAdminUsers = await User.find({ 
      $or: [
        { 'roles': { $in: ['admin'] } },
        { 'roles': { $in: ['superadmin'] } }
      ]
    });
    
    console.log(`\nFound ${allAdminUsers.length} users with admin roles:`);
    allAdminUsers.forEach(u => {
      console.log(`- ID: ${u._id}, Name: ${u.name}, Email: ${u.email}, Roles: [${u.roles.join(', ')}], Permissions: [${u.permissions.join(', ')}], Active Role: ${u.activeRole}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking admin user:', error);
    process.exit(1);
  }
};

checkAdminUser();