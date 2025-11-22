const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload.middleware");
const { authMiddleware } = require("../middlewares/auth.middleware");
const admin = require("../config/firebase");
const cloudinary = require("../config/cloudinary.config");
const crypto = require('crypto');

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

// Generate Cloudinary signature for signed uploads
router.post('/cloudinary-signature', authMiddleware, (req, res) => {
  try {
    const { timestamp, folder = 'store-images' } = req.body;

    if (!timestamp) {
      return res.status(400).json({
        success: false,
        message: 'Timestamp is required'
      });
    }

    // Parameters to sign
    const params = {
      timestamp: timestamp.toString(),
      folder
    };

    // Generate signature using crypto
    const crypto = require('crypto');
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Sort parameters alphabetically
    const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
    const signatureString = sortedParams + apiSecret;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');

    res.status(200).json({
      success: true,
      data: {
        signature,
        timestamp,
        folder,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY
      }
    });
  } catch (error) {
    console.error('Signature generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate signature'
    });
  }
});

module.exports = router;
