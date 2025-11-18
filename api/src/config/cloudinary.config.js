const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: './api/.env' }); // Load .env from api directory

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

module.exports = cloudinary;
