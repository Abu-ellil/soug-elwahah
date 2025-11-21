const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set. Create a .env file or export the variable.');
  process.exit(1);
}

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      $or: [
        { email: 'admin@elsoug.com' },
        { phone: '01000000000' }
      ]
    });

    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email: admin@elsoug.com');
      console.log('Phone: 01000000000');
      console.log('Password: admin123');
      process.exit(0);
    }

    // Create admin user (password will be hashed by pre-save middleware)
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
    
    console.log('Admin user created successfully!');
    console.log('Email: admin@elsoug.com');
    console.log('Phone: 01000000000');
    console.log('Password: admin123');
    console.log('');
    console.log('You can now log in to the admin panel using these credentials.');
    
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin user:', err);
    process.exit(1);
  }
};

createAdmin();