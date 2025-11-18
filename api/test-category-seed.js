const mongoose = require("mongoose");
require("dotenv").config();

// Connect to database
const connectDB = require("./src/config/database");

async function seedCategory() {
  try {
    await connectDB();

    const Category = require("./src/models/Category");

    // Check if any categories already exist
    const existingCategory = await Category.findOne();
    if (existingCategory) {
      console.log("Category already exists:", existingCategory);
      mongoose.connection.close();
      return;
    }

    // Create a default category
    const defaultCategory = new Category({
      name: "General",
      name_en: "General",
      description: "Default category for testing",
      description_en: "Default category for testing",
      isActive: true,
    });

    const savedCategory = await defaultCategory.save();
    console.log("Created default category:", savedCategory);

    mongoose.connection.close();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error seeding category:", error);
    mongoose.connection.close();
  }
}

seedCategory();
