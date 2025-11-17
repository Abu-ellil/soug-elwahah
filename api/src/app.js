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
  customCss: '.swagger-ui .topbar { display: none }',
  // Explicitly specify the swagger definition URL for serverless environments
  url: '/api-docs/swagger.json'
};

// Serve the swagger document at a specific endpoint for proper access in serverless environments
app.get('/api-docs/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocument);
});

// For serverless environments, serve swagger-ui-dist assets directly to fix MIME type issues
const swaggerUiAssetPath = swaggerUiDist.getAbsoluteFSPath();
app.use('/api-docs', express.static(swaggerUiAssetPath), swaggerUi.setup(swaggerDocument, swaggerOptions));

// 404 handler - This should be last
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use(require("./middlewares/error.middleware"));

module.exports = app;
