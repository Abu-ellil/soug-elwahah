require('dotenv').config();
const mongoose = require('mongoose');
const SuperAdmin = require('./src/models/SuperAdmin');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');

    // Find the super admin
    const superAdmin = await SuperAdmin.findOne({ 
      $or: [
        { email: 'admin@soug-elwahah.com' },
        { phone: '0100000' }
      ] 
    });

    if (!superAdmin) {
      console.log('No super admin found with the specified credentials!');
      console.log('Available Super Admins:');
      const allAdmins = await SuperAdmin.find({});
      console.log(allAdmins.map(admin => ({
        name: admin.name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role
      })));
      process.exit(0);
    }

    console.log('Super admin found:');
    console.log({
      name: superAdmin.name,
      email: superAdmin.email,
      phone: superAdmin.phone,
      role: superAdmin.role,
      isActive: superAdmin.isActive
    });

    // Test password comparison (using default password from the script)
    const isPasswordValid = await superAdmin.comparePassword('admin123');
    console.log('Password validation (with "admin123"):', isPasswordValid);

    // Check if this admin is in the environment variable lists
    const adminPhones = process.env.ADMIN_PHONES?.split(',') || [];
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    
    console.log('Admin phones in env:', adminPhones);
    console.log('Admin emails in env:', adminEmails);
    console.log('Super admin phone in env?', adminPhones.includes(superAdmin.phone));
    console.log('Super admin email in env?', adminEmails.includes(superAdmin.email));

    process.exit(0);
  } catch (error) {
    console.error('Error testing admin login:', error);
    process.exit(1);
  }
}

testAdminLogin();
