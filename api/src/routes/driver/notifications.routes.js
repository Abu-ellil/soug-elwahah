const express = require("express");
const router = express.Router();
const notificationsController = require("../../controllers/driver/notifications.controller");

router.get("/", notificationsController.getMyNotifications);
router.patch("/:notificationId/read", notificationsController.markAsRead);
router.post("/token", notificationsController.updateFcmToken);

module.exports = router;
