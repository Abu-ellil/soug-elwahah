const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set. Create a .env file or export the variable.');
  process.exit(1);
}

const resetAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Delete existing admin user
    const deleteResult = await User.deleteOne({ 
      $or: [
        { email: 'admin@elsoug.com' },
        { phone: '01000000000' }
      ]
    });

    console.log(`Deleted ${deleteResult.deletedCount} existing admin user(s)`);

    // Create new admin user (password will be hashed by pre-save middleware)
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@elsoug.com',
      phone: '01000000000',
      password: 'admin123',
      roles: ['admin'],
      activeRole: 'admin',
      permissions: ['admin:all'],
      isPhoneVerified: true,
      isVerified: true,
      isActive: true,
      active: true,
      location: {
        type: 'Point',
        coordinates: [31.2357, 30.0444] // Cairo coordinates [longitude, latitude]
      }
    });

    await adminUser.save();
    
    console.log('✅ New admin user created successfully!');
    console.log('Email: admin@elsoug.com');
    console.log('Phone: 01000000000');
    console.log('Password: admin123');
    console.log('');
    console.log('You can now log in to the admin panel using these credentials.');
    
    process.exit(0);
  } catch (err) {
    console.error('Failed to reset admin user:', err);
    process.exit(1);
  }
};

resetAdmin();