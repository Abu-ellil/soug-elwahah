const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes 
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);
  
// CORS configuration - Allow all origins for API documentation access
app.use(
  cors({
    origin: "*", // Allow all origins for API documentation and general access
    credentials: true,
  })
);

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

// 404 handler - This should be last
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use(require("./middlewares/error.middleware"));

module.exports = app;
