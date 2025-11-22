const mongoose = require("mongoose");
require("dotenv").config();

// Connect to MongoDB
const connectDB = require("./src/config/database");

connectDB().then(async () => {
  console.log("Database connected");

  // Import the Product model
  const Product = require("./src/models/Product");

  try {
    // Find all products without a slug
    const products = await Product.find({ slug: { $exists: false } });
    console.log(`Found ${products.length} products without a slug`);

    for (const product of products) {
      // Generate slug from product name
      let slug = product.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

      // Check if slug already exists
      let slugExists = await Product.findOne({
        slug: slug,
        _id: { $ne: product._id } // Exclude current document
      });

      let counter = 1;
      const originalSlug = slug;
      while (slugExists) {
        slug = `${originalSlug}-${counter}`;
        slugExists = await Product.findOne({
          slug: slug,
          _id: { $ne: product._id } // Exclude current document
        });
        counter++;
      }

      // Update the product with the new slug
      product.slug = slug;
      await product.save();
      console.log(`Updated product ${product._id} with slug: ${slug}`);
    }

    console.log("All products have been updated with slugs");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing product slugs:", error);
    process.exit(1);
  }
});
