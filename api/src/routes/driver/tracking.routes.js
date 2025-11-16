const express = require("express");
const router = express.Router();
const trackingController = require("../../controllers/driver/tracking.controller");

router.patch("/location", trackingController.updateLocation);
router.get("/route/:orderId", trackingController.getOrderRouteInfo);

module.exports = router;
