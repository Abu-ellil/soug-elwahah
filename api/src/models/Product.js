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
});

// Index للبحث السريع
productSchema.index({ storeId: 1, isAvailable: 1 });
productSchema.index({ name: "text" }); // للبحث النصي

module.exports = mongoose.model("Product", productSchema);
