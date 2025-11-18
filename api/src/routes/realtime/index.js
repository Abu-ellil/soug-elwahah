const express = require("express");
const router = express.Router();
const { sendRealTimeNotification, joinNotificationRoom, getWebSocketStatus } = require("../../controllers/realtime/notifications.controller");

// Real-time notification routes
router.post("/notifications", sendRealTimeNotification);
router.post("/join-notifications", joinNotificationRoom);
router.get("/status", getWebSocketStatus);

module.exports = router;