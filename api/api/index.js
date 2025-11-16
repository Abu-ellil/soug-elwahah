require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("../src/config/database");
const errorHandler = require("../src/middlewares/error.middleware");

// Connect to database
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In production, add your frontend domains here
    const allowedOrigins = [
      "http://localhost:19006", // Expo web
      "exp://192.168.1.4:19000", // Expo development
      "http://192.168.1.4:19000", // Expo development
      "http://localhost:19000", // Expo development
      "exp://localhost:19000", // Expo development
      "exp://localhost:8081", // Expo development
      "exp://192.168.1.4:8081", // Expo development
      // Add production domains when ready
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "عدد الطلبات كبيرة جداً، يرجى المحاولة لاحقاً",
  },
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Create API router
const router = express.Router();

// Public routes
router.get("/health", (req, res) => {
  res.json({ success: true, message: "API is running" });
});

router.use("/categories", require("../src/routes/category.routes"));
router.use("/upload", require("../src/routes/upload.routes"));

// Auth routes
router.use("/auth", require("../src/routes/auth.routes"));

// User-specific routes
router.use("/customer", require("../src/routes/customer"));
router.use("/store", require("../src/routes/store"));
router.use("/driver", require("../src/routes/driver"));

// Apply router to app
app.use("/api", router);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use(errorHandler);

// Export the handler for Vercel
module.exports = app;
