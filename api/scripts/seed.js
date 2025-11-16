#!/usr/bin/env node

require("dotenv").config();
const connectDB = require("../src/config/database");
const User = require("../src/models/User");
const StoreOwner = require("../src/models/StoreOwner");
const Store = require("../src/models/Store");
const Category = require("../src/models/Category");
const Product = require("../src/models/Product");
const bcrypt = require("bcryptjs");

const seedData = async (options = {}) => {
  try {
    await connectDB();

    const { clearOnly = false, skipConfirmation = false } = options;

    if (!skipConfirmation) {
      console.log(
        "⚠️  WARNING: This will delete all existing data in the database!"
      );
      console.log("Database:", process.env.MONGODB_URI.split("/").pop());

      if (!clearOnly) {
        console.log("This will create sample data for testing.");
      }

      const readline = require("readline");
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      const answer = await new Promise((resolve) => {
        rl.question(
          "Are you sure you want to continue? (yes/no): ",
          (input) => {
            rl.close();
            resolve(input.toLowerCase());
          }
        );
      });

      if (answer !== "yes" && answer !== "y") {
        console.log("Seed operation cancelled.");
        process.exit(0);
      }
    }

    // Clear existing data
    console.log("Clearing existing data...");
    await User.deleteMany({});
    await StoreOwner.deleteMany({});
    await Store.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("Data cleared successfully!");

    if (clearOnly) {
      console.log("Database cleared successfully!");
      process.exit(0);
    }

    // Create categories
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

    const createdCategories = await Category.insertMany(categories);
    console.log(`${createdCategories.length} categories created`);

    // Create sample users
    const users = [
      {
        name: "أحمد محمد",
        phone: "0101111",
        password: await bcrypt.hash("123456", 12),
        avatar:
          "https://ui-avatars.com/api/?name=Ahmed+Mohamed&background=0D8ABC&color=fff",
      },
      {
        name: "فاطمة علي",
        phone: "010222222",
        password: await bcrypt.hash("123456", 12),
        avatar:
          "https://ui-avatars.com/api/?name=Fatma+Ali&background=0D8ABC&color=fff",
      },
      {
        name: "محمد خالد",
        phone: "010333333",
        password: await bcrypt.hash("123456", 12),
        avatar:
          "https://ui-avatars.com/api/?name=Mohamed+Khaled&background=0D8ABC&color=fff",
      },
    ];

    const createdUsers = await User.insertMany(users);
    console.log(`${createdUsers.length} users created`);

    // Create sample store owners
    const storeOwners = [
      {
        name: "متجر أحمد",
        phone: "0104444",
        password: await bcrypt.hash("123456", 12),
      },
      {
        name: "بقالية فاطمة",
        phone: "010555555",
        password: await bcrypt.hash("123456", 12),
      },
      {
        name: "مخبز محمد",
        phone: "010666666",
        password: await bcrypt.hash("123456", 12),
      },
    ];

    const createdStoreOwners = await StoreOwner.insertMany(storeOwners);
    console.log(`${createdStoreOwners.length} store owners created`);

    // Create sample stores
    const stores = [
      {
        name: "بقالية أبو أحمد",
        categoryId: createdCategories[0]._id,
        ownerId: createdStoreOwners[0]._id,
        image:
          "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        phone: "01044444",
        address: "شارع المدرسة، قرية النور",
        description: "بقالية متكاملة تقدم جميع احتياجات المنزل",
        coordinates: {
          lat: 31.2001,
          lng: 29.9187,
        },
        villageId: "village1",
        deliveryTime: "20-30 دقيقة",
        deliveryFee: 10,
        workingHours: {
          from: "08:00",
          to: "22:00",
        },
      },
      {
        name: "فواكه و خضروات فاطمة",
        categoryId: createdCategories[2]._id,
        ownerId: createdStoreOwners[1]._id,
        image:
          "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        phone: "01055555555",
        address: "شارع السوق، قرية النور",
        description: "فواكه و خضروات طازجة يومياً",
        coordinates: {
          lat: 31.1998,
          lng: 29.9192,
        },
        villageId: "village1",
        deliveryTime: "15-25 دقيقة",
        deliveryFee: 15,
        workingHours: {
          from: "07:00",
          to: "21:00",
        },
      },
      {
        name: "مخبز وحلويات محمد",
        categoryId: createdCategories[1]._id,
        ownerId: createdStoreOwners[2]._id,
        image:
          "https://images.unsplash.com/photo-150940159596-024908772ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        phone: "01066666666",
        address: "شارع المصنع، قرية النور",
        description: "مخبز طازج وحلويات متنوعة",
        coordinates: {
          lat: 31.2005,
          lng: 29.9182,
        },
        villageId: "village1",
        deliveryTime: "10-20 دقيقة",
        deliveryFee: 8,
        workingHours: {
          from: "05:00",
          to: "23:00",
        },
      },
    ];

    const createdStores = await Store.insertMany(stores);

    // Update store owners with their store IDs
    for (let i = 0; i < createdStoreOwners.length; i++) {
      createdStoreOwners[i].storeId = createdStores[i]._id;
      await createdStoreOwners[i].save();
    }

    console.log(`${createdStores.length} stores created`);

    // Create sample products
    const products = [
      // Products for store 1 (Grocery)
      {
        storeId: createdStores[0]._id,
        name: "أرز أبيض",
        price: 15,
        image:
          "https://images.unsplash.com/photo-1605522469906-3fe6a546357d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        categoryId: "rice",
        description: "أرز أبيض عالي الجودة",
        isAvailable: true,
      },
      {
        storeId: createdStores[0]._id,
        name: "زيت عباد شمس",
        price: 20,
        image:
          "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        categoryId: "oil",
        description: "زيت عباد شمس نقي",
        isAvailable: true,
      },
      {
        storeId: createdStores[0]._id,
        name: "سكر",
        price: 12,
        image:
          "https://images.unsplash.com/photo-1587132130170-3e4a0a3f0ef7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        categoryId: "sugar",
        description: "سكر ناعم أبيض",
        isAvailable: true,
      },

      // Products for store 2 (Fruits & Vegetables)
      {
        storeId: createdStores[1]._id,
        name: "تفاح أخضر",
        price: 25,
        image:
          "https://images.unsplash.com/photo-1568126852624-1496c37f0120?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        categoryId: "fruits",
        description: "تفاح أخضر طازج",
        isAvailable: true,
      },
      {
        storeId: createdStores[1]._id,
        name: "طماطم",
        price: 8,
        image:
          "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        categoryId: "vegetables",
        description: "طماطم طازجة",
        isAvailable: true,
      },

      // Products for store 3 (Bakery)
      {
        storeId: createdStores[2]._id,
        name: "عيش بلدي",
        price: 5,
        image:
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        categoryId: "bread",
        description: "عيش بلدي طازج",
        isAvailable: true,
      },
      {
        storeId: createdStores[2]._id,
        name: "كعك",
        price: 30,
        image:
          "https://images.unsplash.com/photo-1587132130866-8382b624a1c9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        categoryId: "sweets",
        description: "كعك سكر طازج",
        isAvailable: true,
      },
    ];

    const createdProducts = await Product.insertMany(products);
    console.log(`${createdProducts.length} products created`);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\nSample login credentials:");
    console.log("Customer: Phone: 01011111111, Password: 123456");
    console.log("Customer: Phone: 01022222222, Password: 123456");
    console.log("Customer: Phone: 01033333333, Password: 123456");
    console.log("Store Owner: Phone: 01044444444, Password: 123456");
    console.log("Store Owner: Phone: 01055555555, Password: 123456");
    console.log("Store Owner: Phone: 01066666666, Password: 123456");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

if (args.includes("--clear-only") || args.includes("-c")) {
  options.clearOnly = true;
}

if (args.includes("--skip-confirmation") || args.includes("-f")) {
  options.skipConfirmation = true;
}

// Run the seed function
seedData(options);
