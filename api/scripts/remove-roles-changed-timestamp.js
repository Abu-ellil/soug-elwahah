const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '.env' });
if (!process.env.MONGODB_URI) {
  dotenv.config(); // Load default .env as fallback
}

const MONGODB_URI = process.env.MONGODB_URI;

const removeRolesChangedTimestamp = async () => {
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

    // Remove the rolesChangedAt field to avoid token validation issues
    await User.updateOne(
      { _id: user._id },
      { 
        $unset: { rolesChangedAt: 1 } // Remove the field entirely
      }
    );

    console.log('rolesChangedAt field removed');
    
    // Verify the update
    const updatedUser = await User.findById(user._id);
    console.log('Updated user - rolesChangedAt:', updatedUser.rolesChangedAt);
    console.log('User updated successfully!');
    
    process.exit(0);
 } catch (err) {
    console.error('Failed to remove rolesChangedAt timestamp:', err);
    process.exit(1);
  }
};

removeRolesChangedTimestamp();