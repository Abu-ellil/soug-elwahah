const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });

const StoreOwner = require('./src/models/StoreOwner');

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    const users = await StoreOwner.find({ phone: '01221089249' });
    console.log('Found', users.length, 'users with phone 01221089249');

    for (const user of users) {
      console.log('User:', {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        isActive: user.isActive,
        verificationStatus: user.verificationStatus,
        passwordHash: user.password
      });

      // Test common passwords
      const testPasswords = ['111111', '123456', 'password', '123456789'];

      for (const testPass of testPasswords) {
        const isMatch = await bcrypt.compare(testPass, user.password);
        console.log(`Password '${testPass}' matches: ${isMatch}`);
      }
      console.log('---');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser();