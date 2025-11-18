const express = require("express");
const router = express.Router();
const notificationsController = require("../../controllers/store/notifications.controller");

router.get("/", notificationsController.getNotifications);
router.get("/unread-count", notificationsController.getUnreadCount);
router.patch("/:notificationId/read", notificationsController.markAsRead);
router.patch("/mark-all-read", notificationsController.markAllAsRead);

module.exports = router;
