const express = require("express");
const router = express.Router();
const ordersController = require("../../controllers/driver/orders.controller");

router.get("/available", ordersController.getAvailableOrders);
router.post("/:orderId/accept", ordersController.acceptOrder);
router.get("/active", ordersController.getActiveOrder);
router.patch("/:orderId/status", ordersController.updateOrderStatus);
router.get("/:orderId", ordersController.getOrderDetails);
router.get("/history", ordersController.getOrderHistory);

module.exports = router;
