const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");
const swaggerUiDist = require("swagger-ui-dist");
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
 
// CORS configuration
const allowedOrigins = [
  "exp://192.168.x.x:19000", // Expo Dev
  "http://localhost:19006", // Expo Web
  "http://localhost:19000", // Expo Dev
  "http://localhost:3000", // Web app
  "http://localhost:3001", // Web app
  process.env.FRONTEND_URL, // Production URL if available
].filter(Boolean); // Remove undefined values

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Database connection
require("./config/database");

// Root route - redirect to API documentation
app.get("/", (req, res) => {
  res.redirect("/api-docs");
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

// Serve Swagger documentation - IMPORTANT: This must be before the wildcard route
const swaggerOptions = {
  explorer: true, // Enables the explorer functionality to interact with the API
  // Set custom CSS to ensure proper loading in serverless environments
  customCss: '.swagger-ui .topbar { display: none }'
};

// For serverless environments, serve swagger-ui-dist assets directly
const swaggerUiAssetPath = swaggerUiDist.getAbsoluteFSPath();
app.use('/api-docs', express.static(swaggerUiAssetPath), swaggerUi.setup(swaggerDocument, swaggerOptions));

// 404 handler - This should be last
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use(require("./middlewares/error.middleware"));

module.exports = app;
