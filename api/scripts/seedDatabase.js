const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Category = require('../models/Category');

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set. Create a .env file or export the variable.');
  process.exit(1);
}

const seed = async () => {
  try {
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB for seeding');

    // Clear existing products, services, and categories
    await Product.deleteMany({});
    await Service.deleteMany({});
    await Category.deleteMany({});

    // First insert categories to get their IDs
    let categoryMap = {};
    if (Array.isArray(CATEGORIES) && CATEGORIES.length) {
      const categoryDocs = CATEGORIES.map(cat => ({
        name: cat.name,
        icon: cat.icon,
        slug: cat.name.toLowerCase().replace(/\s+/g, '-')
      }));
      
      const savedCategories = await Category.insertMany(categoryDocs);
      console.log(`Inserted ${savedCategories.length} categories`);
      
      // Create a map of category names to their MongoDB IDs
      savedCategories.forEach((cat, index) => {
        categoryMap[CATEGORIES[index].id] = cat._id;
      });
    }

    // Transform and insert products
    if (Array.isArray(ITEMS) && ITEMS.length) {
      const productDocs = ITEMS.map(item => ({
        title: item.name,
        description: item.description || `وصف ${item.name}`,
        shortDescription: item.shortDescription || `${item.name} طازج`,
        price: item.price,
        priceDiscount: item.priceDiscount,
        category: categoryMap[item.category],
        slug: item.name.toLowerCase().replace(/\s+/g, '-'),
        images: [{url: item.image || 'default-product.jpg', public_id: `product-${item.id || Math.random().toString(36).substring(7)}`}],
        quantity: item.quantity || 100,
        unit: 'piece', // Default unit that matches enum
        ratingsAverage: item.rating || 4.5,
        ratingsQuantity: 10,
        active: true,
        // Add required fields
        seller: new mongoose.Types.ObjectId(), // Temporary ID for seller
        stock: item.stock || 50,
        location: { type: "Point", coordinates: [30.0444, 31.2357] }, // Default Cairo coordinates
        currency: "EGP",
        isAvailable: true
      }));
      
      await Product.insertMany(productDocs);
      console.log(`Inserted ${productDocs.length} products`);
    }

    // Transform and insert services
    if (Array.isArray(SERVICES) && SERVICES.length) {
      const serviceDocs = SERVICES.map(service => ({
        title: service.name,
        description: service.description || `وصف ${service.name}`,
        shortDescription: service.shortDescription || `خدمة ${service.name} متميزة`,
        pricing: {
          amount: service.price || 100,
          unit: 'fixed',
          currency: 'EGP'
        },
        category: categoryMap[service.category || 'services'] || new mongoose.Types.ObjectId(),
        slug: service.name.toLowerCase().replace(/\s+/g, '-'),
        images: [{url: service.image || 'default-service.jpg', public_id: `service-${service.id || Math.random().toString(36).substring(7)}`}],
        ratingsAverage: service.rating || 4.5,
        ratingsQuantity: 10,
        active: true,
        // Add required fields
        provider: new mongoose.Types.ObjectId(), // Temporary ID for provider
        location: { type: "Point", coordinates: [30.0444, 31.2357] }, // Default Cairo coordinates
        isAvailable: true
      }));
      
      await Service.insertMany(serviceDocs);
      console.log(`Inserted ${serviceDocs.length} services`);
    }

    console.log('Seeding completed');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
};

seed();
