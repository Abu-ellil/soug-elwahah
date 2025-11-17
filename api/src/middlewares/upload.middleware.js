const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Check if running on Vercel (serverless environment)
const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === "production";

// Configure storage
let storage;
if (isVercel) {
  // For Vercel, we'll use memory storage and handle the file processing in the route
  storage = multer.memoryStorage();
} else {
  // For local development, use disk storage
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync("uploads/")) {
        fs.mkdirSync("uploads/", { recursive: true });
      }
      cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
      // Create unique filename
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  });
}

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("يجب أن يكون الملف صورة"), false);
  }
};

// Create multer instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

module.exports = upload;
