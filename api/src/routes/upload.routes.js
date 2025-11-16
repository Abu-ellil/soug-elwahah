const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const { authMiddleware } = require("../middlewares/auth.middleware");

// Upload image
router.post("/image", authMiddleware, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "الصورة مطلوبة",
    });
  }

  // In a real application, you would upload to Cloudinary here
  // For now, we'll just return the file path
  res.status(200).json({
    success: true,
    data: {
      imageUrl: req.file.path,
    },
    message: "تم رفع الصورة بنجاح",
  });
});

module.exports = router;
