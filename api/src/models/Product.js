const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, required: true },
  categoryId: { type: String, required: true }, // product subcategory
  description: { type: String, default: "" },
  isAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  soldCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  slug: { type: String, unique: true, sparse: true },
});

// Index للبحث السريع
productSchema.index({ storeId: 1, isAvailable: 1 });
productSchema.index({ name: "text" }); // للبحث النصي

// Pre-save middleware to generate slug from product name
productSchema.pre('save', async function(next) {
  if (this.isModified('name') || this.isNew) {
    // Create slug from name: convert to lowercase, replace spaces with hyphens, remove special characters
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    // If slug already exists, add a number to make it unique
    let slugExists = await mongoose.models.Product.findOne({
      slug: this.slug,
      _id: { $ne: this._id } // Exclude current document if updating
    });

    let counter = 1;
    const originalSlug = this.slug;
    while (slugExists) {
      this.slug = `${originalSlug}-${counter}`;
      slugExists = await mongoose.models.Product.findOne({
        slug: this.slug,
        _id: { $ne: this._id } // Exclude current document if updating
      });
      counter++;
    }
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
