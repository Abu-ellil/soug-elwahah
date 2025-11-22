const express = require("express");
const router = express.Router();
const ordersController = require("../../controllers/customer/orders.controller");

router.post("/", ordersController.createOrder);
router.get("/", ordersController.getMyOrders);
router.get("/:orderId", ordersController.getOrderDetails);
router.patch("/:orderId/cancel", ordersController.cancelOrder);
router.post("/:orderId/reorder", ordersController.reorder);

module.exports = router;
