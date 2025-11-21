const express = require("express");
const { protect } = require("../middleware/auth");
const {
  getMyOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  addOrderReview,
  cancelOrder,
} = require("../controllers/orderController");

const router = express.Router();

// GET /api/v1/orders/my-orders - Get orders for the logged-in user
router.get("/my-orders", protect, getMyOrders);

// GET /api/v1/orders - Get orders for the logged-in user (alternative route)
router.get("/", protect, getMyOrders);

// GET /api/v1/orders/:id - Get a specific order
router.get("/:id", protect, getOrder);

// POST /api/v1/orders - Create a new order
router.post("/", protect, createOrder);

// PUT /api/v1/orders/:id/status - Update order status
router.put("/:id/status", protect, updateOrderStatus);

// PUT /api/v1/orders/:id/payment - Update payment status
router.put("/:id/payment", protect, updatePaymentStatus);

// POST /api/v1/orders/:id/review - Add order review
router.post("/:id/review", protect, addOrderReview);

// PUT /api/v1/orders/:id/cancel - Cancel order
router.put("/:id/cancel", protect, cancelOrder);

module.exports = router;
