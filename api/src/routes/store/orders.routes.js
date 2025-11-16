const express = require("express");
const router = express.Router();
const ordersController = require("../../controllers/store/orders.controller");

router.get("/", ordersController.getStoreOrders);
router.get("/:orderId", ordersController.getOrderDetails);
router.patch("/:orderId/confirm", ordersController.confirmOrder);
router.patch("/:orderId/cancel", ordersController.cancelOrder);

module.exports = router;
