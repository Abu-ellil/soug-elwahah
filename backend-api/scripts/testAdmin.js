const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const testAdmin = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Find admin user
    const adminUser = await User.findOne({ 
      email: 'admin@elsoug.com' 
    }).select('+password');

    if (!adminUser) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('✅ Admin user found:');
    console.log('- ID:', adminUser._id);
    console.log('- Name:', adminUser.name);
    console.log('- Email:', adminUser.email);
    console.log('- Phone:', adminUser.phone);
    console.log('- Roles:', adminUser.roles);
    console.log('- Active Role:', adminUser.activeRole);
    console.log('- Is Active:', adminUser.isActive);
    console.log('- Is Verified:', adminUser.isVerified);
    console.log('- Password exists:', !!adminUser.password);

    // Test password verification
    const testPassword = 'admin123';
    const isPasswordCorrect = await adminUser.correctPassword(testPassword, adminUser.password);
    console.log('- Password test (admin123):', isPasswordCorrect ? '✅ Correct' : '❌ Incorrect');

    // Test bcrypt directly
    const directBcryptTest = await bcrypt.compare(testPassword, adminUser.password);
    console.log('- Direct bcrypt test:', directBcryptTest ? '✅ Correct' : '❌ Incorrect');

    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
};

testAdmin();