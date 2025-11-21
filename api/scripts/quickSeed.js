const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Category = require('../models/Category');
const User = require('../models/User');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set. Create a .env file or export the variable.');
  process.exit(1);
}

const quickSeed = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for quick seeding');

    // Clear existing data
    await Product.deleteMany({});
    await Service.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});

    // Create a basic village first
    const village = await Village.create({
      name: 'كفر الشيخ',
      nameEn: 'Kafr El Sheikh',
      governorate: 'كفر الشيخ',
      center: 'كفر الشيخ',
      location: {
        type: 'Point',
        coordinates: [30.9346, 31.1382] // Coordinates for Kafr El Sheikh
      },
      isActive: true
    });

    // Create a basic user (seller/provider)
    const user = await User.create({
      name: 'Test Seller',
      email: 'test@example.com',
      password: 'password123',
      phone: '01234567890',
      role: 'seller',
      isActive: true,
      emailVerified: true,
      village: village._id,
      location: {
        type: 'Point',
        coordinates: [30.9346, 31.1382] // Same as village for consistency
      }
    });

    // Create a basic category
    const category = await Category.create({
      name: 'General',
      nameEn: 'General',
      isActive: true
    });

    // Create sample products with valid schema
    const sampleProducts = [
      {
        title: 'Tomato',
        slug: 'tomato-' + Date.now(),
        description: 'Fresh tomatoes from local farm',
        price: 15,
        quantity: 100,
        unit: 'kg',
        condition: 'new',
        category: category._id,
        seller: user._id,
        village: village._id,
        location: {
          type: 'Point',
          coordinates: [30.9346, 31.1382] // Same as village for consistency
        },
        images: [{
          public_id: 'tomato_img',
          url: 'https://res.cloudinary.com/dg5u3cozp/image/upload/v1705000000/products/tomato.jpg',
          isMain: true
        }],
        status: 'active',
        isAvailable: true
      },
      {
        title: 'Fresh Eggs',
        slug: 'fresh-eggs-' + Date.now(),
        description: 'Fresh farm eggs',
        price: 60,
        quantity: 300,
        unit: 'piece',
        condition: 'new',
        category: category._id,
        seller: user._id,
        village: village._id,
        location: {
          type: 'Point',
          coordinates: [30.9346, 31.1382] // Same as village for consistency
        },
        images: [{
          public_id: 'eggs_img',
          url: 'https://res.cloudinary.com/dg5u3cozp/image/upload/v1705000001/products/eggs.jpg',
          isMain: true
        }],
        status: 'active',
        isAvailable: true
      }
    ];

    await Product.insertMany(sampleProducts);
    console.log(`Inserted ${sampleProducts.length} products`);

    // Create sample services with valid schema
    const sampleServices = [
      {
        title: 'Delivery Service',
        slug: 'delivery-service-' + Date.now(),
        description: 'Local delivery service',
        category: category._id,
        provider: user._id,
        village: village._id,
        location: {
          type: 'Point',
          coordinates: [30.9346, 31.1382] // Same as village for consistency
        },
        pricing: {
          type: 'fixed',
          amount: 10,
          currency: 'EGP'
        },
        serviceType: 'on_site',
        status: 'active',
        availability: {
          isAvailable: true
        },
        images: [{
          public_id: 'delivery_img',
          url: 'https://res.cloudinary.com/dg5u3cozp/image/upload/v1705000002/services/delivery.jpg',
          isMain: true
        }]
      },
      {
        title: 'Plumbing Service',
        slug: 'plumbing-service-' + Date.now(),
        description: 'Plumbing repair and maintenance',
        category: category._id,
        provider: user._id,
        village: village._id,
        location: {
          type: 'Point',
          coordinates: [30.9346, 31.1382] // Same as village for consistency
        },
        pricing: {
          type: 'hourly',
          amount: 50,
          currency: 'EGP'
        },
        serviceType: 'on_site',
        status: 'active',
        availability: {
          isAvailable: true
        },
        images: [{
          public_id: 'plumbing_img',
          url: 'https://res.cloudinary.com/dg5u3cozp/image/upload/v1705000003/services/plumbing.jpg',
          isMain: true
        }]
      }
    ];

    await Service.insertMany(sampleServices);
    console.log(`Inserted ${sampleServices.length} services`);

    console.log('Quick seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('Quick seeding failed:', err);
    process.exit(1);
  }
};

quickSeed();