const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require("../config/database");

// Import middleware
const errorHandler = require("../middleware/errorHandler");
const notFound = require("../middleware/notFound");

// Import routes
const authRoutes = require("../routes/auth");
const userRoutes = require("../routes/users");
const productRoutes = require("../routes/products");
const serviceRoutes = require("../routes/services");
const storeRoutes = require("../routes/stores");
const orderRoutes = require("../routes/orders");
const messageRoutes = require("../routes/messages");
const reviewRoutes = require("../routes/reviews");
const notificationRoutes = require("../routes/notifications");
const categoryRoutes = require("../routes/categories");
const uploadRoutes = require("../routes/upload");
const testRoutes = require("../routes/test");

// Create Express app
const app = express();

// Connect to database only if not already connected
if (!global.mongooseConnection) {
  connectDB()
    .then(() => {
      global.mongooseConnection = true;
    })
    .catch((err) => {
      console.error("Database connection failed:", err);
    });
}

// Trust proxy (important for Vercel deployment)
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "تم تجاوز الحد المسموح من الطلبات، يرجى المحاولة لاحقاً",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://elsoug.vercel.app",
      "https://elsoug-frontend.vercel.app",
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ].filter(Boolean);

    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    // Allow if origin is in the whitelist
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Otherwise, disable CORS for this request without throwing to avoid 500s
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

// Cookie parsing middleware
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ElSoug API is running successfully",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// API routes
const API_VERSION = process.env.API_VERSION || "v1";

app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/products`, productRoutes);
app.use(`/api/${API_VERSION}/services`, serviceRoutes);
app.use(`/api/${API_VERSION}/stores`, storeRoutes);
app.use(`/api/${API_VERSION}/orders`, orderRoutes);
app.use(`/api/${API_VERSION}/messages`, messageRoutes);
app.use(`/api/${API_VERSION}/reviews`, reviewRoutes);
app.use(`/api/${API_VERSION}/notifications`, notificationRoutes);
app.use(`/api/${API_VERSION}/categories`, categoryRoutes);
app.use(`/api/${API_VERSION}/upload`, uploadRoutes);
app.use(`/api/${API_VERSION}/test`, testRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "مرحباً بك في ElSoug API - نظام السوق المحلي",
    version: API_VERSION,
    endpoints: {
      health: "/health",
      auth: `/api/${API_VERSION}/auth`,
      users: `/api/${API_VERSION}/users`,
      products: `/api/${API_VERSION}/products`,
      services: `/api/${API_VERSION}/services`,
      stores: `/api/${API_VERSION}/stores`,
      orders: `/api/${API_VERSION}/orders`,
      messages: `/api/${API_VERSION}/messages`,
      reviews: `/api/${API_VERSION}/reviews`,
      notifications: `/api/${API_VERSION}/notifications`,
      categories: `/api/${API_VERSION}/categories`,
      upload: `/api/${API_VERSION}/upload`,
    },
    documentation: "https://github.com/ElSoug/backend-api#readme",
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Export the Express app for Vercel
module.exports = app;
