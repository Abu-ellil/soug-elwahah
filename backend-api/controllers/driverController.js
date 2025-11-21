const User = require("../models/User");
const Delivery = require("../models/Delivery");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const ApiResponse = require("../utils/apiResponse");

// @desc    Update driver status
// @route   PATCH /api/drivers/status
// @access  Private (Driver only)
const updateDriverStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  // Validate required fields
  if (!status) {
    throw new AppError("Status is required", 400);
  }

  // Check if user is a driver
  if (!req.user.roles.includes("driver")) {
    throw new AppError("Only drivers can update their status", 403);
  }

  // Update driver status
  if (!req.user.profile) {
    req.user.profile = {};
  }

  if (!req.user.profile.driver) {
    req.user.profile.driver = {};
  }

  req.user.profile.driver.isAvailable = status === "available";
  req.user.profile.driver.status = status;

  await req.user.save();

  res.status(200).json(
    ApiResponse.success("Driver status updated successfully", {
      driver: {
        _id: req.user._id,
        status: req.user.profile.driver.status,
        isAvailable: req.user.profile.driver.isAvailable,
      },
    })
  );
});

// @desc    Update driver location
// @route   PATCH /api/drivers/location
// @access  Private (Driver only)
const updateDriverLocation = asyncHandler(async (req, res) => {
  const { coordinates, location } = req.body;

  // Be flexible: accept coordinates directly, or within a 'location' or 'coordinates' object.
  let locationData = req.body.location || req.body.coordinates || req.body;
  if (!locationData) {
    throw new AppError("Location coordinates are required", 400);
  }

  // Ensure coordinates are in the right format
  let coords;
  if (Array.isArray(locationData.coordinates)) {
    coords = locationData.coordinates; // [longitude, latitude]
  } else if (locationData.latitude && locationData.longitude) {
    coords = [locationData.longitude, locationData.latitude]; // [longitude, latitude]
  } else {
    coords = locationData;
  }

  if (!Array.isArray(coords) || coords.length !== 2) {
    throw new AppError(
      "Invalid coordinates format. Expected [longitude, latitude]",
      400
    );
  }

  // Check if user is a driver
  if (!req.user.roles.includes("driver")) {
    throw new AppError("Only drivers can update their location", 403);
  }

  // Update driver location
  if (!req.user.profile) {
    req.user.profile = {};
  }

  if (!req.user.profile.driver) {
    req.user.profile.driver = {};
  }

  req.user.profile.driver.currentLocation = {
    type: "Point",
    coordinates: coords,
  };

  await req.user.save();

  res.status(200).json(
    ApiResponse.success("Driver location updated successfully", {
      driver: {
        _id: req.user._id,
        currentLocation: req.user.profile.driver.currentLocation,
      },
    })
  );
});

// @desc    Get driver statistics
// @route   GET /api/drivers/statistics
// @access  Private (Driver only)
const getDriverStatistics = asyncHandler(async (req, res) => {
  const { period = "day" } = req.query;

  // Check if user is a driver
  if (!req.user.roles.includes("driver")) {
    throw new AppError("Only drivers can access their statistics", 403);
  }

  // Define date range based on period
  let startDate, endDate;
  const now = new Date();

  switch (period.toLowerCase()) {
    case "day":
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      break;
    case "week":
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startDate = new Date(
        startOfWeek.getFullYear(),
        startOfWeek.getMonth(),
        startOfWeek.getDate()
      );
      const endOfWeek = new Date(startDate);
      endOfWeek.setDate(startDate.getDate() + 7);
      endDate = endOfWeek;
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
    case "year":
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear() + 1, 0, 1);
      break;
    default:
      throw new AppError("Invalid period. Use day, week, month, or year", 400);
  }

  // Get delivery statistics for the driver in the specified period
  const stats = await Delivery.aggregate([
    {
      $match: {
        driver: req.user._id,
        createdAt: { $gte: startDate, $lt: endDate },
        status: { $in: ["delivered", "failed_delivery", "cancelled"] }, // Only completed deliveries
      },
    },
    {
      $group: {
        _id: null,
        totalDeliveries: { $sum: 1 },
        completedDeliveries: {
          $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
        },
        failedDeliveries: {
          $sum: { $cond: [{ $eq: ["$status", "failed_delivery"] }, 1, 0] },
        },
        cancelledDeliveries: {
          $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
        },
        totalEarnings: { $sum: "$deliveryCost.amount" },
        avgDeliveryTime: { $avg: "$totalDeliveryTime" },
      },
    },
  ]);

  // Get deliveries by status
  const deliveriesByStatus = await Delivery.aggregate([
    {
      $match: {
        driver: req.user._id,
        createdAt: { $gte: startDate, $lt: endDate },
        status: { $in: ["delivered", "failed_delivery", "cancelled"] },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Get recent deliveries (for additional context)
  const recentDeliveries = await Delivery.find({
    driver: req.user._id,
    createdAt: { $gte: startDate, $lt: endDate },
  })
    .populate("order", "orderNumber status totalAmount")
    .populate("customer", "name phone")
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json(
    ApiResponse.success("Driver statistics retrieved successfully", {
      // Changed to 'data' to match frontend expectations
      data: stats[0] || {
        totalOrders: 0, // Changed from totalDeliveries to match frontend
        completedDeliveries: 0,
        failedDeliveries: 0,
        cancelledDeliveries: 0,
        totalEarnings: 0,
        avgDeliveryTime: 0,
      },
      deliveriesByStatus,
      recentDeliveries,
      period,
      startDate,
      endDate,
    })
  );
});

module.exports = {
  updateDriverStatus,
  updateDriverLocation,
  getDriverStatistics,
};
