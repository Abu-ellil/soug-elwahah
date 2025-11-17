const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

// Initialize Express app
const app = express();

// CORS configuration - Allow specific origins when using credentials
const allowedOrigins = [
  'http://localhost:3000', // Admin app
  'http://localhost:3001', // Alternative port for admin app
  'http://localhost:19006', // Expo development server (for merchant app)
  'http://localhost:19000', // Alternative Expo port
  'http://localhost:3002', // Alternative port for admin app
  'http://localhost:19001', // Alternative Expo port
  process.env.ADMIN_URL || '', // Production admin URL from environment
  process.env.MERCHANT_URL || '', // Production merchant URL from environment
  'https://soug-elwahah.vercel.app' // Production deployment
].filter(url => url); // Remove empty strings

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes 
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Database connection
require("./config/database");

// Serve static files from public directory
app.use(express.static('public'));

// Root route - serve API documentation
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Public routes
app.use("/api/health", (req, res) =>
  res.json({ success: true, message: "API is running" })
);
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/upload", require("./routes/upload.routes"));

// Auth routes
app.use("/api/auth", require("./routes/auth.routes"));

// User-specific routes
app.use("/api/customer", require("./routes/customer"));
app.use("/api/store", require("./routes/store"));
app.use("/api/driver", require("./routes/driver"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/super-admin", require("./routes/superAdmin/superAdmin.routes"));

// 404 handler - This should be last
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use(require("./middlewares/error.middleware"));

module.exports = app;
