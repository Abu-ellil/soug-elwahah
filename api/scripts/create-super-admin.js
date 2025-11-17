require('dotenv').config();
const mongoose = require('mongoose');
const SuperAdmin = require('../src/models/SuperAdmin');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

async function createSuperAdmin() {
  try {
    // Check if super admin already exists
    const existingAdmin = await SuperAdmin.findOne({ 
      $or: [
        { email: 'admin@soug-elwahah.com' },
        { phone: '010000' }
      ] 
    });

    if (existingAdmin) {
      console.log('Super admin account already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Phone:', existingAdmin.phone);
      console.log('Name:', existingAdmin.name);
      process.exit(0);
    }

    // Create the first super admin
    const superAdmin = new SuperAdmin({
      name: 'Super Admin',
      email: 'admin@soug-elwahah.com',
      phone: '010000000',
      password: 'admin123', // Change this after first login
      role: 'super_admin',
      permissions: [
        'manage_users',
        'manage_stores', 
        'manage_orders',
        'manage_categories',
        'view_reports',
        'manage_system_settings'
      ]
    });

    await superAdmin.save();
    
    console.log('Super admin account created successfully!');
    console.log('Email: admin@soug-elwahah.com');
    console.log('Phone: 0100000000');
    console.log('Password: admin123');
    console.log('Please change the password after first login for security.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
}

createSuperAdmin();