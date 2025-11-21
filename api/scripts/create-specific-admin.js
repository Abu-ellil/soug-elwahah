const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: '.env' });
if (!process.env.MONGODB_URI) {
  dotenv.config(); // Load default .env as fallback
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set. Create a .env file or export the variable.');
  process.exit(1);
}

const createAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Check if admin with specified email already exists
    const existingAdmin = await User.findOne({ 
      email: 'aboellil.me@gmail.com'
    });

    if (existingAdmin) {
      console.log('Admin user with email aboellil.me@gmail.com already exists!');
      process.exit(0);
    }

    // Create admin user (password will be hashed by pre-save middleware)
    const adminUser = new User({
      name: 'Admin User',
      email: 'aboellil.me@gmail.com',
      phone: '01122334455', // Unique Egyptian phone number format
      password: '1111111',
      roles: ['admin'],
      activeRole: 'admin',
      permissions: ['admin:all'],
      isPhoneVerified: true,
      isVerified: true,
      isActive: true,
      active: true,
      location: {
        type: 'Point',
        coordinates: [31.2357, 30.044] // Cairo coordinates [longitude, latitude]
      }
    });

    await adminUser.save();
    
    console.log('Admin user created successfully!');
    console.log('Email: aboellil.me@gmail.com');
    console.log('Password: 1111111');
    console.log('Role: admin');
    console.log('');
    console.log('You can now log in to the admin panel using these credentials.');
    
    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin user:', err);
    process.exit(1);
  }
};

createAdmin();