const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./src/models/Category');

async function addCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const categories = [
      {
        name: "بقالة",
        nameEn: "Grocery",
        icon: "cart-outline",
        color: "#FF6B6B",
      },
      {
        name: "مخبوزات",
        nameEn: "Bakery",
        icon: "bread-outline",
        color: "#4ECDC4",
      },
      {
        name: "فواكه و خضروات",
        nameEn: "Fruits & Vegetables",
        icon: "nutrition-outline",
        color: "#45B7D1",
      },
      {
        name: "لحوم و دواجن",
        nameEn: "Meat & Poultry",
        icon: "restaurant-outline",
        color: "#96CEB4",
      },
      {
        name: "حلويات",
        nameEn: "Sweets",
        icon: "ice-cream-outline",
        color: "#FFEAA7",
      },
      {
        name: "منزلية",
        nameEn: "Household",
        icon: "home-outline",
        color: "#DDA0DD",
      },
      {
        name: "أخرى",
        nameEn: "Other",
        icon: "cube-outline",
        color: "#95A5A6",
      },
    ];

    await Category.insertMany(categories);
    console.log('Categories added successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addCategories();