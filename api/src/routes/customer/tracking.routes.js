const express = require("express");
const router = express.Router();
const trackingController = require("../../controllers/customer/tracking.controller");

router.get("/:orderId", trackingController.getTrackingDetails);
router.get("/driver/:driverId", trackingController.getDriverLocation);

module.exports = router;
