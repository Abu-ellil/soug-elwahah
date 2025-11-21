const express = require("express");
const {
  updateDriverStatus,
  updateDriverLocation,
  getDriverStatistics,
} = require("../controllers/driverController");
const { protect, authorize } = require("../middleware/auth");
const {
  protectWithMultiRole,
  authorizeForApp,
  setActiveRole,
} = require("../middleware/multiRoleAuth");
const AppError = require("../utils/appError");

const router = express.Router();

// Apply protection to all routes - only drivers can access these routes
router.use(protectWithMultiRole, setActiveRole("driver"));

// Route to update driver status
router.patch("/status", authorizeForApp("driver"), updateDriverStatus);

// Route to update driver location
router.patch("/location", authorizeForApp("driver"), updateDriverLocation);

// Route to get driver statistics
router.get("/statistics", authorizeForApp("driver"), getDriverStatistics);

module.exports = router;
