// API Configuration for Merchant App
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.4:5000/api";
console.log("API Base URL:", BASE_URL);

// Cloudinary Configuration
const CLOUDINARY_CLOUD_NAME =
  process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME || "your-cloud-name";

export { BASE_URL, CLOUDINARY_CLOUD_NAME };
