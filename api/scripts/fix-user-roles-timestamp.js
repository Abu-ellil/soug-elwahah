const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '.env' });
if (!process.env.MONGODB_URI) {
  dotenv.config(); // Load default .env as fallback
}

const MONGODB_URI = process.env.MONGODB_URI;

const fixUserRolesTimestamp = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Find the admin user with the specified email
    const user = await User.findOne({ email: 'aboellil.me@gmail.com' });
    
    if (!user) {
      console.log('Admin user not found!');
      process.exit(0);
    }

    console.log('Current rolesChangedAt:', user.rolesChangedAt);

    // Update the user with correct roles and permissions without triggering the pre-save middleware
    // that updates rolesChangedAt
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          roles: ['admin'],
          activeRole: 'admin', 
          permissions: ['admin:all']
        }
      },
      { runValidators: false } // Skip validation to avoid triggers
    );

    console.log('User roles and permissions updated without changing rolesChangedAt');
    
    // Verify the update
    const updatedUser = await User.findById(user._id);
    console.log('Updated rolesChangedAt:', updatedUser.rolesChangedAt);
    console.log('User updated successfully!');
    
    process.exit(0);
 } catch (err) {
    console.error('Failed to fix user roles timestamp:', err);
    process.exit(1);
  }
};

fixUserRolesTimestamp();