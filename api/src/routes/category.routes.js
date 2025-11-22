const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      order: 1,
      createdAt: 1,
    });

    res.status(200).json({
      success: true,
      data: { categories },
      message: "تم جلب الفئات بنجاح",
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

module.exports = router;
