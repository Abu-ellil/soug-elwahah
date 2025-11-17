const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const { authMiddleware } = require("../middlewares/auth.middleware");
const admin = require("../config/firebase");

// Upload image
router.post(
  "/image",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "الصورة مطلوبة",
      });
    }

    try {
      let imageUrl = "";

      if (req.file.path) {
        // File was uploaded to disk (local environment), use its path
        imageUrl = req.file.path;
      } else if (req.file.buffer) {
        // File is in memory (serverless environment), upload to Firebase Storage
        if (admin && admin.storage) {
          const bucket = admin.storage().bucket(); // Get the default bucket
          const fileName = `uploaded-images/image-${Date.now()}-${Math.round(
            Math.random() * 1e9
          )}-${req.file.originalname}`;
          const file = bucket.file(fileName);

          const stream = file.createWriteStream({
            metadata: {
              contentType: req.file.mimetype,
            },
          });

          await new Promise((resolve, reject) => {
            stream.on("error", reject);
            stream.on("finish", resolve);
            stream.end(req.file.buffer);
          });

          // Make the file publicly readable
          await file.makePublic();

          // Get the public URL
          imageUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        } else {
          // Firebase not configured, return error
          return res.status(400).json({
            success: false,
            message: "لا يمكن رفع الصورة في الوقت الحالي",
          });
        }
      }

      res.status(200).json({
        success: true,
        data: {
          imageUrl: imageUrl,
        },
        message: "تم رفع الصورة بنجاح",
      });
    } catch (error) {
      console.error("Upload route error:", error);
      res.status(500).json({
        success: false,
        message: "حدث خطأ أثناء رفع الصورة",
      });
    }
  }
);

module.exports = router;
